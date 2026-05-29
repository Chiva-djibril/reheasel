import { useState } from 'react';
import Navbar from './components/Navbar';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Reports from './components/Reports';

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
                setError('Registered! Please login.');
            }
        } catch {
            setError('Server error');
        }
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
    };

    if (!token) {
        return (
            <div className="p-10">
                <div className="border p-5 w-80 mx-auto mt-20">
                    <h2 className="text-xl mb-3">SmartPark SIMS</h2>
                    <h3 className="mb-3">{authMode === 'login' ? 'Login' : 'Register'}</h3>
                    <form onSubmit={handleAuth}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                            required
                            className="border p-2 w-full mb-2"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            required
                            className="border p-2 w-full mb-2"
                        />
                        <button type="submit" className="bg-blue-500 text-white px-3 py-1">
                            {authMode === 'login' ? 'Login' : 'Register'}
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    <p
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                        className="text-blue-500 mt-3 cursor-pointer underline"
                    >
                        {authMode === 'login' ? 'Register here' : 'Login here'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar setPage={setPage} logout={logout} />
            <div className="p-5">
                {page === 'stockin' && <StockIn />}
                {page === 'stockout' && <StockOut />}
                {page === 'reports' && <Reports />}
            </div>
        </div>
    );
}

export default App;