import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function AgentDashboard() {
    const [assignedTickets, setAssignedTickets] = useState([]);
    const [unassignedTickets, setUnassignedTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignedRes, unassignedRes] = await Promise.all([
                api.get('/Tickets/assigned-to-me'),
                api.get('/Tickets/unassigned')
            ]);
            setAssignedTickets(assignedRes.data);
            setUnassignedTickets(unassignedRes.data);
        } catch (err) {
            console.error('Error fetching agent data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (id) => {
        try {
            await api.put(`/Tickets/${id}/assign`);
            fetchData();
        } catch (err) {
            console.error('Assignment error:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-orange-100 text-orange-800';
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

    if (loading) return <div className="flex justify-center items-center h-64">Loading agent dashboard...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Agent Dashboard</h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm">Assigned to Me</p>
                    <p className="text-3xl font-bold">{assignedTickets.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
                    <p className="text-gray-500 text-sm">Unassigned Tickets</p>
                    <p className="text-3xl font-bold">{unassignedTickets.length}</p>
                </div>
            </div>

            {/* Assigned Tickets */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Assigned to Me</h2>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {assignedTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{ticket.id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{ticket.title}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                                    </td>
                                </tr>
                            ))}
                            {assignedTickets.length === 0 && (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No tickets assigned to you</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Unassigned Tickets */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Unassigned Tickets</h2>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {unassignedTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{ticket.id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{ticket.title}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{ticket.createdByName}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex space-x-2">
                                        <button
                                            onClick={() => handleAssign(ticket.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                        >
                                            Assign to Me
                                        </button>
                                        <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                                    </td>
                                </tr>
                            ))}
                            {unassignedTickets.length === 0 && (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No unassigned tickets</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AgentDashboard;
