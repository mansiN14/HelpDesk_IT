import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./firebase"; // Import storage from shared firebase file

export default function AuthSystem({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [loginType, setLoginType] = useState("user"); // "user" or "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [empName, setEmpName] = useState(""); // Add employee name state
  const [department, setDepartment] = useState("");
  const [photoFile, setPhotoFile] = useState(null); // State for photo file
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // <-- Add this line

  // Helper: Check if user is admin and get user data
  const checkAdmin = async (uid) => {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userDoc = snap.docs[0];
      const userData = userDoc.data();
      return {
        isAdmin: userData.role === "admin",
        userData: userData,
        docId: userDoc.id
      };
    }
    return { isAdmin: false, userData: null, docId: null };
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Starting login process...", { email, loginType });
    
    try {
      console.log("Attempting Firebase authentication...");
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase auth successful:", userCred.user.uid);
      
      console.log("Checking admin status...");
      const { isAdmin, userData, docId } = await checkAdmin(userCred.user.uid);
      console.log("Admin check result:", { isAdmin, userData, docId });

      if (loginType === "admin" && !isAdmin) {
        console.log("Login failed: Not an admin account");
        setError("This is not an admin account.");
        setLoading(false);
        return;
      }
      if (loginType === "user" && isAdmin) {
        console.log("Login failed: Admin account used for user login");
        setError("This is an admin account. Please use Admin Login.");
        setLoading(false);
        return;
      }

      let photoURL = userData?.photoURL;
      console.log("Current photo URL:", photoURL);

      // If admin login and photo file provided, upload and update
      if (loginType === "admin" && docId && photoFile) {
        try {
          console.log("Starting photo upload process...");
          const storageRef = ref(storage, `profile_photos/${userCred.user.uid}_${Date.now()}`);
          console.log("Storage reference created:", storageRef);
          
          const uploadResult = await uploadBytes(storageRef, photoFile);
          console.log("Photo upload successful:", uploadResult);
          
          photoURL = await getDownloadURL(uploadResult.ref);
          console.log("New photo URL obtained:", photoURL);

          const userRef = doc(db, "users", docId);
          await updateDoc(userRef, {
            photoURL: photoURL,
            updatedAt: new Date()
          });
          console.log("User document updated with new photo URL");
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          setError("Photo upload failed: " + uploadError.message);
          setLoading(false);
          return;
        }
      }

      // Create user object with additional data including photoURL
      const userWithData = {
        ...userCred.user,
        name: userData?.name || userCred.user.displayName,
        empName: userData?.empName || '',
        department: userData?.department || 'IT Department',
        photoURL: photoURL,
        docId: docId
      };

      console.log("Preparing to call onLogin with user data:", userWithData);
      onLogin({ user: userWithData, isAdmin });
      
      console.log("Navigation starting...");
      if (isAdmin) {
        navigate("/admindashboard");
      } else {
        navigate("/userdashboard");
      }
      console.log("Navigation completed");
    } catch (err) {
      console.error("Login process error:", err);
      setError("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registration successful, userCred:", userCred);
      const role = loginType === "admin" ? "admin" : "user";
      console.log("User role for registration:", role);
      let photoURL = null;

      // Upload photo if provided during registration
      if (photoFile) {
        const storageRef = ref(storage, `profile_photos/${userCred.user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      // Add user data to Firestore
      await addDoc(collection(db, "users"), {
        uid: userCred.user.uid,
        name: name,
        empName: empName, // Add employee name to user data
        email,
        department: department || 'IT Department',
        role,
        photoURL: photoURL,
        createdAt: new Date()
      });

      // Create user object with additional data
      const userWithData = {
        ...userCred.user,
        name: name,
        empName: empName, // Add employee name to user object
        department: department || 'IT Department',
        photoURL: photoURL
      };

      onLogin({ user: userWithData, isAdmin: role === "admin" });
      if (role === "admin") {
        navigate("/admindashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed: " + err.message);
    }
    setLoading(false);
  };

  // Clear form fields when switching login type or mode
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setEmpName(""); // Reset employee name
    setDepartment("");
    setPhotoFile(null);
    setError("");
  };

  // Call resetForm when loginType or mode changes
  React.useEffect(() => {
    resetForm();
  }, [loginType, mode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-purple-900 overflow-hidden">
      <div className="max-w-sm w-full bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/20 relative z-10 mx-4">
        <div className="flex justify-center mb-8 bg-black/20 backdrop-blur-md rounded-lg p-1 border border-white/10">
          <button
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${loginType === "user" 
              ? 'bg-gradient-to-r from-purple-600/80 to-purple-800/80 text-white shadow-lg shadow-purple-500/20 backdrop-blur-md' 
              : 'bg-transparent text-gray-200 hover:bg-white/5'}`}
            onClick={() => {
              setLoginType("user");
              setMode("login");
            }}
            type="button"
          >
            User {mode === "login" ? "Login" : "Register"}
          </button>
          <button
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${loginType === "admin" 
              ? 'bg-gradient-to-r from-purple-600/80 to-purple-800/80 text-white shadow-lg shadow-purple-500/20 backdrop-blur-md' 
              : 'bg-transparent text-gray-200 hover:bg-white/5'}`}
            onClick={() => {
              setLoginType("admin");
              setMode("login");
            }}
            type="button"
          >
            Admin Login
          </button>
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
          {loginType === "admin" ? "Admin" : "User"} {mode === "login" ? "Login" : "Register"}
        </h2>
        {error && <div className="mb-6 p-4 bg-red-950/80 text-red-300 rounded-lg border border-red-700/50 backdrop-blur-sm">{error}</div>}
        
        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-6">
          {(mode === "register" || loginType === "admin") && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              {mode === "register" && loginType === "user" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Employee Name</label>
                  <input
                    type="text"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 !text-purple-200">Department</label>
                <input
                  type="text"
                  className="w-full !bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  required={mode === "register"}
                />
              </div>
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium mb-2 !text-purple-200">Profile Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full !bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    onChange={e => setPhotoFile(e.target.files[0])}
                    required={mode === "register" && loginType === "admin"}
                  />
                </div>
              )}
            </>
          )}
          {loginType === "user" && mode === "login" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Employee Name</label>
              <input
                type="text"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2 !text-purple-200">Email</label>
            <input
              type="email"
              className="w-full !bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 !text-purple-200">Password</label>
            <input
              type="password"
              className="w-full !bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-700 via-purple-800 to-purple-700 text-white p-3 rounded-lg hover:from-purple-800 hover:via-purple-900 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <div className="mt-6 text-center !text-purple-200">
          {mode === "login" && loginType !== "admin" ? (
            <>
              Don't have an account?{" "}
              <button className="!text-purple-300 hover:!text-purple-200 transition-colors" onClick={() => setMode("register")}>
                Register
              </button>
            </>
          ) : mode === "register" && loginType !== "admin" ? (
            <>
              Already have an account?{" "}
              <button className="!text-purple-300 hover:!text-purple-200 transition-colors" onClick={() => setMode("login")}>
                Login
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
