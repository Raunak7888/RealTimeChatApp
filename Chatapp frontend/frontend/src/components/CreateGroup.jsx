import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const CreateGroup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = location.state?.currentUser;

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedMembers.length < 3) {
      setErrorMessage("A group must have at least 3 members.");
      return;
    }

    // Payload to send to the backend
    const payload = {
      groupName: groupName,
      createdBy: currentUser,
      memberIds: selectedMembers.map((member) => member.id),
    };

    try {
      // Send POST request to the backend
      const response = await axios.post("http://localhost:8080/auth/create", payload);

      // Handle success response
      setResponseMessage(`Group created successfully: ${response.data.groupName}`);
      setErrorMessage(null);
      setGroupName("");
      setSelectedMembers([]);

      // Redirect to /chat
      navigate("/chat");
    } catch (error) {
      // Handle error response
      setErrorMessage(error.response?.data?.message || "An error occurred");
      setResponseMessage(null);
    }
  };

  // Handler for user search
  const handleSearchChange = async (e) => {
    setSearchQuery(e.target.value);

    if (e.target.value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/auth/Data/Search`, {
        params: { query: e.target.value },
      });
      const filteredResults = response.data.filter((user) => !user.group);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Add user to the selected members list
  const handleAddMember = (user) => {
    if (!selectedMembers.find((member) => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove user from the selected members list
  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== userId));
  };

  return (
    <div className="create-group-container">
      <h2>Create a New Group</h2>
      <form onSubmit={handleSubmit}>
        <div className="create-group-form">
          <label>Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            className="create-group-input"
          />
        </div>

        <div className="create-group-form">
          <label>Search Users:</label>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={handleSearchChange}
            className="create-group-input"
          />
          {searchResults.length > 0 && (
            <div className="search-results2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="search-result-item2"
                  onClick={() => handleAddMember(user)}
                >
                  {user.name} {user.email}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="create-group-form">
          <label>Selected Members:</label>
          {selectedMembers.length > 0 ? (
            <ul className="selected-members-list">
              {selectedMembers.map((member) => (
                <li key={member.id} className="selected-member-item">
                  {member.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="remove-member-button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20px"
                      viewBox="0 -960 960 960"
                      width="20px"
                      fill="#F00"
                    >
                      <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No members selected</p>
          )}
        </div>

        <button type="submit" className="create-group-button">
          Create Group
        </button>
      </form>

      {responseMessage && <p className="response-message">{responseMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default CreateGroup;
