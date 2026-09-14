"""
main.py

This file creates the FastAPI application and connects the routers
No business logic. No ML. Just app setup
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.email_router import router as email_router
from app.api.url_router import router as url_router

app = FastAPI(
    title="PhishGuard API",
    version="0.1.0",
)

# Allow the React frontend to call this API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # common React default
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8080",  # Docker frontend (nginx)
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(email_router)
app.include_router(url_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """
    Simple health endpoint so you can confirm the server is up.

    Returns:
        A small JSON payload with status ok.
    """
    return {"status": "ok"}