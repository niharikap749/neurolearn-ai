from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3

from auth_utils import hash_password, verify_password

router = APIRouter()

DB_NAME = "neurolearn.db"


class UserRegister(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(user: UserRegister):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)

    cursor.execute(
        "SELECT * FROM users WHERE email=?",
        (user.email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(user.password) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password must be 72 characters or less"
        )

    hashed = hash_password(user.password)

    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        (user.name, user.email, hashed)
    )

    conn.commit()
    conn.close()

    return {
        "message": "User registered successfully"
    }


@router.post("/login")
def login(user: UserLogin):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=?",
        (user.email,)
    )

    db_user = cursor.fetchone()

    conn.close()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    stored_password = db_user[3]

    if not verify_password(
        user.password,
        stored_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user": {
            "id": db_user[0],
            "name": db_user[1],
            "email": db_user[2]
        }
    }