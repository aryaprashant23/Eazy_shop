# Deployment Plan: Eazy Shop

This document outlines the step-by-step process for deploying the Eazy Shop application to the internet using free-tier cloud services. 

The architecture involves migrating the database to **Supabase** (PostgreSQL), hosting the backend on **Render**, and hosting both frontends on **Vercel**.

---

## Phase 1: GitHub Integration (The Foundation)
Because modern cloud providers (Vercel and Render) pull code directly from GitHub, everything starts here.

1. **Create Repository**: Go to GitHub and create a new, private repository named `eazy-shop`.
2. **Ignore Secrets**: Ensure your `.env` files are added to `.gitignore`. **Never push your Groq API key or JWT secret to GitHub.**
3. **Commit & Push**: Commit your entire local workspace (backend, frontend-app, frontend-admin, docs) and push it to the main branch of your new GitHub repository.

---

## Phase 2: Database Integration (Supabase)
We are currently using SQLite (a local file). Cloud servers like Render wipe local files when they restart. We must migrate to a professional cloud database.

1. **Create Supabase Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2. **Get Connection String**: Once the project provisions, go to Settings > Database and copy the `URI` connection string (PostgreSQL).
3. **Migrate Backend Code**: 
   - Install the PostgreSQL driver in your backend: `npm install pg`
   - Rewrite `backend/database.js` to connect to Supabase instead of the local SQLite file.
4. **Create Tables**: Run a one-time SQL script in the Supabase Dashboard SQL Editor to recreate your tables: `users`, `products`, `orders`, and `cart_items`.

---

## Phase 3: Backend Deployment (Render)
The backend acts as the bridge between your database, the AI (Groq), and your frontends.

1. **Create Web Service**: Go to [Render](https://render.com/) and create a new "Web Service".
2. **Connect GitHub**: Select your `eazy-shop` GitHub repository.
3. **Configure Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Set Environment Variables**:
   - `DATABASE_URL` = (Your Supabase Connection String)
   - `JWT_SECRET` = (Your secure secret)
   - `GROQ_API_KEY` = (Your Groq API Key)
5. **CORS Setup**: Once Render gives you a live URL (e.g., `https://eazy-shop-backend.onrender.com`), update your `server.js` CORS settings to securely allow traffic only from your upcoming Vercel domains.
6. **Deploy**: Click Deploy. Monitor the logs to ensure the server starts successfully.

---

## Phase 4: Frontend Deployments (Vercel)
We have two separate React applications. Both will be hosted on Vercel.

### 4A: Prepare Frontend Code
1. **Dynamic API URLs**: In both `frontend-app` and `frontend-admin`, modify the `fetch()` calls to use an environment variable (e.g., `import.meta.env.VITE_API_URL`) instead of hardcoded `/api/...` proxies.
2. **Push Changes**: Push these code changes to GitHub.

### 4B: Deploy Customer App (`frontend-app`)
1. **Create Project**: Go to [Vercel](https://vercel.com/) and click "Add New Project".
2. **Import Repo**: Select your `eazy-shop` GitHub repository.
3. **Configure**:
   - **Root Directory**: Select Edit and choose `frontend-app`.
   - **Environment Variables**: Add `VITE_API_URL` and set its value to your live Render Backend URL.
4. **Deploy**: Click Deploy. Vercel will give you a live URL (e.g., `eazyshop-app.vercel.app`).

### 4C: Deploy Admin Dashboard (`frontend-admin`)
1. **Create Project**: Back in the Vercel dashboard, click "Add New Project" again.
2. **Import Repo**: Select the same `eazy-shop` repository.
3. **Configure**:
   - **Root Directory**: Select Edit and choose `frontend-admin`.
   - **Environment Variables**: Add `VITE_API_URL` and set its value to your live Render Backend URL.
4. **Deploy**: Click Deploy. Vercel will give you a live URL (e.g., `eazyshop-admin.vercel.app`).

---

## Final Verification
1. Visit your Vercel Admin URL. Login with your admin credentials.
2. Visit your Vercel App URL. Login as a customer.
3. Scan a product, add to cart, check out, and use the AI Assistant. If all works, your deployment is a success!
