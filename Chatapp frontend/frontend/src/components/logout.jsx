import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Send the token to the server to invalidate it
      // const pureToken = Cookies.get('Authorization');
      // await axios.post('http://localhost:8080/api/logout', { token: pureToken });

      // Delete the token from cookies
      Cookies.remove("Authorization", { secure: true, sameSite: "Strict" });

      console.log("Logout successful");
      navigate("/login"); // Redirect to login page or any other desired page
    } catch (error) {
      console.error(
        "Error during logout:",
        error.response?.data || error.message
      );
    }
  };

  const handleCancelLogout = () => {
    navigate("/chat"); // Redirect to chat page or any other desired page
  };

  return (
    <div className="logout-container">
      <div className="confirmation-dialog">
        <p>Are you sure you want to logout?</p>
        <button className="confirm-button" onClick={handleLogout}>
          Yes
        </button>
        <button className="cancel-button" onClick={handleCancelLogout}>
          No
        </button>
      </div>
    </div>
  );
};

export default Logout;
