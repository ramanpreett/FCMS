import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const LOGIN_URL = `${API_URL}/api/login`;

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post(LOGIN_URL, { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 bg-white p-6 rounded shadow max-w-sm mx-auto mt-10" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
      <input
        className="border p-2 w-full rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        className="border p-2 w-full rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button 
        className="bg-blue-500 text-white px-3 py-2 rounded w-full disabled:opacity-50" 
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <div className="text-red-500 text-center">{error}</div>}
    </form>
  );
};

export default Login;
