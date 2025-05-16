import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import AuthSystem from "./AuthSystem";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = ({ user, isAdmin }) => {
    setUser(user);
    setIsAdmin(isAdmin);
    if (isAdmin) {
      navigate("/admindashboard");
    } else {
      navigate("/userdashboard");
    }
  };

  return (
    <Routes>
      <Route path="/" element={<AuthSystem onLogin={handleLogin} />} />
      <Route path="/userdashboard" element={<UserDashboard user={user} />} />
      <Route path="/admindashboard" element={<AdminDashboard user={user} />} />
    </Routes>
  );
}

export default App;