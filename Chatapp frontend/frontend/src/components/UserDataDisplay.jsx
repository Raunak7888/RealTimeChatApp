// src/components/UserDataDisplay.jsx
import React, { useEffect, useState } from 'react';
import { getUserData } from './api';

const UserDataDisplay = ({ userId }) => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            getUserData(userId)
                .then((data) => setUserData(data))
                .catch((err) => setError("User data could not be fetched."));
        }
    }, [userId]);

    if (error) return <p>{error}</p>;

    return (
        <div>
            {userData ? (
                <div>
                    <h3>User Data</h3>
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p><strong>User ID:</strong> {userData.userId}</p>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default UserDataDisplay;
