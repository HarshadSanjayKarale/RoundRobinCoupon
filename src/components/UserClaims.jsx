import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchClaims();
  }, [navigate]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const res = await axios.get('http://localhost:5000/admin/claims', {
        headers: {
          'x-access-token': token
        }
      });
      
      setClaims(res.data.claims || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        // Unauthorized, redirect to login
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch claim history');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">User Claims History</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 rounded-md border border-red-300">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center p-10">
            <p className="text-gray-500">Loading claim history...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-md">
            <p className="text-gray-500">No claims history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Coupon Code</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">IP Address</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Session ID</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium">{claim.coupon_code || claim.coupon_id}</td>
                    <td className="px-4 py-3 border-b text-gray-600">{claim.ip_address}</td>
                    <td className="px-4 py-3 border-b text-gray-600 font-mono text-sm">
                      {claim.session_id.substring(0, 16)}...
                    </td>
                    <td className="px-4 py-3 border-b text-gray-600">
                      {formatDate(claim.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination could be added here if needed */}
        
        {/* Refresh Button */}
        <div className="mt-6">
          <button 
            onClick={fetchClaims}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Statistics Summary */}
      {!loading && claims.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <h2 className="text-gray-500 text-sm font-medium">Total Claims</h2>
            <p className="text-2xl font-bold text-gray-800">{claims.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <h2 className="text-gray-500 text-sm font-medium">Unique IPs</h2>
            <p className="text-2xl font-bold text-gray-800">
              {new Set(claims.map(claim => claim.ip_address)).size}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <h2 className="text-gray-500 text-sm font-medium">Unique Sessions</h2>
            <p className="text-2xl font-bold text-gray-800">
              {new Set(claims.map(claim => claim.session_id)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserClaims;