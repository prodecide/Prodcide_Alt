import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const Home = React.lazy(() => import('./components/Home'));
const Discovery = React.lazy(() => import('./components/Discovery'));
const About = React.lazy(() => import('./components/About'));
const Experts = React.lazy(() => import('./components/Experts'));
const Form = React.lazy(() => import('./components/Form'));
const Registration = React.lazy(() => import('./components/Registration'));
const Admin = React.lazy(() => import('./components/Admin'));
const ConsultantDashboard = React.lazy(() => import('./components/ConsultantDashboard'));
const ConsultantProfile = React.lazy(() => import('./components/ConsultantProfile'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const NotFound = React.lazy(() => import('./components/NotFound'));

// A simple loading skeleton
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#030014]">
    <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/about" element={<About />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/profile/:id" element={<ConsultantProfile />} />
            <Route path="/form" element={<Form />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/consultant-dashboard" element={<ConsultantDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
