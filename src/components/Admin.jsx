import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('prodecide_admin_auth') === 'true'
    );
    const [passcode, setPasscode] = useState('');
    const [loginError, setLoginError] = useState('');
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
    const [actioningId, setActioningId] = useState(null);
    const [toast, setToast] = useState(null);

    // Get expected passcode from environment or default
    const expectedPasscode = import.meta.env.VITE_ADMIN_PASSCODE || '1234';

    useEffect(() => {
        if (isAuthenticated) {
            fetchConsultants();
        }
    }, [isAuthenticated]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchConsultants = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch all consultants (including pending)
            const res = await fetch('/api/consultants?all=true');
            if (!res.ok) throw new Error('Failed to fetch consultants');
            const data = await res.json();
            setConsultants(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (passcode === expectedPasscode) {
            setIsAuthenticated(true);
            localStorage.setItem('prodecide_admin_auth', 'true');
            setLoginError('');
        } else {
            setLoginError('Invalid admin passcode. Please try again.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('prodecide_admin_auth');
        setPasscode('');
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setActioningId(id);
        try {
            const res = await fetch('/api/consultants', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to update status');
            }

            showToast(`Consultant application successfully ${newStatus === 'approved' ? 'approved' : 'rejected'}.`);
            // Refresh list
            await fetchConsultants();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setActioningId(null);
        }
    };

    const pendingList = consultants.filter((c) => c.status === 'pending');
    const approvedList = consultants.filter(
        (c) => c.status === 'approved' || (!c.status && c._id.startsWith('mock-'))
    );

    if (!isAuthenticated) {
        return (
            <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="bg-surface-container border border-outline/10 w-full max-w-md p-8 rounded-3xl shadow-xl backdrop-blur-md">
                        <div className="text-center mb-8">
                            <span className="material-symbols-outlined text-primary text-5xl mb-2">admin_panel_settings</span>
                            <h2 className="text-2xl font-bold tracking-tight">Admin Gate</h2>
                            <p className="text-outline text-sm mt-1">Please enter your passcode to access dashboard</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Passcode</label>
                                <input
                                    type="password"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="••••"
                                    className="w-full px-4 py-3 rounded-xl bg-surface border border-outline/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg font-bold"
                                    required
                                    autoFocus
                                />
                            </div>
                            {loginError && (
                                <p className="text-rose-500 text-sm font-medium text-center">{loginError}</p>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">login</span>
                                Verify & Access
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen pb-16">
            <Navbar />
            
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl transition-all border ${
                    toast.type === 'error' 
                        ? 'bg-rose-50 border-rose-200 text-rose-800' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                    <span className="material-symbols-outlined">
                        {toast.type === 'error' ? 'error' : 'check_circle'}
                    </span>
                    <span className="font-semibold text-sm">{toast.message}</span>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline/10 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase mb-1">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            ProDecide Portal
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Application Control Center</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Log Out
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-outline/10 mb-8">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 pb-4 px-4 font-semibold text-base transition border-b-2 -mb-[2px] ${
                            activeTab === 'pending'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-outline hover:text-on-surface'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">hourglass_empty</span>
                        Pending Approval
                        {pendingList.length > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                {pendingList.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`flex items-center gap-2 pb-4 px-4 font-semibold text-base transition border-b-2 -mb-[2px] ${
                            activeTab === 'approved'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-outline hover:text-on-surface'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">verified</span>
                        Active Directory
                        <span className="bg-surface-variant text-outline text-xs px-2 py-0.5 rounded-full font-bold">
                            {approvedList.length}
                        </span>
                    </button>
                </div>

                {/* Dashboard Main Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-outline font-medium">Fetching applications...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 text-rose-600 p-8 rounded-2xl text-center border border-rose-100 max-w-xl mx-auto">
                        <span className="material-symbols-outlined text-4xl mb-2">error</span>
                        <p className="font-bold">Error loading data</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                ) : activeTab === 'pending' ? (
                    pendingList.length === 0 ? (
                        <div className="bg-surface-container/50 border border-outline/5 rounded-3xl p-12 text-center max-w-xl mx-auto">
                            <span className="material-symbols-outlined text-outline text-5xl mb-3">inbox</span>
                            <h3 className="text-xl font-bold">No Pending Applications</h3>
                            <p className="text-outline text-sm mt-1">When new consultants register, they will appear here for your review and approval.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {pendingList.map((item) => (
                                <div key={item._id} className="bg-surface-container border border-outline/10 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-6 shadow-md hover:shadow-lg transition">
                                    <div className="flex flex-col md:flex-row gap-6 flex-1">
                                        {/* Avatar */}
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center border border-outline/10">
                                            {item.profileImage ? (
                                                <img src={item.profileImage} alt={item.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-primary text-3xl">person</span>
                                            )}
                                        </div>
                                        
                                        {/* Info details */}
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <h3 className="text-xl font-bold">{item.fullName}</h3>
                                                <p className="text-primary font-semibold text-sm mt-0.5">{item.role}</p>
                                                <p className="text-outline text-xs mt-0.5">{item.organization || 'Independent'} • {item.location || 'Remote'}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-outline/5 pt-4">
                                                <p><span className="text-outline font-medium">Email: </span> <a href={`mailto:${item.email}`} className="text-primary hover:underline">{item.email}</a></p>
                                                <p><span className="text-outline font-medium">Phone: </span> {item.phone || 'Not provided'}</p>
                                                <p><span className="text-outline font-medium">Experience: </span> {item.experience || 0} years</p>
                                                <p><span className="text-outline font-medium">Desired Price: </span> ₹{item.price || 'Standard'}</p>
                                            </div>

                                            <div className="border-t border-outline/5 pt-4">
                                                <span className="text-outline text-sm font-medium block mb-1">Expertise Areas:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(Array.isArray(item.expertise) ? item.expertise : [item.expertise]).map((tag, idx) => (
                                                        <span key={idx} className="bg-primary/5 text-primary text-xs px-2.5 py-1 rounded-full font-semibold border border-primary/10">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-outline/5 pt-4">
                                                <span className="text-outline text-sm font-medium block mb-1">Biography:</span>
                                                <p className="text-sm text-on-surface/90 italic bg-surface/50 p-4 rounded-xl border border-outline/5">
                                                    "{item.bio || 'No biography details provided.'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex lg:flex-col justify-end gap-3 lg:w-48 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline/5 lg:justify-center">
                                        <button
                                            onClick={() => handleStatusUpdate(item._id, 'approved')}
                                            disabled={actioningId !== null}
                                            className="flex-1 lg:flex-none bg-primary hover:bg-primary/95 text-white py-3 px-4 rounded-xl font-bold text-sm transition shadow-md hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                            Approve User
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(item._id, 'rejected')}
                                            disabled={actioningId !== null}
                                            className="flex-1 lg:flex-none border border-rose-200 hover:bg-rose-50 text-rose-500 py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg">cancel</span>
                                            Decline User
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    approvedList.length === 0 ? (
                        <div className="bg-surface-container/50 border border-outline/5 rounded-3xl p-12 text-center max-w-xl mx-auto">
                            <span className="material-symbols-outlined text-outline text-5xl mb-3">group_off</span>
                            <h3 className="text-xl font-bold">No Active Consultants</h3>
                            <p className="text-outline text-sm mt-1">Approve pending applications to list them here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {approvedList.map((item) => (
                                <div key={item._id} className="bg-surface-container border border-outline/10 rounded-3xl p-6 flex gap-4 shadow-sm hover:shadow-md transition">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center border border-outline/10">
                                        {item.profileImage || item.avatar ? (
                                            <img src={item.profileImage || item.avatar} alt={item.fullName || item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary text-2xl">person</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold truncate text-lg">{item.fullName || item.name}</h3>
                                                <p className="text-primary font-semibold text-xs truncate">{item.role || item.title}</p>
                                            </div>
                                            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200 uppercase tracking-wider">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-outline text-xs mt-2 line-clamp-2 italic">"{item.bio}"</p>
                                        
                                        <div className="mt-4 flex justify-between items-center pt-3 border-t border-outline/5">
                                            <span className="text-outline text-xs">{item.organization || 'Independent'}</span>
                                            <button
                                                onClick={() => handleStatusUpdate(item._id, 'pending')}
                                                disabled={actioningId !== null}
                                                className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 border border-transparent hover:border-rose-100 hover:bg-rose-50/50 px-2.5 py-1.5 rounded-lg transition"
                                            >
                                                <span className="material-symbols-outlined text-sm">block</span>
                                                Deactivate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
