import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
    const { user, hasRole, logout } = useAuth();

    const linkClass = ({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium transition-colors ${isActive
            ? 'bg-blue-700 text-white border-r-2 border-white'
            : 'text-blue-100 hover:bg-blue-700 hover:text-white'
        }`;

    const iconStyle = "w-5 h-5 mr-3";

    return (
        <aside className="w-64 bg-blue-900 text-white flex flex-col min-h-screen">
            <div className="p-5 border-b border-blue-800">
                <h2 className="text-lg font-bold">IT Helpdesk</h2>
                <p className="text-xs text-blue-300 mt-1">{user?.fullName || user?.email}</p>
            </div>
            <nav className="flex-1 py-4 space-y-1">
                <NavLink to="/tickets" className={linkClass}>
                    <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Tickets
                </NavLink>

                {(hasRole('Admin') || hasRole('Agent')) && (
                    <NavLink to="/agent" className={linkClass}>
                        <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Agent Dashboard
                    </NavLink>
                )}

                {(hasRole('Admin') || hasRole('Agent') || hasRole('Manager')) && (
                    <NavLink to="/reports" className={linkClass}>
                        <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Reports
                    </NavLink>
                )}

                <NavLink to="/knowledge-base" className={linkClass}>
                    <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Knowledge Base
                </NavLink>

                {hasRole('Admin') && (
                    <div className="pt-4">
                        <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">Admin</p>
                        <NavLink to="/admin/users" className={linkClass}>
                            <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Users
                        </NavLink>
                        <NavLink to="/admin/categories" className={linkClass}>
                            <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Categories
                        </NavLink>
                        <NavLink to="/admin/knowledge-base" className={linkClass}>
                            <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            KB Articles
                        </NavLink>
                    </div>
                )}
            </nav>
            <div className="p-4 border-t border-blue-800">
                <button
                    onClick={logout}
                    className="flex items-center text-sm text-blue-200 hover:text-white transition-colors w-full"
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
