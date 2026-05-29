import { useState } from 'react';
import Navbar from './components/Navbar';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Reports from './components/Reports';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [page, setPage] = useState('stockin');
    const [authMode, setAuthMode] = useState('login');
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`http://localhost:5000/api/${authMode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message);
            if (authMode === 'login') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                setToken(data.token);
            } else {
                setAuthMode('login');
                alert('Registered! Please login.');
            }
        } catch {
            alert('Server error');
        }
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <h2 style={{color: "black"}}>SmartPark Stock&Inventory Management System</h2>
                    <h3>{authMode === 'login' ? 'Login' : 'Register'}</h3>
                    <form onSubmit={handleAuth}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />
                        <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
                    </form>
                    {error && <p className="error">{error}</p>}
                    <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="link">
                        {authMode === 'login' ? 'Need an account? Register' : 'Have account? Login'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <Navbar setPage={setPage} logout={logout} />
            <div className="content">
                {page === 'stockin' && <StockIn />}
                {page === 'stockout' && <StockOut />}
                {page === 'reports' && <Reports />}
            </div>
        </div>
    );
}

export default App;