from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import api, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Goonbait API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(api.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "goonbait-api"}
