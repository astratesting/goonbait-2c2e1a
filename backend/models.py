from datetime import date, datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base, utcnow

class UserRole(str, Enum):
    accountant = "accountant"
    manager = "manager"
    partner = "partner"
    admin = "admin"

class InvoiceStatus(str, Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    rejected = "rejected"
    synced = "synced"

class Firm(Base):
    __tablename__ = "firms"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    users: Mapped[list["User"]] = relationship(back_populates="firm")

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    firm_id: Mapped[int] = mapped_column(ForeignKey("firms.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default=UserRole.accountant.value)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    firm: Mapped[Firm] = relationship(back_populates="users")

class ApprovalChain(Base):
    __tablename__ = "approval_chains"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firm_id: Mapped[int] = mapped_column(ForeignKey("firms.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    steps: Mapped[list["ApprovalStep"]] = relationship(back_populates="approval_chain", cascade="all, delete-orphan")

class ApprovalStep(Base):
    __tablename__ = "approval_steps"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    approval_chain_id: Mapped[int] = mapped_column(ForeignKey("approval_chains.id"), nullable=False)
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    approver_role: Mapped[str] = mapped_column(String(50), nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    approval_chain: Mapped[ApprovalChain] = relationship(back_populates="steps")

class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firm_id: Mapped[int] = mapped_column(ForeignKey("firms.id"), nullable=False)
    vendor: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=InvoiceStatus.draft.value)
    category: Mapped[str] = mapped_column(String(100), default="Uncategorized")
    category_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    file_url: Mapped[str] = mapped_column(String(500), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    approval_chain_id: Mapped[Optional[int]] = mapped_column(ForeignKey("approval_chains.id"), nullable=True)
    current_step: Mapped[int] = mapped_column(Integer, default=0)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

class Correction(Base):
    __tablename__ = "corrections"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firm_id: Mapped[int] = mapped_column(ForeignKey("firms.id"), nullable=False)
    keyword: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    firm_name: str
    role: UserRole = UserRole.admin

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    firm_id: int
    role: str
    created_at: datetime
    model_config = {"from_attributes": True}

class ApprovalStepCreate(BaseModel):
    step_order: int
    approver_role: UserRole
    is_required: bool = True

class ApprovalChainCreate(BaseModel):
    name: str
    description: str = ""
    is_active: bool = True
    steps: list[ApprovalStepCreate]

class InvoiceCreate(BaseModel):
    vendor: str
    amount: float = Field(gt=0)
    currency: str = "USD"
    invoice_date: date
    due_date: date
    file_url: str = ""
    notes: str = ""
    approval_chain_id: Optional[int] = None

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    approval_chain_id: Optional[int] = None
    current_step: Optional[int] = None

class CategoryPreview(BaseModel):
    vendor: str
    notes: str = ""

class CorrectionCreate(BaseModel):
    keyword: str
    category: str

class SyncRequest(BaseModel):
    invoice_id: int

class InvoiceResponse(BaseModel):
    id: int
    firm_id: int
    vendor: str
    amount: float
    currency: str
    invoice_date: date
    due_date: date
    status: str
    category: str
    category_confidence: float
    file_url: str
    notes: str
    approval_chain_id: Optional[int]
    current_step: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
