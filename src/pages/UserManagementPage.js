import React, { useState, useEffect } from 'react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const emptyUser = { 
    username: "", 
    password: "", 
    fullname: "", 
    email: "", 
    image: "", 
    role: "worker" 
  };
  const [formUser, setFormUser] = useState(emptyUser);
  const [editingIndex, setEditingIndex] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormUser({ ...formUser, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormUser({ ...formUser, image: reader.result });
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formUser.username || !formUser.password || !formUser.fullname || !formUser.email) {
      setMessage("Please fill out all required fields.");
      return;
    }

    try {
      let response;
      if (editingIndex !== null) {
        // Update existing user
        response = await fetch(`http://localhost:5000/api/users/${users[editingIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formUser),
        });
      } else {
        // Create new user
        response = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formUser),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save user');
      }

      setMessage(editingIndex !== null ? "User updated successfully!" : "User added successfully!");
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
      setMessage(error.message || "An error occurred while saving");
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormUser(users[index]);
    setPreview(users[index].image);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error('Failed to delete user');

        setMessage("User deleted successfully!");
        fetchUsers();
        if (editingIndex !== null && users[editingIndex].id === id) {
          resetForm();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setMessage("Failed to delete user");
      }
    }
  };

  const resetForm = () => {
    setFormUser(emptyUser);
    setEditingIndex(null);
    setPreview(null);
    setMessage("");
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="user-management container">
      <h2>User Management</h2>
      {message && <p className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formUser.username}
            onChange={handleFormChange}
            placeholder="Enter username"
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formUser.password}
            onChange={handleFormChange}
            placeholder="Enter password"
            required
          />
        </div>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullname"
            value={formUser.fullname}
            onChange={handleFormChange}
            placeholder="Enter full name"
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formUser.email}
            onChange={handleFormChange}
            placeholder="Enter email address"
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select
            name="role"
            value={formUser.role}
            onChange={handleFormChange}
            required
          >
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label>Profile Picture:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
        </div>
        {preview && (
          <div className="image-preview">
            <img
              src={preview}
              alt="Preview"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          </div>
        )}
        <button type="submit">
          {editingIndex !== null ? "Update User" : "Add User"}
        </button>
        {editingIndex !== null && (
          <button type="button" onClick={resetForm} className="cancel-btn">
            Cancel
          </button>
        )}
      </form>

      <hr />
      
      <h3>Existing Users ({users.length}):</h3>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <div className="user-list">
          {users.map((user, index) => (
            <div key={user.id} className="user-item">
              <div className="user-info">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.fullname}
                    className="user-avatar"
                  />
                )}
                <div>
                  <strong>{user.fullname}</strong>
                  <div>Username: {user.username}</div>
                  <div>Email: {user.email}</div>
                  <div>Role: {user.role}</div>
                </div>
              </div>
              <div className="user-actions">
                <button onClick={() => handleEdit(index)} className="edit-btn">
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(user.id)} 
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;