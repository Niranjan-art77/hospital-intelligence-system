# Health Intelligence System

This project consists of a React (Vite) frontend and a Python (Flask) backend, prepared for automatic deployment using Vercel and Railway.

## 🚂 Backend Deployment (Railway)

The backend is built with Python 3 and Flask. It uses a local SQLite database by default, seeded with dummy data for Doctors, Bills, and Reports.

1. **Create a Railway Account**: Sign up at [Railway.app](https://railway.app/).
2. **Create a New Project**: Choose "Deploy from GitHub repo".
3. **Select the Repository**: Choose the repository containing this project.
4. **Configure Root Directory**: In settings, change the **Root Directory** to `/backend`.
5. **Set Environment Variables**: 
   - `PORT=5000`
6. **Automatic Build & Deploy**: Railway will automatically detect the `requirements.txt` and `Procfile` (`web: gunicorn app:app`) and deploy the Flask server.
7. **Copy URL**: Once deployed, copy your Railway public URL (e.g., `https://health-intelligence-production.up.railway.app`).

## 🌐 Frontend Deployment (Vercel)

The frontend is built with React and Vite. It is configured to automatically route all API calls to the backend using environment variables.

1. **Create a Vercel Account**: Sign up at [Vercel.com](https://vercel.com/).
2. **Create a New Project**: Import the same GitHub repository.
3. **Configure Build Settings**: Vercel will automatically detect Vite. 
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Set Environment Variables**:
   - Add `VITE_API_URL` and set its value to your Railway Backend URL appended with `/api` (e.g., `https://health-intelligence-production.up.railway.app/api`).
5. **Deploy**: Click deploy. Vercel will build and serve your frontend, with API requests securely pointed to your Railway backend.

## ⚙️ Local Development Setup

To run the full stack locally:

### 1. Terminal 1: Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*Backend runs on `http://localhost:5000`*

### 2. Terminal 2: Frontend
Create a `.env.local` file in the root folder (or rename `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

Run the dev server:
```bash
npm install
npm run dev
```
*Frontend runs on Vite's default port (usually `http://localhost:5173`).*

## features
- Interactive Dashboard with Chart.js
- Real-time Collapsible Sidebar
- Rule-based AI Symptom Checker
- Medical Reports (Base64) with automated PDF Generation (Reportlab)
- DB-based Messaging System with SQLite
