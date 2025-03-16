import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    if (localStorage.getItem('adminToken')) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/admin/login', {
        username,
        password
      });
      
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 bg-white rounded-full w-24 h-24 flex items-center justify-center z-10">
        <div className="bg-black rounded-full w-12 h-12"></div>
      </div>
      <div className="absolute bottom-20 left-20 bg-white rounded-full w-24 h-24 flex items-center justify-center z-10">
        <div className="bg-black rounded-full w-12 h-12"></div>
      </div>
      
      {/* Background circle */}
      <div className="absolute top-0 right-0 bg-gray-200 w-96 h-96 rounded-full transform translate-x-1/2 -translate-y-1/4"></div>
      
      {/* Login container */}
      <div className="w-full max-w-md px-8 py-12 bg-black text-white rounded-lg shadow-xl z-20">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-50 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold">RoundRobinCoupon</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-center"> Admin Log In</h1>
        <p className="text-gray-400 text-sm mb-8 text-center">Claim coupons without logging in</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-25 rounded-md border border-red-700">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white font-medium mb-2" htmlFor="username">
              Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email address"
              className="w-full p-3 bg-gray-300 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-white font-medium mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                className="w-full p-3 bg-gray-300 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                required
              />
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg> : 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                }
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-900 text-white py-3 px-4 rounded-full font-medium transition duration-300 disabled:bg-gray-700 border border-white"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
      
      {/* Right side decoration */}
      <div className="absolute right-0 top-1/4 h-96 w-96 flex items-center justify-center">
        <div className="relative w-40">
          <div className="absolute -top-12 -right-12 bg-gray-200 rounded-lg shadow-lg w-32 h-40">
            <div className="w-full h-full bg-black rounded-lg p-2 transform rotate-6">
              <div className="w-full h-6 bg-yellow-500 rounded-full mb-2"></div>
              <div className="w-3/4 h-3 bg-gray-400 rounded-full mb-1"></div>
              <div className="w-1/2 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg shadow-lg w-24 h-32">
            <div className="w-full h-full bg-black rounded-lg p-2">
              <div className="w-full h-4 bg-yellow-500 rounded-full mb-2"></div>
              <div className="w-3/4 h-2 bg-gray-400 rounded-full mb-1"></div>
              <div className="w-1/2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;