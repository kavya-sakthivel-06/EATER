import calendar
from datetime import date
import pandas as pd
from sklearn.linear_model import LinearRegression
from models import FoodLog, Food, Canteen


def logs_df(db, student_id=None):
    q = (
        db.query(
            FoodLog.student_id,
            FoodLog.food_id,
            FoodLog.quantity,
            FoodLog.cost,
            FoodLog.calories,
            FoodLog.protein,
            FoodLog.logged_at,
            Food.name,
            Food.tags,
            Canteen.name.label("canteen")
        )
        .join(Food, Food.id == FoodLog.food_id)
        .join(Canteen, Canteen.id == Food.canteen_id)
    )

    if student_id:
        q = q.filter(FoodLog.student_id == student_id)

    df = pd.read_sql(q.statement, db.get_bind())
    df["logged_at"] = pd.to_datetime(df["logged_at"])
    return df


def _daily(db, sid):
    l = logs_df(db, sid)

    if l.empty:
        return l

    l["day"] = l.logged_at.dt.date

    return (
        l.groupby("day")
        .agg(
            spend=("cost", "sum"),
            calories=("calories", "sum"),
            protein=("protein", "sum")
        )
        .reset_index()
    )


def predict_spending(db, sid, budget):
    today = date.today()

    d = _daily(db, sid)

    d = (
        d[
            d.day.apply(
                lambda x: x.year == today.year and x.month == today.month
            )
        ]
        if not d.empty
        else d
    )

    days_in_month = calendar.monthrange(
        today.year,
        today.month
    )[1]

    if d.empty:
        return {
            "message": "Log some meals this month to get a prediction."
        }

    so_far = int(d.spend.sum())

    full = pd.DataFrame({
        "day": range(1, today.day + 1)
    })

    full["spend"] = full.day.map(
        {x.day: s for x, s in zip(d.day, d.spend)}
    ).fillna(0)

    cum = full.spend.cumsum()

    if today.day >= 7:
        model = LinearRegression().fit(
            full[["day"]],
            cum
        )

        proj = float(
            model.predict([[days_in_month]])[0]
        )

        method = "linear regression on cumulative spend"

    else:
        proj = (
            so_far
            / today.day
            * days_in_month
        )

        method = "daily average (too early for a regression)"

    proj = max(proj, so_far)

    return {
        "spend_so_far": so_far,
        "projected": round(proj),
        "budget": budget,
        "over_budget": proj > budget,
        "method": method
    }