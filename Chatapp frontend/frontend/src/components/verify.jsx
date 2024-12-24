// src/components/VerifyPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/verify.css'; // Create this CSS file for styling if needed

const VerifyPage = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/verify', {
        email: email,
        verificationCode: verificationCode,
      });

      if (response.status === 200) {
        setMessage('Verification successful! You can now Login to Your Account.');
        // Redirect to reset password page or show success message
        navigate('/login');
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error('Verification error:', err);
    }
  };

  return (
    <div className="verify-container">
      <h2>Verify Your Email</h2>
      <form onSubmit={handleVerify}>
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
          <label>Verification Code:</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </div>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default VerifyPage;
