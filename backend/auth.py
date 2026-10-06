import os, hashlib, hmac, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import Student

SECRET = os.getenv("SECRET_KEY", "dev-secret")
bearer = HTTPBearer()

def hash_password(pw: str) -> str:
    salt = os.urandom(16)
    return salt.hex() + ":" + hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 200_000).hex()

def verify_password(pw: str, stored: str) -> bool:
    salt, digest = stored.split(":")
    new = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), 200_000).hex()
    return hmac.compare_digest(new, digest)

def make_token(student_id: int) -> str:
    return jwt.encode({"sub": str(student_id), "exp": datetime.utcnow() + timedelta(days=7)}, SECRET, "HS256")

def current_student(cred: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> Student:
    try:
        sid = int(jwt.decode(cred.credentials, SECRET, ["HS256"])["sub"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    student = db.get(Student, sid)
    if not student:
        raise HTTPException(401, "Unknown user")
    return student
