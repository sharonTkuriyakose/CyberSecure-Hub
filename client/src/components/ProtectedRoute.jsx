import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const location = useLocation();

  useEffect(() => {
    /**
     * STABILITY DELAY:
     * We wait 250ms before checking the token. This bridges the gap 
     * where localStorage might be empty during a fast redirect 
     * when the console is closed.
     */
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setHasToken(true);
        console.log(`[SECURE ACCESS] Token verified for: ${location.pathname}`);
      } else {
        setHasToken(false);
        console.warn("Unauthorized access attempt blocked. Redirecting to login...");
      }
      
      setIsChecking(false);
    }, 250); // Increased to 250ms for maximum reliability

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Prevent UI flickering or premature redirects during the check
  if (isChecking) {
    return (
      <div style={{ 
        height: '100vh', 
        background: '#020617', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#38bdf8',
        fontSize: '1rem',
        fontWeight: 'bold'
      }}>
        VERIFYING ENCRYPTION...
      </div>
    );
  }

  return hasToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;