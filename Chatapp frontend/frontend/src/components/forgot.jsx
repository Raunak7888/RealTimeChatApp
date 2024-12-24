// src/components/ForgotPasswordPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/forget.css'; // Create this CSS file for styling if needed

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/forget', { email });
      
      if (response.status === 200) {
        setMessage('Check your email for a password reset link!');
        navigate('/reset');
      }
    } catch (err) {
      setError('Error sending reset link. Please try again.');
      console.error('Forgot password error:', err);
    }
  };

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleForgotPassword}>
        <h2 className='topname'>Forgot Password</h2>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
