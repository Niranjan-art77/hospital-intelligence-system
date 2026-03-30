# Health Intelligence System

This project consists of a **React (Vite)** frontend and a **Java (Spring Boot)** backend, prepared for deployment on **Render**.

## 🚀 Deployment on Render

### Backend (Java Spring Boot)

The backend is built with Java 17 and Spring Boot. It uses an embedded H2 database seeded with demo data.

1. **Create a Render Account**: Sign up at [Render.com](https://render.com/).
2. **Create a New Web Service**: Choose "Deploy from GitHub repo".
3. **Select the Repository**: Choose this repository.
4. **Configure Settings**:
   - **Runtime**: Java
   - **Build Command**: `chmod +x mvnw && ./mvnw clean package -DskipTests`
   - **Start Command**: `java -Dserver.port=$PORT -jar target/hospital-intelligence-0.0.1-SNAPSHOT.jar`
5. **Set Environment Variables**:
   - `PORT=8080`
6. **Deploy**: Render will build the JAR and start the server.
7. **Copy URL**: Once deployed, copy your Render public URL (e.g., `https://hospital-backend.onrender.com`).

### Frontend (React Static Site)

The frontend is built with React and Vite. It connects to the backend via the `VITE_API_URL` environment variable.

1. **Create a New Static Site** on Render (or use Vercel/Netlify).
2. **Configure Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. **Set Environment Variables**:
   - `VITE_API_URL` = your backend URL + `/api` (e.g., `https://hospital-backend.onrender.com/api`)
4. **Deploy**: The frontend will be built and served as a static site.

> **Tip**: You can also use the included `render.yaml` for automatic Blueprint deployment — just connect your repo and Render will set up both services.

## ⚙️ Local Development Setup

### 1. Terminal 1: Backend (Spring Boot)

**Option A — Using start-backend.ps1 (Windows, auto-downloads JDK & Maven):**
```powershell
.\start-backend.ps1
```

**Option B — If you have Java 17 & Maven installed:**
```bash
./mvnw clean spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. Terminal 2: Frontend (Vite)

Create a `.env.local` file in the root folder:
```env
VITE_API_URL=http://localhost:8080/api
```

Run the dev server:
```bash
npm install
npm run dev
```
*Frontend runs on Vite's default port (usually `http://localhost:5173`).*

## Features
- Interactive Dashboard with Chart.js & Recharts
- Real-time Collapsible Sidebar
- Rule-based AI Symptom Checker
- Medical Reports with PDF Generation
- DB-based Messaging System
- Doctor, Patient, Billing, Pharmacy Management
- Bed Management & Live Monitoring
- JWT Authentication & Role-based Security
- QR Code Health Cards
