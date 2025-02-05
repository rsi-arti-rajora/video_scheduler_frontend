import React, { useState, useEffect  } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { VideosProvider } from './contexts/VideosContext';
import Login from './Login';

const RootComponent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is already logged in
    const storedLoginTime = localStorage.getItem("loginTime");

    if (storedLoginTime) {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - parseInt(storedLoginTime, 10);

      // Check if login is still valid (24 hours = 86400000 milliseconds)
      if (elapsedTime < 86400000) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("loginTime"); // Clear expired login
      }
    }
  }, []);

  const handleLogin = (username, password) => {
    // Dummy authentication (Replace with real API authentication)
    if (username === "admin" && password === "admin@password") {
      localStorage.setItem("loginTime", new Date().getTime()); // Save login time
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <React.StrictMode>
      {isAuthenticated ? (
        <VideosProvider>
          <App />
        </VideosProvider>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);
reportWebVitals();
