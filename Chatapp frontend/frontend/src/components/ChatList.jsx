// ChatList.js
import React, { useState } from 'react';
import './css/chatList.css';
import { searchUsers } from './api';  // Import the search API function

const ChatList = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle the search input change and fetch search results
  const handleSearchChange = async (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.trim()) {
      try {
        const results = await searchUsers(newQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle selecting a user from the search results
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchResults([]);  // Clear search results
    setQuery('');  // Clear search input

    // Pass the selected user to the parent component
    onUserSelect(user.userId, user.username);
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h1>Chat App</h1>
      </div>

      <div className="chat-sidebar-search">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      <div className="chat-list">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user.userId}
              className="chat-list-item"
              onClick={() => handleUserSelect(user)}  // Set the selected user
            >
              <div className="chat-info">
                <span className="chat-name">{user.username}</span>
              </div>
            </div>
          ))
        ) : (
          selectedUser ? (
            <div className="chat-list-item">
              <div className="chat-info">
                <span className="chat-name">{selectedUser.username}</span>
              </div>
            </div>
          ) : (
            <div className="chat-list-item">
              <span>No users selected</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChatList;
