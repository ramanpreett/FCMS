import React, { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Projects from "./components/Projects";
import Invoices from "./components/Invoices";
import Meetings from "./components/Meetings";
import Settings from "./components/Settings";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

const App = () => {
  // Check for existing token on app start
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("token") !== null;
  });
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onPageChange={setActivePage} />;
      case 'clients':
        return <Clients />;
      case 'invoices':
        return <Invoices />;
      case 'meetings':
        return <Meetings />;
      case 'projects':
        return <Projects />;
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600">Advanced analytics and reporting coming soon...</p>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onPageChange={setActivePage} />;
    }
  };

  if (!isLoggedIn) {
    if (activePage === 'signup') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">ClientPulse</h1>
              <p className="mt-2 text-gray-600">Freelance Management System</p>
            </div>
            <Signup onSignup={() => { setIsLoggedIn(true); setActivePage('dashboard'); }} />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setActivePage('login')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">ClientPulse</h1>
            <p className="mt-2 text-gray-600">Freelance Management System</p>
          </div>
          <Login onLogin={handleLogin} />
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setActivePage('signup')}
                className="text-blue-600 hover:text-blue-800"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header onLogout={handleLogout} onPageChange={setActivePage} />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
