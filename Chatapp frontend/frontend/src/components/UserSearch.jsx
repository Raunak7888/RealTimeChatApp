// src/components/UserSearch.jsx
import React, { useState } from 'react';
import { searchUsers } from './api';

const UserSearch = ({ onUserSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        try {
            const users = await searchUsers(query);
            setResults(users);
            setError(null);
        } catch (err) {
            setError("Error searching users");
            setResults([]);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search for users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {error && <p>{error}</p>}

            {results.length > 0 && (
                <ul>
                    {results.map((user, index) => (
                        <li key={index} onClick={() => onUserSelect(user)}>
                            <strong>Username:</strong> {user.username} <br />
                            <strong>User ID:</strong> {user.userId}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserSearch;
