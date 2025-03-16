import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchCoupons();
  }, [navigate]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const res = await axios.get('http://localhost:5000/admin/coupons', {
        headers: {
          'x-access-token': token
        }
      });
      
      setCoupons(res.data.coupons || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        // Unauthorized, redirect to login
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch coupons');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    if (!newCouponCode.trim()) {
      setFormError('Please enter a valid coupon code');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.post('http://localhost:5000/admin/add-coupon', 
        { code: newCouponCode },
        { headers: { 'x-access-token': token } }
      );
      
      setNewCouponCode('');
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add coupon');
    }
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    if (!editingCoupon.code.trim()) {
      setFormError('Please enter a valid coupon code');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.patch('http://localhost:5000/admin/update-coupon', 
        { 
          coupon_id: editingCoupon._id,
          code: editingCoupon.code 
        },
        { headers: { 'x-access-token': token } }
      );
      
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.patch('http://localhost:5000/admin/toggle-coupon',
        { coupon_id: couponId },
        { headers: { 'x-access-token': token } }
      );
      
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.delete('http://localhost:5000/admin/delete-coupon', {
        headers: { 'x-access-token': token },
        data: { coupon_id: couponId }
      });
      
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const startEditing = (coupon) => {
    setEditingCoupon({...coupon});
  };

  const cancelEditing = () => {
    setEditingCoupon(null);
    setFormError(null);
  };

  const generateCouponCode = () => {
    // Generate a random alphanumeric string of length 8
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCouponCode(result);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center py-12 px-4 bg-white shadow-sm">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Manage your coupon distribution system with ease
        </p>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 rounded-md border border-red-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Add New Coupon Form */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Add New Coupon</h2>
            {formError && !editingCoupon && (
              <div className="mb-4 p-3 bg-red-100 rounded-md border border-red-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}
            <form onSubmit={handleAddCoupon} className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="newCouponCode">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="newCouponCode"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="button"
                    onClick={generateCouponCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-300 font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generate
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-all duration-300 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Coupon
              </button>
            </form>
          </div>

          {/* Edit Coupon Modal */}
          {editingCoupon && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Coupon
                </h2>
                
                {formError && (
                  <div className="mb-5 p-3 bg-red-100 rounded-md border border-red-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm">{formError}</p>
                  </div>
                )}
                
                <form onSubmit={handleUpdateCoupon}>
                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="editCouponCode">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      id="editCouponCode"
                      value={editingCoupon.code}
                      onChange={(e) => setEditingCoupon({...editingCoupon, code: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-5 rounded-lg transition-all duration-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg transition-all duration-300 font-medium"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Coupons Table */}
          <h2 className="text-2xl font-bold mb-5">Manage Coupons</h2>
          
          {loading ? (
            <div className="text-center p-12 bg-gray-50 rounded-lg">
              <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 font-medium">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 font-medium mb-3">No coupons found</p>
              <p className="text-gray-400">Add some coupons to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold border-b">Coupon Code</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold border-b">Status</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold border-b">Claimed By</th>
                    <th className="px-6 py-4 text-right text-gray-700 font-semibold border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 border-b font-medium">{coupon.code}</td>
                      <td className="px-6 py-4 border-b">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          coupon.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {coupon.status === 'available' ? (
                            <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                          ) : (
                            <svg className="mr-1.5 h-2 w-2 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                          )}
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b text-gray-500">
                        {coupon.claimed_by || 'N/A'}
                      </td>
                      <td className="px-6 py-4 border-b text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditing(coupon)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon._id)}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            Toggle
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Refresh Button */}
          <div className="mt-6">
            <button 
              onClick={fetchCoupons}
              className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-5 rounded-lg transition-all duration-300 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Coupons
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© 2025 RoundRobinCoupon Admin Panel. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;