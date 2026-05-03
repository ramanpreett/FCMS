import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const SIGNUP_URL = `${API_URL}/api/signup`;

const Signup = ({ onSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post(SIGNUP_URL, { name, email, password });
      localStorage.setItem("token", res.data.token);
      onSignup();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 bg-white p-6 rounded shadow max-w-sm mx-auto mt-10" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>
      <input
        className="border p-2 w-full rounded"
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
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
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength="6"
      />
      <button 
        className="bg-green-500 text-white px-3 py-2 rounded w-full disabled:opacity-50" 
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
      {error && <div className="text-red-500 text-center">{error}</div>}
    </form>
  );
};

export default Signup;
