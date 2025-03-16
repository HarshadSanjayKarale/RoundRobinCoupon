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
      const res = await axios.get('http://localhost:5000/user-history', {
        withCredentials: true
      });
      setHistory(res.data.history || []);
      setError(null);
    } catch (err) {
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
    <div className="container mx-auto max-w-3xl p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Your Claim History</h1>
        
        {loading ? (
          <div className="text-center p-6">
            <p className="text-gray-500">Loading your claim history...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 rounded-md border border-red-300">
            <p className="text-red-700">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">You haven't claimed any coupons yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Coupon Code</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">Claimed Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium">{item.coupon_code}</td>
                    <td className="px-4 py-3 border-b text-gray-500">{formatDate(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6">
          <button 
            onClick={fetchHistory}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Refresh History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimHistory;