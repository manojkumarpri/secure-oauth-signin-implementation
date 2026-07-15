# Secure OAuth Proxy & LRU Cache Service

[cite_start]This project is a lightweight, secure OAuth Integration Prototype developed as part of the technical assessment for the Engineering Experience Team at Arm[cite: 1, 2]. 

[cite_start]It implements a secure, backend-mediated OAuth 2.0 flow with GitHub, proxies authenticated API requests to protect sensitive credentials, and optimizes external API calls using a custom Least Recently Used (LRU) Companion Cache.

---

## 🏗️ Architecture & Security Design

[cite_start]The application consists of a **React (Vite) frontend** and a **Node.js/Express backend**.

### Key Security Decisions
1. [cite_start]**Token Security (No Leakage):** The React frontend never handles, stores, or possesses the GitHub access token. 
2. [cite_start]**Backend-Mediated Proxy:** All API communication with GitHub runs through our Express backend acting as a reverse proxy.
3. **HTTP-Only Cookies:** The access token is stored securely within an encrypted server-side session cookie (`httpOnly: true`, `sameSite: 'lax'`). This completely mitigates Cross-Site Scripting (XSS) access to credentials on the frontend.
4. [cite_start]**Zero Hardcoded Secrets:** All credentials, redirect URIs, and session keys are dynamically injected via environment variables.

### LRU Cache Design (Companion Service)
[cite_start]To avoid hitting GitHub's API rate limits unnecessarily, we implemented an in-memory **LRU Cache** to cache repository lists:
* [cite_start]**Eviction Policy:** Clears the Least Recently Used item once the threshold is crossed.
* [cite_start]**Capacity Limit:** Hard capped at a maximum of **5 items**.
* [cite_start]**Optimization:** If requested data is cached, it returns instantly (marked as `Source: CACHE` in the UI) without hitting external networks. [cite_start]Otherwise, it hits the API, caches the result, and returns it.

#### Secure OAuth Proxy & LRU Cache Service

This repository contains a lightweight, secure OAuth Integration Prototype developed as a technical assessment for the Engineering Experience Team at Arm. 

It demonstrates a backend-mediated OAuth 2.0 flow with GitHub, proxies authenticated API requests to protect sensitive credentials, and optimizes external API calls using a custom Least Recently Used (LRU) Companion Cache.



##### 🏗️ Architecture & Security Design

The system is split into a **React (Vite) frontend** and a **Node.js/Express backend** acting as a reverse proxy.

```text
               +-------------------+
               |  React Frontend   |
               +---------+---------+
                         |  (Secure session cookie)
                         v
               +---------+---------+      No Cache?      +-----------------+
               |  Express Backend  | ------------------> |   GitHub API    |
               +---------+---------+  (Fetch & Store)    +-----------------+
                         |
                         v (Check Hit / Miss)
               +---------+---------+
               |  LRU Cache (Max 5)|
               +-------------------+


## 🛠️ Project Structure

```text
ARM-ASSESMENT/
├── secure-oauth-proxy-service/            # Express.js Server & Cache Module
│   ├── lruCache.js     # Custom LRU Cache Module
│   ├── server.js       # API Proxy Server
│   ├── .env.example    # Configuration template
│   └── package.json
├── secure-oauth-proxy-ui/           # React + Vite Frontend UI
│   ├── src/
│   │   ├── App.jsx     # App Component & Controller
│   │   ├── App.scss    # Modular Styling
│   │   └── main.jsx    # Client entry point
│   ├── index.html      # ESM entry point
│   └── package.json
├── .gitignore          # Safeguard for private config files
└── README.md

---

