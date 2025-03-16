import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('adminToken') !== null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">RoundRobinCoupon</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-black transition duration-300">Home</Link>
            <Link to="/history" className="text-gray-700 hover:text-black transition duration-300">Coupon Claiming</Link>
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="text-gray-700 hover:text-black transition duration-300">Admin Dashboard</Link>
                <Link to="/admin/claims" className="text-gray-700 hover:text-black transition duration-300">Coupons Claimed</Link>
              </>
            )}
          </div>
          
          {/* Admin Profile */}
          {isAdmin && (
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center">
                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-gray-700">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-black transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          {!isAdmin && (
            <Link 
              to="/admin/login" 
              className="hidden md:block bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition duration-300"
            >
              Admin Login
            </Link>
          )}
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-black focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/coupon-claiming" 
                className="text-gray-700 hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Coupon Claiming
              </Link>
              
              {isAdmin && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="text-gray-700 hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link 
                    to="/admin/claims" 
                    className="text-gray-700 hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Coupons Claimed
                  </Link>
                  <div className="flex items-center px-3 py-2">
                    <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-700">Admin</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
              
              {!isAdmin && (
                <Link 
                  to="/admin/login" 
                  className="bg-black text-white block text-center px-4 py-2 rounded-full hover:bg-gray-800 transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;