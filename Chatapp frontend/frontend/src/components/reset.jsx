// src/components/ResetPasswordPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/reset.css';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordResetCode, setPasswordResetCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:8080/auth/reset', {
        email,
        newPassword,
        passwordResetCode,
      });

      if (response.status === 200) { 
        setSuccess('Password reset successful');
        setEmail('');
        setNewPassword('');
        setPasswordResetCode('');
        navigate('/login');
      }
    } catch (err) {
      setError('Password reset failed. Please try again.');
      console.error('Password reset error:', err);
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
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
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Reset Code:</label>
          <input
            type="text"
            value={passwordResetCode}
            onChange={(e) => setPasswordResetCode(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
