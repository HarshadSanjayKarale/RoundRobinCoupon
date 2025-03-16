import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState('');

  // Initialize session ID immediately when component mounts
  useEffect(() => {
    const initializeSessionId = () => {
      const existingSessionId = localStorage.getItem('couponSessionId');
      if (existingSessionId) {
        console.log('Using existing session ID:', existingSessionId);
        setSessionId(existingSessionId);
      } else {
        const newSessionId = uuidv4();
        localStorage.setItem('couponSessionId', newSessionId);
        setSessionId(newSessionId);
        console.log('Created new session ID:', newSessionId);
      }
    };
    
    initializeSessionId();
  }, []);

  const claimCoupon = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Get the current session ID or create one if it doesn't exist yet
      let currentSessionId = sessionId;
      
      if (!currentSessionId) {
        const storedId = localStorage.getItem('couponSessionId');
        if (storedId) {
          currentSessionId = storedId;
          setSessionId(storedId);
        } else {
          currentSessionId = uuidv4();
          localStorage.setItem('couponSessionId', currentSessionId);
          setSessionId(currentSessionId);
        }
      }
      
      console.log('Using session ID for request:', currentSessionId);
      
      // Use the currentSessionId directly in the request rather than the state variable
      const res = await axios.post('http://localhost:5000/claim-coupon', 
        { sessionId: currentSessionId },
        { withCredentials: true }
      );
      
      setResponse(res.data);
    } catch (err) {
      console.error('Error claiming coupon:', err);
      setError(err.response?.data?.message || 'Failed to claim coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 bg-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Round-Robin Coupon Distribution</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Efficiently distribute and claim coupons with our cutting-edge system designed for seamless experiences.
        </p>
      </div>
      {/* Claim Coupon Button */}
      <div className="text-center mt-12">
          <button
            onClick={claimCoupon}
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white py-3 px-12 rounded-full font-medium text-lg transition duration-300 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Claim Your Coupon Now'}
          </button>
          
          {response && (
            <div className="mt-8 max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-green-700">Success!</h2>
              </div>
              <p className="text-gray-700 mb-4">{response.message}</p>
              {response.coupon && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-dashed border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600">Your coupon code:</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-2xl font-bold text-gray-800">{response.coupon.code}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(response.coupon.code);
                        alert('Coupon code copied to clipboard!');
                      }}
                      className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="mt-8 max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border-l-4 border-red-500">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-red-700">Unable to claim</h2>
              </div>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

    {/* Feature Sections */}
        <div className="container mx-auto px-4 py-16">
          
          <div className="grid md:grid-cols-2 gap-10">
            {/* How It Works Section */}
            <div className="bg-gray-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <p className="text-gray-700 mb-6">
              Our system employs a unique round-robin method to ensure fair distribution of coupons among users. 
              Sign up, browse available coupons, and claim your favorites with ease.
            </p>
            <div className="flex justify-center">
              <img 
                src="https://qik-chat.com/wp-content/uploads/2023/03/lead-Distribution-round-robin-1024x533.jpg" 
                alt="How It Works" 
                className="rounded-lg h-64 w-120 object-cover" 
              />
            </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gray-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Benefits</h2>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li className="text-gray-700">Fair distribution of coupons</li>
              <li className="text-gray-700">Easy to use interface</li>
              <li className="text-gray-700">Wide variety of coupons</li>
            </ul>
            <div className="flex justify-center">
              <img 
                src="https://cdn.prod.website-files.com/6482fc3c808f4e9db58cda1d/66ed3b58eb3231340bda8811_657ac82ba7f1d4bb9c155c43_round_robin_sales_4x.webp" 
                alt="Benefits" 
                className="rounded-lg h-64 w-120 object-cover" 
              />
            </div>
            </div>
          </div>

          
        </div>

        {/* Footer */}
      <div className="bg-white py-10 mt-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">About Us</h3>
              <p className="text-gray-600">Learn more about our mission and team.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-gray-600">Get in touch with us for any queries.</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-black">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-4 text-gray-500 text-sm">© 2025 RoundRobinCoupon. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;