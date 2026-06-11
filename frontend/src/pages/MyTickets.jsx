import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function MyTickets() {
    const { isAdminOrAgent } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/Tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTicket = async (id) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            try {
                await api.delete(`/Tickets/${id}`);
                fetchTickets();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const stats = {
        open: tickets.filter(t => t.status === 'New' || t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length,
        closed: tickets.filter(t => t.status === 'Closed').length,
    };

    const filteredTickets = tickets.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().includes(search)
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-orange-100 text-orange-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low': return 'bg-gray-100 text-gray-800';
            case 'Medium': return 'bg-blue-100 text-blue-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">My Tickets</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm">Open Tickets</p>
                    <p className="text-3xl font-bold">{stats.open}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
                    <p className="text-gray-500 text-sm">In Progress</p>
                    <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm">Resolved</p>
                    <p className="text-3xl font-bold">{stats.resolved}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-gray-500">
                    <p className="text-gray-500 text-sm">Closed</p>
                    <p className="text-3xl font-bold">{stats.closed}</p>
                </div>
            </div>

            <div className="mb-6">
                <Link to="/tickets/create">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow transition">
                        + Create New Ticket
                    </button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{ticket.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:underline">View</Link>
                                        <Link to={`/tickets/edit/${ticket.id}`} className="text-yellow-600 hover:underline">Edit</Link>
                                        {isAdminOrAgent && (
                                            <button onClick={() => deleteTicket(ticket.id)} className="text-red-600 hover:underline">Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MyTickets;
