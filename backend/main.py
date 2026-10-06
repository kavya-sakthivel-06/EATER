import os
from datetime import datetime, date
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Student, Canteen, Food, FoodLog
from auth import verify_password, make_token, current_student

Base.metadata.create_all(engine)
app = FastAPI(title="Eater API")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
                   allow_methods=["*"], allow_headers=["*"])

class LoginIn(BaseModel):
    email: str
    password: str

class LogIn(BaseModel):
    food_id: int
    quantity: int = Field(ge=1, le=20)   # whole units only

def food_dict(f: Food):
    return {c.name: getattr(f, c.name) for c in f.__table__.columns}

@app.post("/api/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    s = db.query(Student).filter(Student.email == body.email.lower().strip()).first()
    if not s or not verify_password(body.password, s.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return {"token": make_token(s.id), "name": s.name}

@app.get("/api/canteens")
def canteens(db: Session = Depends(get_db), _=Depends(current_student)):
    return [{"id": c.id, "name": c.name} for c in db.query(Canteen).all()]

@app.get("/api/foods")
def foods(canteen_id: int | None = None, db: Session = Depends(get_db), _=Depends(current_student)):
    q = db.query(Food)
    if canteen_id:
        q = q.filter(Food.canteen_id == canteen_id)
    return [food_dict(f) for f in q.order_by(Food.name).all()]

@app.post("/api/food-logs", status_code=201)
def add_log(body: LogIn, db: Session = Depends(get_db), s: Student = Depends(current_student)):
    f = db.get(Food, body.food_id)
    if not f:
        raise HTTPException(404, "Food not found")
    q = body.quantity
    log = FoodLog(student_id=s.id, food_id=f.id, quantity=q, cost=f.price * q, calories=f.calories * q,
                  protein=f.protein * q, carbs=f.carbs * q, fat=f.fat * q)
    db.add(log); db.commit()
    return {"id": log.id, "cost": log.cost, "calories": log.calories, "protein": log.protein}

@app.get("/api/food-logs/today")
def today_logs(db: Session = Depends(get_db), s: Student = Depends(current_student)):
    start = datetime.combine(date.today(), datetime.min.time())
    rows = (db.query(FoodLog, Food.name).join(Food, Food.id == FoodLog.food_id)
            .filter(FoodLog.student_id == s.id, FoodLog.logged_at >= start).order_by(FoodLog.logged_at.desc()).all())
    return [{"id": l.id, "name": n, "quantity": l.quantity, "cost": l.cost, "calories": l.calories} for l, n in rows]

@app.get("/api/summary")
def summary(db: Session = Depends(get_db), s: Student = Depends(current_student)):
    today = date.today()
    day_start = datetime.combine(today, datetime.min.time())
    month_start = datetime(today.year, today.month, 1)
    def totals(since):
        r = db.query(func.coalesce(func.sum(FoodLog.cost), 0), func.coalesce(func.sum(FoodLog.calories), 0),
                     func.coalesce(func.sum(FoodLog.protein), 0), func.coalesce(func.sum(FoodLog.carbs), 0),
                     func.coalesce(func.sum(FoodLog.fat), 0)).filter(FoodLog.student_id == s.id, FoodLog.logged_at >= since).one()
        return {"spend": int(r[0]), "calories": int(r[1]), "protein": round(r[2], 1), "carbs": round(r[3], 1), "fat": round(r[4], 1)}
    weeks = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for l in db.query(FoodLog).filter(FoodLog.student_id == s.id, FoodLog.logged_at >= month_start):
        weeks[(l.logged_at.day - 1) // 7 + 1] += l.cost
    month = totals(month_start)
    days = max(today.day, 1)
    return {"name": s.name, "budget": s.monthly_budget, "today": totals(day_start), "month": month,
            "weekly": [{"week": w, "spend": v} for w, v in weeks.items() if w <= 4 or v],
            "avg_daily_spend": round(month["spend"] / days, 1)}

@app.get("/api/recommend")
def recommend(mode: str = Query("protein"), db: Session = Depends(get_db), _=Depends(current_student)):
    foods = db.query(Food).all()
    tag_modes = {"spicy", "sweet", "healthy", "light"}
    if mode in tag_modes:
        foods = sorted([f for f in foods if mode in (f.tags or "").split(",")], key=lambda f: f.calories)
    elif mode == "protein":
        foods = sorted(foods, key=lambda f: -f.protein)
    elif mode == "budget":
        foods = sorted(foods, key=lambda f: f.price)
    elif mode == "protein_budget":
        foods = sorted(foods, key=lambda f: -(f.protein / f.price))
    else:
        raise HTTPException(400, "Unknown mode")
    names = {c.id: c.name for c in db.query(Canteen)}
    return [{**food_dict(f), "canteen": names.get(f.canteen_id), "protein_per_rupee": round(f.protein / f.price, 2)} for f in foods[:6]]
