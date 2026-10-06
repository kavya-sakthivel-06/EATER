# Eater – campus canteen spend & nutrition tracker

## Run locally
**Backend** (http://localhost:8000, docs at /docs)
```
cd backend
python -m venv .venv && .venv\Scripts\activate      # Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env                               # Mac/Linux: cp
python seed.py
uvicorn main:app --reload
```
**Frontend** (http://localhost:5173)
```
cd frontend
npm install
copy .env.example .env
npm run dev
```
Demo login: `kavya@vit.ac.in` / `student123`

## Deploy
- DB: Supabase/Neon -> copy the connection string into `DATABASE_URL`
- Backend: Render/Railway, start command `uvicorn main:app --host 0.0.0.0 --port $PORT`, set `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`
- Frontend: Vercel, set `VITE_API_URL` to the backend URL
