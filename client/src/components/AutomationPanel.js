import React, { useState } from "react";
import axios from "axios";
import { API_URL as API_BASE_URL } from "../config";

const AutomationPanel = ({ onClientCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${API_BASE_URL}/api/automation`;
  const WEBHOOK_URL = `${API_BASE_URL}/api/webhook/client`;

  const [formData, setFormData] = useState({
    emailContent: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (source) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let endpoint = "";
      let data = {};

      switch (source) {
        case 'email':
          endpoint = '/email';
          data = { emailContent: formData.emailContent };
          break;
        default:
          throw new Error('Invalid source');
      }

      const response = await axios.post(`${API_URL}${endpoint}`, data, {
        headers: { Authorization: localStorage.getItem("token") }
      });

      setSuccess(`Client profile created successfully from ${source}!`);
      setFormData(prev => ({ ...prev, [source + 'Url']: "", emailContent: "" }));
      
      if (onClientCreated) {
        onClientCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden border border-purple-200">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Smart Client Automation</h2>
              <p className="text-blue-100 text-sm">Extract client data automatically from message content</p>
            </div>
          </div>
          
        </div>
      </div>

      <div className="p-8">

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              {/* <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg> */}
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}



        {/* Email Parser */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <div className="flex items-start gap-4 mb-6">
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Content Parser</h3>
                
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="email-content" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  
                  
                </label>
                <div className="relative">
                  <textarea
                    id="email-content"
                    value={formData.emailContent}
                    onChange={(e) => handleInputChange('emailContent', e.target.value)}
                    placeholder="Paste your email content here... The AI will automatically detect and extract client information including names, contact details, and relevant business information."
                    rows="8"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 resize-none"
                  />
                  <div className="absolute top-4 right-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
              </div>
              
              <button
                onClick={() => handleSubmit('email')}
                disabled={loading || !formData.emailContent}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Parsing Content...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Parse & Create Client
                  </>
                )}
              </button>
            </div>
          </div>

        {/* Enhanced Webhook Information */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                Webhook Integration
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">API</span>
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Connect external tools and services directly to your client database with our webhook endpoint.
              </p>
              
              <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Webhook URL</span>
                  <button 
                    onClick={() => navigator.clipboard?.writeText(WEBHOOK_URL)}
                    className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded-lg transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
                <code className="text-sm text-gray-800 break-all bg-gray-50 p-3 rounded-lg block font-mono">
                  {WEBHOOK_URL}
                </code>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-indigo-100">
                  <h5 className="font-semibold text-gray-800 text-sm mb-2">✨ Features</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Real-time client creation</li>
                    <li>• JSON payload support</li>
                    <li>• Automatic data validation</li>
                    <li>• Error handling & logging</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-indigo-100">
                  <h5 className="font-semibold text-gray-800 text-sm mb-2">🔧 Use Cases</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Contact forms integration</li>
                    <li>• CRM synchronization</li>
                    <li>• Lead capture automation</li>
                    <li>• Third-party tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;


