from database import Base, engine, SessionLocal
from models import Student, Canteen, Food
from auth import hash_password

Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
db = SessionLocal()
db.add_all([Student(name="Kavya", email="kavya@vit.ac.in", password_hash=hash_password("student123"), monthly_budget=4000),
            Student(name="Demo Student", email="demo@vit.ac.in", password_hash=hash_password("student123"), monthly_budget=3000)])
# name, price, kcal, protein, carbs, fat, tags  (approximate values - replace with your own verified data)
menu = {
 "Main Canteen": [("Idli (2 pcs)",40,130,4,28,0.5,"healthy,light"),("Masala Dosa",60,350,8,52,12,"spicy"),
                  ("Paneer Roll",60,280,10,32,11,"spicy"),("Veg Puff",20,180,3,20,10,""),
                  ("Tea",12,60,1.5,9,2,"sweet"),("Filter Coffee",15,70,2,10,2.5,"sweet")],
 "Food Court": [("Veg Sandwich",50,250,8,35,8,"light"),("Burger",80,380,12,45,16,""),
                ("Pizza Slice",70,300,11,34,12,""),("Egg Puff",25,200,7,18,11,"spicy"),
                ("Chicken Roll",90,360,20,34,15,"spicy,protein")],
 "Juice Corner": [("Lime Juice",25,90,0.5,22,0,"light,healthy"),("Orange Juice",40,110,1.5,26,0.5,"healthy,sweet"),
                  ("Milkshake",60,320,9,42,12,"sweet"),("Sprouts Bowl",35,150,10,22,2,"healthy,light")],
}
for cname, items in menu.items():
    c = Canteen(name=cname); db.add(c); db.flush()
    for n, p, k, pr, cb, ft, t in items:
        db.add(Food(canteen_id=c.id, name=n, price=p, calories=k, protein=pr, carbs=cb, fat=ft, tags=t))
db.commit(); print("Seeded.")
