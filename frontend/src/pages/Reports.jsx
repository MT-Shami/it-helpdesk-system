import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Reports() {
    const [stats, setStats] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, monthlyRes] = await Promise.all([
                api.get('/Reports/ticket-stats'),
                api.get('/Reports/monthly-tickets')
            ]);
            setStats(statsRes.data);
            setMonthly(monthlyRes.data.monthlyCreated || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/Reports/export?format=excel&type=ticket-list', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tickets.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-500';
            case 'In Progress': return 'bg-orange-500';
            case 'Resolved': return 'bg-green-500';
            case 'Closed': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading reports...</div>;

    const findCount = (arr, key, value) => {
        if (!arr) return 0;
        const item = arr.find(x => x[key] === value);
        return item ? item.count : 0;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h1>
                <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    Export to Excel
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
                    <p className="text-gray-500 text-xs">Total</p>
                    <p className="text-2xl font-bold">{stats?.totalTickets || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
                    <p className="text-gray-500 text-xs">New</p>
                    <p className="text-2xl font-bold">{findCount(stats?.byStatus, 'status', 'New')}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-400">
                    <p className="text-gray-500 text-xs">In Progress</p>
                    <p className="text-2xl font-bold">{findCount(stats?.byStatus, 'status', 'In Progress')}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-400">
                    <p className="text-gray-500 text-xs">Resolved</p>
                    <p className="text-2xl font-bold">{findCount(stats?.byStatus, 'status', 'Resolved')}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-gray-400">
                    <p className="text-gray-500 text-xs">Closed</p>
                    <p className="text-2xl font-bold">{findCount(stats?.byStatus, 'status', 'Closed')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* By Status */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Tickets by Status</h3>
                    <div className="space-y-3">
                        {(stats?.byStatus || []).map(item => (
                            <div key={item.status} className="flex items-center">
                                <span className="w-32 text-sm text-gray-600">{item.status}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`${getStatusColor(item.status)} h-3 rounded-full transition-all`}
                                        style={{ width: `${(item.count / (stats?.totalTickets || 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right text-sm font-medium ml-2">{item.count}</span>
                            </div>
                        ))}
                        {(!stats?.byStatus || stats.byStatus.length === 0) && (
                            <p className="text-gray-400 text-sm">No data</p>
                        )}
                    </div>
                </div>

                {/* By Priority */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Tickets by Priority</h3>
                    <div className="space-y-3">
                        {(stats?.byPriority || []).map(item => (
                            <div key={item.priority} className="flex items-center">
                                <span className="w-24 text-sm text-gray-600">{item.priority}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-purple-500 h-3 rounded-full transition-all"
                                        style={{ width: `${(item.count / (stats?.totalTickets || 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right text-sm font-medium ml-2">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly Ticket Creation (Last 12 Months)</h3>
                <div className="space-y-2">
                    {monthly.map((item, index) => {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const maxCount = Math.max(...monthly.map(m => m.count), 1);
                        return (
                            <div key={index} className="flex items-center">
                                <span className="w-20 text-sm text-gray-600">{monthNames[item.month - 1]} {item.year}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-5">
                                    <div
                                        className="bg-blue-500 h-5 rounded-full transition-all flex items-center justify-end pr-2"
                                        style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '40px' : '0' }}
                                    >
                                        {item.count > 0 && <span className="text-xs text-white font-medium">{item.count}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {monthly.length === 0 && <p className="text-gray-400 text-sm">No data available</p>}
                </div>
            </div>

            {/* Per Agent */}
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Tickets per Agent</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(stats?.perAgent || []).map(item => (
                        <div key={item.agent} className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-800">{item.agent}</p>
                            <p className="text-2xl font-bold text-blue-600">{item.count}</p>
                        </div>
                    ))}
                    {(!stats?.perAgent || stats.perAgent.length === 0) && (
                        <p className="text-gray-400 text-sm">No tickets assigned</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Reports;
