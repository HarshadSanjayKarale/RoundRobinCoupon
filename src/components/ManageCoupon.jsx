import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ManageCoupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Determine if we're editing or adding
  const isEditing = !!id;

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // If editing, fetch the coupon details
    if (isEditing) {
      fetchCouponDetails();
    }
  }, [id, navigate]);

  const fetchCouponDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const res = await axios.get(`https://roundrobincoupon.onrender.com/admin/coupons`, {
        headers: {
          'x-access-token': token
        }
      });
      
      const coupon = res.data.coupons.find(c => c._id === id);
      if (coupon) {
        setCouponCode(coupon.code);
      } else {
        setError('Coupon not found');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Unauthorized, redirect to login
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch coupon details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!couponCode.trim()) {
      setError('Please enter a valid coupon code');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (isEditing) {
        // Update existing coupon
        await axios.patch('https://roundrobincoupon.onrender.com/admin/update-coupon', 
          { 
            coupon_id: id,
            code: couponCode 
          },
          { headers: { 'x-access-token': token } }
        );
        setSuccess('Coupon updated successfully');
      } else {
        // Add new coupon
        await axios.post('https://roundrobincoupon.onrender.com/admin/add-coupon', 
          { code: couponCode },
          { headers: { 'x-access-token': token } }
        );
        setSuccess('Coupon added successfully');
        setCouponCode(''); // Clear the form for adding more
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} coupon`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Coupon' : 'Add New Coupon'}
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 rounded-md border border-red-300">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 rounded-md border border-green-300">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="couponCode">
              Coupon Code
            </label>
            <input
              type="text"
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter coupon code"
              required
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-2 px-6 rounded transition duration-300`}
            >
              {loading ? 'Processing...' : isEditing ? 'Update Coupon' : 'Add Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCoupon;