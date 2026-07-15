import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.scss'; 

axios.defaults.withCredentials = true;

const BACKEND_URL = 'http://localhost:5050';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${BACKEND_URL}/auth/status`)
      .then(res => {
        setIsAuthenticated(res.data.isAuthenticated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${BACKEND_URL}/auth/logout`);
      setIsAuthenticated(false);
      setRepos([]);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const fetchRepositories = async () => {
    setError('');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/repos`);
      setRepos(res.data.data);
      setDataSource(res.data.source);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve repositories.');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>Engineering Experience Portal</h2>
        {!isAuthenticated ? (
          <button onClick={handleLogin} className="login-btn">
            Login with GitHub
          </button>
        ) : (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </header>

      <main className="app-main">
        {isAuthenticated ? (
          <div>
            <div className="actions-panel">
              <button onClick={fetchRepositories} className="primary-btn">
                Fetch GitHub Repositories
              </button>
              {dataSource && (
                <span className="source-badge">
                  Source: <strong>{dataSource.toUpperCase()}</strong>
                </span>
              )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <ul className="repo-list">
              {repos.map(repo => (
                <li key={repo.id} className="repo-card">
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-link">
                    {repo.name}
                  </a>
                  <p className="repo-desc">{repo.description || "No description provided."}</p>
                  <span className="star-badge">★ {repo.stars} stars</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="hero-banner">
            <p>Please log in to query and test security integrations securely via our API proxy.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;