from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Student
from auth import current_student
import ml

router = APIRouter(prefix="/api")

@router.get("/predict/spending")
def predict_spending(db: Session = Depends(get_db), s: Student = Depends(current_student)):
    return ml.predict_spending(db, s.id, s.monthly_budget)