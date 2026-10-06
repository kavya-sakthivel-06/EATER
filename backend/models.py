from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from database import Base

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    monthly_budget = Column(Integer, default=4000)

class Canteen(Base):
    __tablename__ = "canteens"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

class Food(Base):
    __tablename__ = "foods"
    id = Column(Integer, primary_key=True)
    canteen_id = Column(Integer, ForeignKey("canteens.id"), index=True)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    calories = Column(Integer, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    tags = Column(String, default="")  # comma separated: spicy,sweet,healthy,light

class FoodLog(Base):
    __tablename__ = "food_logs"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), index=True)
    food_id = Column(Integer, ForeignKey("foods.id"))
    quantity = Column(Integer, nullable=False)
    cost = Column(Integer, nullable=False)       # price x quantity, stored at log time
    calories = Column(Integer, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    logged_at = Column(DateTime, default=datetime.now, index=True)
