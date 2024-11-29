import React, { useState, useEffect } from "react";
import "./css/chatList.css";
import { searchUsers } from "./api"; // Import the search API function

const ChatList = ({ onChatSelect }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatList, setChatList] = useState([]); // List of users and groups for chat
  const [activeChat, setActiveChat] = useState(null); // Current active chat user/group

  const handleSearchChange = async (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.trim()) {
      try {
        const results = await searchUsers(newQuery);
        console.log("Search Results:", results);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users/groups:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleChatSelect = (chat) => {
    // Avoid adding duplicate users/groups to the chat list
    if (!chatList.some((item) => item.id === chat.id && item.group === chat.group)) {
      setChatList((prevList) => [...prevList, chat]); // Add user/group to chat list
    }
    setActiveChat(chat); // Set selected user/group as the active chat
    setSearchResults([]); // Clear search results
    setQuery(""); // Clear search bar input
    onChatSelect(chat.id, chat.name, chat.group); // Notify parent component
  };

  useEffect(() => {
    console.log("Updated Chat List:", chatList);
  }, [chatList]); // Logs the updated chat list whenever it changes

  const handleChatListClick = (chat) => {
    setActiveChat(chat); // Set clicked user/group as the active chat
    onChatSelect(chat.id, chat.name, chat.group); // Notify parent component
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h1>Chat App</h1>
      </div>
      <div className="chat-sidebar-search">
        <input
          type="text"
          placeholder="Search users or groups"
          value={query}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((chat, index) => (
              <div
                key={`${chat.id}-${chat.group}`} // Unique key combining id and group
                className="search-result-item"
                onClick={() => handleChatSelect(chat)}
              >
                {chat.name} {chat.group ? "(Group)" : "(User)"}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="chat-list">
        {chatList.length > 0 ? (
          chatList.map((chat, index) => (
            <div
              key={`${chat.id}-${chat.group}`} // Unique key combining id and group
              className={`chat-list-item ${
                activeChat?.id === chat.id && activeChat?.group === chat.group
                  ? "active"
                  : ""
              }`}
              onClick={() => handleChatListClick(chat)}
            >
              <span className="chat-name">
                {chat.name} {chat.group ? "(Group)" : "(User)"}
              </span>
            </div>
          ))
        ) : (
          <div className="chat-list-item">No active chats</div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
