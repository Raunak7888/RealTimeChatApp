// src/App.jsx
import React, { useState } from 'react';
import UserSearch from './UserSearch';
import UserDataDisplay from './UserDataDisplay';

const Demo = () => {const [selectedUser, setSelectedUser] = useState(null);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    return (
        <div>
            <h1>User Search and Display</h1>
            <UserSearch onUserSelect={handleUserSelect} />
            {selectedUser && (
                <UserDataDisplay userId={selectedUser.userId} />
            )}
        </div>
    );
};

export default Demo;
