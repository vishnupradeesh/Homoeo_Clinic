from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api import router
from app.database import init_db
from app.mcp_server import mcp


# Load SMTP / Twilio credentials from backend/.env when present.
load_dotenv()


app = FastAPI(
    title="Full Stack MCP Application",
    version="1.0.0",
)


init_db()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)


@app.get("/health")
def health():

    return {
        "status": "ok"
    }
