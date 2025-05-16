import React, { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // <-- Add this import

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBBqvva2cJ6wy8ssrP76Vgh5H9wZNLATWE",
  authDomain: "ithelpdesk-ebf1e.firebaseapp.com",
  projectId: "ithelpdesk-ebf1e",
  storageBucket: "ithelpdesk-ebf1e.firebasestorage.app",
  messagingSenderId: "163734375056",
  appId: "1:163734375056:web:38a2e670015e6e73eb2615",
  measurementId: "G-QYX1WNLZ3C"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export default function AuthSystem({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [loginType, setLoginType] = useState("user"); // "user" or "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // <-- Add this line

  // Helper: Check if user is admin by Firestore role
  const checkAdmin = async (uid) => {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userData = snap.docs[0].data();
      return userData.role === "admin";
    }
    return false;
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = await checkAdmin(userCred.user.uid);
      if (loginType === "admin" && !isAdmin) {
        setError("This is not an admin account.");
        setLoading(false);
        return;
      }
      if (loginType === "user" && isAdmin) {
        setError("This is an admin account. Please use Admin Login.");
        setLoading(false);
        return;
      }
      onLogin({ user: userCred.user, isAdmin });
      // Redirect to admin dashboard if admin
      if (isAdmin) {
        navigate("/admindashboard");
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
    setLoading(false);
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // Set role based on loginType
      const role = loginType === "admin" ? "admin" : "user";
      await addDoc(collection(db, "users"), {
        uid: userCred.user.uid,
        displayName: name,
        email,
        role
      });
      onLogin({ user: userCred.user, isAdmin: role === "admin" });
      // Redirect to admin dashboard if admin
      if (role === "admin") {
        navigate("/admindashboard");
      }
    } catch (err) {
      setError("Registration failed: " + err.message);
    }
    setLoading(false);
  };

  // Clear form fields when switching login type or mode
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
  };

  // Call resetForm when loginType or mode changes
  React.useEffect(() => {
    resetForm();
  }, [loginType, mode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-l ${loginType === "user" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            onClick={() => {
              setLoginType("user");
              setMode("login");
            }}
            type="button"
          >
            User {mode === "login" ? "Login" : "Register"}
          </button>
          <button
            className={`px-4 py-2 rounded-r ${loginType === "admin" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            onClick={() => {
              setLoginType("admin");
              setMode("login"); // Always force login mode for admin
            }}
            type="button"
          >
            Admin Login
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {loginType === "admin" ? "Admin" : "User"} {mode === "login" ? "Login" : "Register"}
        </h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && loginType !== "admin" && (
            <div className="mb-4">
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          {mode === "login" && loginType !== "admin" ? (
            <>
              Don't have an account?{" "}
              <button className="text-purple-600" onClick={() => setMode("register")}>
                Register
              </button>
            </>
          ) : mode === "register" && loginType !== "admin" ? (
            <>
              Already have an account?{" "}
              <button className="text-purple-600" onClick={() => setMode("login")}>
                Login
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
