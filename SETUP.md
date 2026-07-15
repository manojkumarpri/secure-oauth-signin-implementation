# 🚀 Local Setup & Installation Guide

This document provides complete, step-by-step instructions to install, configure, and run both the React frontend and Node.js/Express backend on your local machine.

---

# 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher, comes bundled with Node.js)
- A modern web browser (Chrome, Edge, Firefox, Safari)
- A code editor (VS Code recommended)
- A GitHub account (required to create an OAuth application)

---

# 🛠️ Step 1: Create a GitHub OAuth Application

Since private environment variables are excluded from source control for security reasons, you must create your own GitHub OAuth application to obtain a **Client ID** and **Client Secret**.

1. Sign in to your GitHub account.
2. Navigate to:

   **Settings → Developer Settings → OAuth Apps → New OAuth App**

   or visit:

   https://github.com/settings/developers

3. Fill in the application details:

| Field | Value |
|--------|-------|
| **Application Name** | OAuth Proxy Prototype |
| **Homepage URL** | http://localhost:5173 |
| **Authorization callback URL** | http://localhost:5050/auth/callback |

4. Click **Register Application**.
5. Copy the generated **Client ID**.
6. Click **Generate a new client secret**.
7. Copy the generated **Client Secret** immediately (GitHub only displays it once).

---

# 📦 Step 2: Configure & Run the Backend Proxy Server

The backend server:

- Handles GitHub OAuth authentication
- Exchanges the authorization code for an access token
- Stores the token securely inside a server-side session
- Exposes a secure API proxy
- Maintains an in-memory LRU cache for GitHub API responses

### 1. Navigate to the backend project

```bash
cd secure-oauth-proxy-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Copy the example configuration:

```bash
cp .env.example .env
```

### 4. Update the `.env` file

Open the newly created `.env` file and replace the placeholder values with your own credentials.

```env
PORT=5050

SESSION_SECRET=choose_any_long_secure_random_string_here

GITHUB_CLIENT_ID=your_github_client_id

GITHUB_CLIENT_SECRET=your_github_client_secret

FRONTEND_URL=http://localhost:5173
```

### 5. Start the backend server

```bash
npm run dev
```

The backend will start on:

```
http://localhost:5050
```

---

# 💻 Step 3: Configure & Run the Frontend UI

The frontend is a React application powered by **Vite**.

Open a **new terminal window** (keep the backend running) and navigate to the frontend project.

### 1. Navigate to the frontend

```bash
cd ../secure-oauth-proxy-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The React application will start on:

```
http://localhost:5173
```

---

# 🧪 Step 4: Verification & Testing

Once both applications are running, verify the complete authentication and caching workflow.

## 1. Open the application

Navigate to:

```
http://localhost:5173
```

---

## 2. Authenticate with GitHub

Click:

```
Login with GitHub
```

You will be redirected to GitHub's authorization page.

Approve the authorization request.

---

## 3. OAuth Flow

After authorization:

1. GitHub redirects back to the Express backend.
2. The backend exchanges the authorization code for an access token.
3. The access token is securely stored inside a server-side session.
4. An encrypted session cookie is sent to the browser.
5. The backend redirects you back to the React dashboard.

---

## 4. Fetch GitHub Repositories

Click:

```
Fetch GitHub Repositories
```

### First Request (Cache Miss)

Request Flow:

```
React UI
    │
    ▼
Express Backend
    │
    ▼
GitHub API
```

Expected behavior:

- Repository list is displayed.
- UI displays:

```
Source: API
```

Backend console:

```
[Cache Miss]
```

---

### Subsequent Requests (Cache Hit)

Request Flow:

```
React UI
    │
    ▼
Express Backend
    │
    ▼
LRU Cache
```

Expected behavior:

- Repository list loads instantly.
- UI displays:

```
Source: CACHE
```

Backend console:

```
[Cache Hit]
```

No request is sent to GitHub because the response is served directly from the LRU cache.

---

## 5. Logout

Click:

```
Logout
```

The backend will:

- Destroy the server-side session
- Remove the encrypted session cookie
- Clear secure access to the GitHub API

---

# 📂 Project Structure

```
project-root
│
├── secure-oauth-proxy-service
│   ├── src
│   ├── .env.example
│   ├── package.json
│   └── ...
│
└── secure-oauth-proxy-ui
    ├── src
    ├── package.json
    └── ...
```

---

# 🔐 Security Notes

- Never commit your `.env` file to version control.
- Never expose your GitHub Client Secret in frontend code.
- OAuth access tokens remain on the backend.
- Authentication is maintained using encrypted HTTP sessions.
- The frontend communicates only with the backend proxy.
- GitHub API requests are cached using an in-memory LRU cache to reduce redundant external API calls.

---

# ✅ Development Commands

## Backend

```bash
cd secure-oauth-proxy-service

npm install

cp .env.example .env

npm run dev
```

---

## Frontend

```bash
cd secure-oauth-proxy-ui

npm install

npm run dev
```

---

# 🌐 Local URLs

| Service | URL |
|----------|-----|
| React Frontend | http://localhost:5173 |
| Express Backend | http://localhost:5050 |
| GitHub OAuth Callback | http://localhost:5050/auth/callback |

---

# 🎉 You're Ready!

Once both servers are running, you can:

- Authenticate securely with GitHub OAuth
- Store access tokens safely on the backend
- Fetch GitHub repositories through the proxy
- Observe cache hits and misses using the LRU cache
- Log out to destroy the authenticated session