import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    const roles = ['Employee', 'Agent', 'Manager', 'Admin'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/Admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId) => {
        try {
            await api.put(`/Admin/users/${userId}/role`, { role: newRole });
            setEditingUser(null);
            setNewRole('');
            fetchUsers();
        } catch (err) {
            console.error('Role change error:', err);
        }
    };

    const handleToggleActive = async (userId) => {
        try {
            await api.post(`/Admin/users/${userId}/toggle-active`);
            fetchUsers();
        } catch (err) {
            console.error('Toggle active error:', err);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading users...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">User Management</h1>
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName || user.userName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    {editingUser === user.id ? (
                                        <div className="flex space-x-2">
                                            <select
                                                value={newRole}
                                                onChange={(e) => setNewRole(e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                                            >
                                                <option value="">Select role</option>
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleRoleChange(user.id)}
                                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                                disabled={!newRole}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="text-gray-500 text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">{user.roles?.join(', ') || 'None'}</span>
                                            <button
                                                onClick={() => { setEditingUser(user.id); setNewRole(''); }}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleActive(user.id)}
                                        className={`text-xs font-medium ${user.isActive ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'}`}
                                    >
                                        {user.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Users;
