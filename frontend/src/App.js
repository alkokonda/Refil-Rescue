import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Help from './pages/Help';
import Contact from './pages/Contact';

const Navbar = () => {
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="px-5 text-2xl font-bold text-white">Refuel Rescue</span>
            </Link>
  
            <div className="hidden md:flex space-x-1">
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg transition-colors text-white hover:bg-blue-500"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg transition-colors text-white hover:bg-blue-500"
              >
                Login
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 rounded-lg transition-colors text-white hover:bg-blue-500"
              >
                Contact
              </Link>
            </div>
  
            {/* Mobile menu */}
            <div className="md:hidden relative">
              <button className="mobile-menu-button p-2 text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };
  
  
const App = () => {
    return (
        <Router>
            <Navbar />
            <div className="container mx-auto p-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
