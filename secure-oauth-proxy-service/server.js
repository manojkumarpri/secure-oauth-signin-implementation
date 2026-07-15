require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const LRUCache = require('./lruCache');

const app = express();
const cache = new LRUCache(5); // Cache holds a max of 5 items

// CORS Middleware to allow requests from our React development server
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Crucial: Allows the browser to send session cookies back to backend
}));

app.use(express.json());

// Session Configuration to store GitHub Token securely
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,             // Prevents client-side JS from reading cookie
    secure: process.env.NODE_ENV === 'production', // true in production (requires HTTPS)
    sameSite: 'lax',            // Protection against CSRF
    maxAge: 3600000             // 1 Hour session lifetime
  }
}));

// Route 1: Direct user to GitHub OAuth
app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(githubAuthUrl);
});

// Route 2: Handle redirect back from GitHub
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    // Exchange temporary authorization code for an Access Token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { accept: 'application/json' }
    });

    const accessToken = tokenResponse.data.access_token;

    if (accessToken) {
      // Securely store the access token in the backend session
      req.session.accessToken = accessToken;
      console.log("[Auth] Successfully authenticated and session established.");
      
      // Redirect back to React frontend
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    } else {
      res.status(400).send('Authentication failed: No access token returned');
    }
  } catch (error) {
    console.error('[Auth Error]', error.message);
    res.status(500).send('Authentication Error');
  }
});

// Route 3: Check if User is Authenticated
app.get('/auth/status', (req, res) => {
  if (req.session && req.session.accessToken) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Route 4: Proxy Repository Request (Using LRU Cache)
app.get('/api/repos', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  // Use the user's current session token as the cache key
  const cacheKey = `repos_${token.slice(-10)}`; // Slice key to log safely without exposing token

  // 1. Check LRU Cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`[Cache Hit] Serving repositories from LRU Cache for key: ${cacheKey}`);
    return res.json({ source: 'cache', data: cachedData });
  }

  console.log(`[Cache Miss] Fetching data from GitHub API...`);

  // 2. Fetch from Github API on Cache Miss
  try {
    const apiResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'secure-oauth-proxy-service' // GitHub API requires user-agent header
      },
      params: {
        sort: 'updated',
        per_page: 15
      }
    });

    const repos = apiResponse.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count
    }));

    // 3. Save response into LRU Cache
    cache.set(cacheKey, repos);

    res.json({ source: 'api', data: repos });
  } catch (error) {
    console.error('[API Proxy Error]', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch repositories' });
  }
});

// Route 5: Logout & session clearance
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Logout Failed');
    res.clearCookie('connect.sid'); // Clears default Express-session cookie
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));