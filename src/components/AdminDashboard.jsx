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
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 rounded-md border border-red-300">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Add New Coupon Form */}
            <div className="mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
                <h2 className="text-lg font-semibold mb-3">Add New Coupon</h2>
                {formError && !editingCoupon && (
                <div className="mb-4 p-3 bg-red-100 rounded-md border border-red-300">
                    <p className="text-red-700 text-sm">{formError}</p>
                </div>
                )}
                <form onSubmit={handleAddCoupon} className="flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="newCouponCode">
                    Coupon Code
                    </label>
                    <div className="flex gap-2">
                    <input
                        type="text"
                        id="newCouponCode"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter coupon code"
                    />
                    <button
                        type="button"
                        onClick={generateCouponCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded whitespace-nowrap min-w-[140px]"
                    >
                        Generate Coupon
                    </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white h-10 px-4 rounded"
                >
                    Add Coupon
                </button>
                </form>
            </div>

            {/* Edit Coupon Modal */}
        {editingCoupon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Coupon</h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-100 rounded-md border border-red-300">
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              )}
              
              <form onSubmit={handleUpdateCoupon}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="editCouponCode">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    id="editCouponCode"
                    value={editingCoupon.code}
                    onChange={(e) => setEditingCoupon({...editingCoupon, code: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Coupons Table */}
        {loading ? (
          <div className="text-center p-10">
            <p className="text-gray-500">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-md">
            <p className="text-gray-500">No coupons found. Add some coupons to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Coupon Code</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Status</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Claimed By</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-semibold border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium">{coupon.code}</td>
                    <td className="px-4 py-3 border-b">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b text-gray-500">
                      {coupon.claimed_by || 'N/A'}
                    </td>
                    <td className="px-4 py-3 border-b text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEditing(coupon)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon._id)}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-2 rounded text-xs"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded text-xs"
                        >
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
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Refresh Coupons
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;