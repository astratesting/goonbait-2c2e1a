from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    ApprovalChain,
    ApprovalChainCreate,
    ApprovalStep,
    CategoryPreview,
    Correction,
    CorrectionCreate,
    Invoice,
    InvoiceCreate,
    InvoiceResponse,
    InvoiceStatus,
    InvoiceUpdate,
    SyncRequest,
    User,
)
from .auth import get_current_user

router = APIRouter(prefix="/api", tags=["api"])

BASE_RULES = {
    "Software": ["software", "saas", "subscription", "cloud", "stripe", "github", "notion"],
    "Travel": ["air", "hotel", "uber", "lyft", "delta", "flight", "lodging"],
    "Office Supplies": ["office", "paper", "printer", "depot", "supplies", "staples"],
    "Professional Services": ["legal", "consulting", "audit", "tax", "advisory", "bookkeeping"],
}


def categorize(db: Session, firm_id: int, vendor: str, notes: str) -> tuple[str, float]:
    text = f"{vendor} {notes}".lower()
    rules = {category: keywords[:] for category, keywords in BASE_RULES.items()}
    for correction in db.query(Correction).filter(Correction.firm_id == firm_id).all():
        rules.setdefault(correction.category, []).append(correction.keyword.lower())
    scores = {category: sum(1 for keyword in keywords if keyword in text) for category, keywords in rules.items()}
    best_category, best_score = max(scores.items(), key=lambda item: item[1])
    if best_score == 0:
        return "Uncategorized", 0.35
    confidence = min(0.98, 0.72 + best_score * 0.08)
    return best_category, round(confidence, 2)


@router.post("/categorize")
def preview_category(payload: CategoryPreview, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category, confidence = categorize(db, current_user.firm_id, payload.vendor, payload.notes)
    return {"category": category, "confidence": confidence}


@router.post("/corrections")
def create_correction(payload: CorrectionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    correction = Correction(firm_id=current_user.firm_id, keyword=payload.keyword.lower(), category=payload.category)
    db.add(correction)
    db.commit()
    return {"id": correction.id, "keyword": correction.keyword, "category": correction.category}


@router.post("/approval-chains")
def create_approval_chain(payload: ApprovalChainCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chain = ApprovalChain(firm_id=current_user.firm_id, name=payload.name, description=payload.description, is_active=payload.is_active)
    db.add(chain)
    db.flush()
    for step in sorted(payload.steps, key=lambda item: item.step_order):
        db.add(ApprovalStep(
            approval_chain_id=chain.id,
            step_order=step.step_order,
            approver_role=step.approver_role.value,
            is_required=step.is_required,
        ))
    db.commit()
    db.refresh(chain)
    return {
        "id": chain.id,
        "name": chain.name,
        "description": chain.description,
        "is_active": chain.is_active,
        "steps": [{"id": step.id, "step_order": step.step_order, "approver_role": step.approver_role, "is_required": step.is_required} for step in chain.steps],
    }


@router.get("/approval-chains")
def list_approval_chains(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chains = db.query(ApprovalChain).filter(ApprovalChain.firm_id == current_user.firm_id).all()
    return [
        {
            "id": chain.id,
            "name": chain.name,
            "description": chain.description,
            "is_active": chain.is_active,
            "steps": sorted([
                {"id": step.id, "step_order": step.step_order, "approver_role": step.approver_role, "is_required": step.is_required}
                for step in chain.steps
            ], key=lambda step: step["step_order"]),
        }
        for chain in chains
    ]


@router.post("/invoices", response_model=InvoiceResponse)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category, confidence = categorize(db, current_user.firm_id, payload.vendor, payload.notes)
    invoice = Invoice(
        firm_id=current_user.firm_id,
        vendor=payload.vendor,
        amount=payload.amount,
        currency=payload.currency,
        invoice_date=payload.invoice_date,
        due_date=payload.due_date,
        status=InvoiceStatus.pending_approval.value if payload.approval_chain_id else InvoiceStatus.draft.value,
        category=category,
        category_confidence=confidence,
        file_url=payload.file_url,
        notes=payload.notes,
        approval_chain_id=payload.approval_chain_id,
        current_step=1 if payload.approval_chain_id else 0,
        created_by=current_user.id,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/invoices", response_model=list[InvoiceResponse])
def list_invoices(
    status: InvoiceStatus | None = None,
    category: str | None = None,
    vendor: str | None = None,
    min_amount: float | None = Query(default=None, ge=0),
    max_amount: float | None = Query(default=None, ge=0),
    date_from: date | None = None,
    date_to: date | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Invoice).filter(Invoice.firm_id == current_user.firm_id)
    if status:
        query = query.filter(Invoice.status == status.value)
    if category:
        query = query.filter(Invoice.category == category)
    if vendor:
        query = query.filter(Invoice.vendor.ilike(f"%{vendor}%"))
    if min_amount is not None:
        query = query.filter(Invoice.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Invoice.amount <= max_amount)
    if date_from:
        query = query.filter(Invoice.invoice_date >= date_from)
    if date_to:
        query = query.filter(Invoice.invoice_date <= date_to)
    if q:
        pattern = f"%{q}%"
        query = query.filter((Invoice.vendor.ilike(pattern)) | (Invoice.notes.ilike(pattern)) | (Invoice.category.ilike(pattern)))
    return query.order_by(Invoice.created_at.desc()).all()


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.firm_id == current_user.firm_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.patch("/invoices/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.firm_id == current_user.firm_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(invoice, key, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/integrations/quickbooks/sync")
def quickbooks_sync(payload: SyncRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == payload.invoice_id, Invoice.firm_id == current_user.firm_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = InvoiceStatus.synced.value
    db.commit()
    return {"provider": "quickbooks", "status": "mock_synced", "invoice_id": invoice.id}


@router.post("/integrations/xero/sync")
def xero_sync(payload: SyncRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == payload.invoice_id, Invoice.firm_id == current_user.firm_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = InvoiceStatus.synced.value
    db.commit()
    return {"provider": "xero", "status": "mock_synced", "invoice_id": invoice.id}
