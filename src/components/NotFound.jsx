import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-inter selection:bg-black selection:text-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-8xl font-black text-gray-200 tracking-tighter mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6 tracking-tight">Page Not Found</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                    We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-black rounded-full hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/10"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
