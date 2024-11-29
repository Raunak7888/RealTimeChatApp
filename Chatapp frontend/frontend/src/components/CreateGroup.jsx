import React, { useState } from "react";
import axios from "axios";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [createdBy, setCreatedBy] = useState(""); // ID of the group creator
  const [memberIds, setMemberIds] = useState(""); // Comma-separated user IDs
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse member IDs from the input
    const memberIdsArray = memberIds.split(",").map((id) => parseInt(id.trim()));

    // Payload to send to the backend
    const payload = {
      groupName: groupName,
      createdBy: parseInt(createdBy),
      memberIds: memberIdsArray,
    };

    try {
      // Send POST request to the backend
      const response = await axios.post("http://localhost:8080/auth/create", payload);

      // Handle success response
      setResponseMessage(`Group created successfully: ${response.data.groupName}`);
      setErrorMessage(null);
    } catch (error) {
      // Handle error response
      setErrorMessage(error.response?.data?.message || "An error occurred");
      setResponseMessage(null);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Create a New Group</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Created By (User ID):</label>
          <input
            type="number"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Member IDs (comma-separated):</label>
          <input
            type="text"
            value={memberIds}
            onChange={(e) => setMemberIds(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Create Group
        </button>
      </form>

      {responseMessage && (
        <p style={{ marginTop: "20px", color: "green" }}>{responseMessage}</p>
      )}
      {errorMessage && (
        <p style={{ marginTop: "20px", color: "red" }}>{errorMessage}</p>
      )}
    </div>
  );
};

export default CreateGroup;
