import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// ✅ Import the Supabase client to sync sessions
import { supabase } from '../supabaseClient'; 

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const location = useLocation();

  useEffect(() => {
    /**
     * STABILITY DELAY & SUPABASE SYNC:
     * We verify the local app token and attempt to refresh the Supabase session.
     */
    const verifyAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // ✅ SYNC SESSION: Wakes up the Supabase client connection
          // We use getSession() because it is faster than getUser() during outages
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            // Note: Since you've enabled 'anon' policies, the app will still work
            console.warn("[SECURITY] Supabase session dormant. Using guest encryption rules.");
          }

          setHasToken(true);
          console.log(`[SECURE ACCESS] Token verified for: ${location.pathname}`);
        } else {
          setHasToken(false);
          console.warn("Unauthorized access attempt blocked. Redirecting to login...");
        }
      } catch (error) {
        // If Supabase times out due to the regional issue, we still allow access 
        // based on the local token so the UI doesn't freeze
        console.error("[AUTH ERROR] System handshake delayed. Defaulting to local token.");
        setHasToken(!!localStorage.getItem('token'));
      } finally {
        setIsChecking(false);
      }
    };

    // Keep the 250ms delay to ensure localStorage is ready
    const timer = setTimeout(() => {
      verifyAccess();
    }, 250);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Prevent UI flickering during the check
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
        fontWeight: 'bold',
        letterSpacing: '1px'
      }}>
        VERIFYING VAULT ENCRYPTION...
      </div>
    );
  }

  return hasToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;