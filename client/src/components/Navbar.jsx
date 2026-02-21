import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    // 1. Remove the security token
    localStorage.removeItem('token');
    // 2. Send the user back to the login page
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        <Link to="/" style={{ color: '#38bdf8', textDecoration: 'none' }}>
          🛡️ CyberSecure-Hub
        </Link>
      </div>
      <div>
        {token ? (
          <>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/notes" style={linkStyle}>Vault</Link>
            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Simple inline styles for a clean dark theme
const navStyle = { padding: '1rem 2rem', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoStyle = { fontSize: '1.5rem', fontWeight: 'bold' };
const linkStyle = { color: '#f8fafc', margin: '0 15px', textDecoration: 'none' };
const logoutButtonStyle = { background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' };

export default Navbar;