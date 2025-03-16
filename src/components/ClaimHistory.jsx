import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClaimHistory = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Use the SAME key as in Home.jsx - 'couponSessionId'
      const sessionId = localStorage.getItem('couponSessionId');
      
      console.log('Fetching history with sessionId:', sessionId);
      
      // Use different approaches for sending the sessionId
      let url = 'https://roundrobincoupon.onrender.com/user-history';
      
      // If we have a sessionId in localStorage, append it as a query parameter
      if (sessionId) {
        url += `?sessionId=${encodeURIComponent(sessionId)}`;
      }
      
      const res = await axios.get(url, {
        withCredentials: true,
        headers: {
          // Also send it as a custom header as fallback
          'X-Session-ID': sessionId || ''
        }
      });
      
      console.log('Server response:', res.data);
      setHistory(res.data.history || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to fetch claim history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="text-center py-12 px-4 bg-white">
        <h1 className="text-4xl font-bold mb-3">Your Claim History</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Track and manage all your previously claimed coupons in one place.
        </p>
      </div>

      {/* History Content Section */}
      <div className="container mx-auto max-w-4xl p-6 mt-8">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          
          {loading ? (
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Loading your claim history...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-500 text-lg">You haven't claimed any coupons yet.</p>
              <p className="text-gray-500 mt-2">Head over to the home page to claim your first coupon!</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Coupon Code</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Claimed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 border-b font-medium text-blue-600">{item.coupon_code}</td>
                      <td className="px-6 py-4 border-b text-gray-600">{formatDate(item.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <button 
              onClick={fetchHistory}
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white py-3 px-10 rounded-full font-medium text-lg transition duration-300 disabled:bg-gray-400"
            >
              {loading ? 'Refreshing...' : 'Refresh History'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-white py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">© 2025 RoundRobinCoupon. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimHistory;