import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    // Check local storage for various login states based on roles
    const isUser = !!localStorage.getItem('discovery_verified_email');
    const isConsultant = !!localStorage.getItem('consultant_user');
    const isAdmin = localStorage.getItem('prodecide_admin_auth') === 'true';

    // If no roles specified, just check if ANYONE is logged in
    if (allowedRoles.length === 0) {
        if (!isUser && !isConsultant && !isAdmin) {
            return <Navigate to="/" replace />;
        }
        return children;
    }

    // Role-based routing
    if (allowedRoles.includes('admin') && isAdmin) return children;
    if (allowedRoles.includes('consultant') && isConsultant) return children;
    if (allowedRoles.includes('user') && isUser) return children;

    // If logged in but doesn't have the right role, send them home
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;
