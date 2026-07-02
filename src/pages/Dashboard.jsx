import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // 💡 FIX 1: Look through BOTH storage pools
  const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

  // Guard Clause: Boot them out if they have no token in either location
  if (!token) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>🔒 Access Denied</h3>
        <button onClick={() => navigate('/Login')}>Go to Login</button>
      </div>
    );
  }

  // 💡 FIX 2: Clean up BOTH storage tracks on logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('refreshToken');
    navigate('/Login'); // Send back to login root
  };

  return (
    <div className="dashboard-page" style={{ padding: '20px' }}>
      <h2>✓ Welcome to your Dashboard</h2>
      <p>Protected data from Django will display here.</p>
      <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Log Out
      </button>
    </div>
  );
}