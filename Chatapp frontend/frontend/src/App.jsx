// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/login';
import SignupPage from './components/signup';
import ForgotPasswordPage from './components/forgot'
import SendToken from './components/token'; // Create this component for sending the password reset code to the user's email address
import VerifyPage from './components/verify';
import ResetPage from './components/reset';
import './components/css/app.css';
import Ok from './components/ok';
import CreateGroup from './components/CreateGroup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chat" element={<Ok/>} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/reset" element={<ResetPage />} />
        <Route path="/token" element={<SendToken />} />
        <Route path="/Group" element={<CreateGroup />} />

      </Routes>
    </Router>
  );
}

export default App;
