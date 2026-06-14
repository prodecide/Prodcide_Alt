import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Discovery from './components/Discovery';
import About from './components/About';
import Experts from './components/Experts';
import Form from './components/Form';
import Registration from './components/Registration';
import Admin from './components/Admin';
import ConsultantDashboard from './components/ConsultantDashboard';
import ConsultantProfile from './components/ConsultantProfile';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
