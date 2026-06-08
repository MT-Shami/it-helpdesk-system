import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import EditTicket from './pages/EditTicket';
import TicketDetails from './pages/TicketDetails';
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
        <BrowserRouter>
            <div style={{ padding: '10px 20px', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>IT Helpdesk</h3>
                <div>
                    <span>Welcome, {user.fullName || user.email} | Role: {user.roles?.join(', ')} | </span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <Routes>
                <Route path="/tickets" element={<MyTickets />} />
                <Route path="/tickets/create" element={<CreateTicket />} />
                <Route path="/tickets/edit/:id" element={<EditTicket />} />
                <Route path="/tickets/:id" element={<TicketDetails />} />
                <Route path="*" element={<Navigate to="/tickets" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;