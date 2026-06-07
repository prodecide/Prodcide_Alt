import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Discovery from './components/Discovery';
import About from './components/About';
import Experts from './components/Experts';
import Form from './components/Form';
import Registration from './components/Registration';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/about" element={<About />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/form" element={<Form />} />
          <Route path="/registration" element={<Registration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
