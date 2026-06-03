import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import axios from 'axios';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (status) => setIsAuthenticated(status);
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome, {user.fullName || user.email}!</h1>
            <p>Roles: {user.roles?.join(', ')}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default App;