import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import ChatAssistant from './components/ChatAssistant';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import EditTicket from './pages/EditTicket';
import TicketDetails from './pages/TicketDetails';
import AgentDashboard from './pages/AgentDashboard';
import Reports from './pages/Reports';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeBaseArticle from './pages/KnowledgeBaseArticle';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminKnowledgeBase from './pages/admin/KnowledgeBaseAdmin';

function AppContent() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <BrowserRouter>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    {/* Top bar */}
                    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
                        <div className="text-lg font-semibold text-gray-800">
                            IT Help Desk
                        </div>
                        <div className="flex items-center space-x-4">
                            <NotificationBell />
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="flex-1 overflow-auto">
                        <Routes>
                            <Route path="/tickets" element={<MyTickets />} />
                            <Route path="/tickets/create" element={<CreateTicket />} />
                            <Route path="/tickets/edit/:id" element={<EditTicket />} />
                            <Route path="/tickets/:id" element={<TicketDetails />} />
                            <Route path="/agent" element={<AgentDashboard />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/knowledge-base" element={<KnowledgeBase />} />
                            <Route path="/knowledge-base/:id" element={<KnowledgeBaseArticle />} />
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/categories" element={<AdminCategories />} />
                            <Route path="/admin/knowledge-base" element={<AdminKnowledgeBase />} />
                            <Route path="*" element={<Navigate to="/tickets" replace />} />
                        </Routes>
                    </main>
                </div>
                <ChatAssistant />
            </div>
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
