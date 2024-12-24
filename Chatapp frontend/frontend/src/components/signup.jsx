// src/components/SignupPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import './css/signup.css';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:8080/auth/signup', {
        email,
        username,
        password,
      });

      if (response.status === 201) { // Assuming 201 status code for successful creation
        setSuccess('Signup successful! Please login.');
        setEmail('');
        setUsername('');
        setPassword('');
        navigate('/verify')
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p className='link'>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

export default SignupPage;
