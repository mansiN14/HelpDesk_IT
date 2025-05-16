import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Bell, User, Search, Plus, Info, Clock, CheckCircle, LogOut } from "lucide-react";
import { LayoutDashboard, Ticket, BookOpen, BarChart2 } from "lucide-react";
import { initializeApp } from "firebase/app";
import Chatbot from './chatbot';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  updateDoc,
  orderBy,
  Timestamp
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBqvva2cJ6wy8ssrP76Vgh5H9wZNLATWE",
  authDomain: "ithelpdesk-ebf1e.firebaseapp.com",
  projectId: "ithelpdesk-ebf1e",
  storageBucket: "ithelpdesk-ebf1e.firebasestorage.app",
  messagingSenderId: "163734375056",
  appId: "1:163734375056:web:38a2e670015e6e73eb2615",
  measurementId: "G-QYX1WNLZ3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const floorConfig = {
  S1: {
    systems: [
      { id: "S1-01" }, { id: "S1-02" }, { id: "S1-03" }, { id: "S1-04" }, { id: "S1-05" },
      { id: "S1-06" }, { id: "S1-07" }, { id: "S1-08" }, { id: "S1-09" }, { id: "S1-10" }
    ],
    cabins: [
      { id: 1, systems: [{ id: "S1-C1-01" }, { id: "S1-C1-02" }, { id: "S1-C1-03" }, { id: "S1-C1-04" }, { id: "S1-C1-05" }] },
      { id: 2, systems: [{ id: "S1-C2-01" }, { id: "S1-C2-02" }, { id: "S1-C2-03" }, { id: "S1-C2-04" }, { id: "S1-C2-05" }] }
    ]
  },
  S2: {
    systems: [
      { id: "S2-01" }, { id: "S2-02" }, { id: "S2-03" }, { id: "S2-04" }, { id: "S2-05" },
      { id: "S2-06" }, { id: "S2-07" }, { id: "S2-08" }, { id: "S2-09" }, { id: "S2-10" }
    ],
    cabins: [
      { id: 1, systems: [{ id: "S2-C1-01" }, { id: "S2-C1-02" }, { id: "S2-C1-03" }, { id: "S2-C1-04" }, { id: "S2-C1-05" }] },
      { id: 2, systems: [{ id: "S2-C2-01" }, { id: "S2-C2-02" }, { id: "S2-C2-03" }, { id: "S2-C2-04" }, { id: "S2-C2-05" }] }
    ]
  },
  S3: { systems: [], cabins: [] },
  S4: { systems: [], cabins: [] }
};

export default function ITHelpDesk() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [language, setLanguage] = useState("English");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authError, setAuthError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false); // New state to track initialization
  const [selectedFloor, setSelectedFloor] = useState("S1");
  
  // Form state for creating new tickets
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "Medium",
    department: "IT",
    deviceId: "" // Added deviceId for linking ticket to device
  });

  // Helper to get all device IDs for a floor (open office + cabins)
  const getDevicesForFloor = (floor) => {
    if (!floorConfig[floor]) return [];
    const openSystems = floorConfig[floor].systems.map(s => ({ id: s.id, name: s.id }));
    const cabinSystems = floorConfig[floor].cabins.flatMap(cabin =>
      cabin.systems.map(s => ({ id: s.id, name: s.id }))
    );
    return [...openSystems, ...cabinSystems];
  };

  const devices = getDevicesForFloor(selectedFloor);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser?.email);
      setUser(currentUser);
      setIsInitialized(true); // Mark as initialized once we have auth state
      
      if (currentUser) {
        fetchTickets();
      } else {
        setTickets([]);
        setFilteredTickets([]);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch tickets when user changes or actively requested
  useEffect(() => {
    if (user && isInitialized) {
      fetchTickets();
    }
  }, [user, isInitialized]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setAuthError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      // Store additional user info in Firestore
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        displayName: registerName,
        email: registerEmail,
        createdAt: Timestamp.now()
      });
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterName("");
    } catch (error) {
      setAuthError(`Registration failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Fetch tickets from Firestore
  const fetchTickets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log("Fetching tickets for user:", user.email);
      
      let querySnapshot;
      
      if (user.email.includes("admin")) {
        // Admin sees all tickets
        console.log("Admin user detected, fetching all tickets");
        querySnapshot = await getDocs(
          query(collection(db, "tickets"), orderBy("createdAt", "desc"))
        );
      } else {
        // Regular users see only their tickets
        console.log("Regular user detected, fetching user tickets");
        querySnapshot = await getDocs(
          query(
            collection(db, "tickets"), 
            where("createdBy", "==", user.uid),
            orderBy("createdAt", "desc")
          )
        );
      }
      
      console.log("Query executed, documents count:", querySnapshot.docs.length);
      
      const ticketsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to JS Date if needed
          createdAt: data.createdAt?.toDate().toLocaleString() || 'Unknown'
        };
      });
      
      console.log("Tickets loaded:", ticketsData.length);
      setTickets(ticketsData);
      setFilteredTickets(ticketsData); // Initialize filtered tickets
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets: " + err.message);
      setTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters
  useEffect(() => {
    if (tickets.length > 0) {
      let results = [...tickets];
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(ticket => 
          ticket.title?.toLowerCase().includes(query) || 
          ticket.description?.toLowerCase().includes(query) ||
          ticket.department?.toLowerCase().includes(query)
        );
      }
      
      // Apply status filter
      if (filterStatus !== "All") {
        results = results.filter(ticket => ticket.status === filterStatus);
      }
      
      setFilteredTickets(results);
    } else {
      setFilteredTickets([]);
    }
  }, [searchQuery, filterStatus, tickets]);

  // Mock data for tickets by priority - based on actual data now
  const getPriorityData = () => {
    const priorityCounts = {
      "Low": 0, 
      "Medium": 0, 
      "High": 0
    };
    
    tickets.forEach(ticket => {
      if (priorityCounts.hasOwnProperty(ticket.priority)) {
        priorityCounts[ticket.priority]++;
      }
    });
    
    return Object.keys(priorityCounts).map(key => ({
      name: key,
      value: priorityCounts[key]
    }));
  };

  // Data for tickets by department - based on actual data now
  const getDepartmentData = () => {
    const deptCounts = {};
    
    tickets.forEach(ticket => {
      if (!deptCounts[ticket.department]) {
        deptCounts[ticket.department] = 0;
      }
      deptCounts[ticket.department]++;
    });
    
    return Object.keys(deptCounts).map(key => ({
      name: key,
      value: deptCounts[key]
    }));
  };

  const getStatusCount = (status) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Handle form submission
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to create a ticket");
      return;
    }
    
    try {
      setLoading(true);
      // Add the ticket to Firestore
      const ticketData = {
        ...newTicket,
        status: "Open",
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        userEmail: user.email
      };
      
      await addDoc(collection(db, "tickets"), ticketData);
      console.log("Ticket created successfully");
      
      // Reset form
      setNewTicket({
        title: "",
        description: "",
        priority: "Medium",
        department: "IT",
      });
      
      // Fetch tickets again to update the list
      await fetchTickets();
      
      // Navigate to tickets tab
      setActiveTab("tickets");
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change for a ticket
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setLoading(true);
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus
      });
      
      console.log("Ticket status updated successfully");
      
      // Refresh tickets list
      await fetchTickets();
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "createTicket":
        setActiveTab("createTicket");
        break;
      case "viewAllTickets":
        setActiveTab("tickets");
        break;
      case "viewReports":
        setActiveTab("analytics");
        break;
      case "resolvedTickets":
        setFilterStatus("Resolved");
        setActiveTab("tickets");
        break;
      default:
        break;
    }
  };

  // Manual refresh handler
  const handleRefreshTickets = () => {
    fetchTickets();
  };

  // SVG Background
  const SvgBackground = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 600" 
      className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
        </filter>
      </defs>
      
      {/* Background */}
      <rect width="100%" height="100%" fill="#f0f0f5" />
      
      {/* purple blob top left */}
      <path d="M-100,100 Q50,-50 200,100 T400,0 T600,100 T800,50 V-100 H-100 Z" 
            fill="#a0c4ff" opacity="0.6" filter="url(#blur)" />
      
      {/* Pink blob middle */}
      <path d="M-100,300 Q100,200 300,350 T500,250 T700,300 T900,250 V500 H-100 Z" 
            fill="#ffb6c1" opacity="0.5" filter="url(#blur)" />
            
      {/* Purple blob bottom right */}
      <path d="M0,600 Q200,500 400,600 T600,500 T800,600 T1000,500 V700 H0 Z" 
            fill="#c5b3e6" opacity="0.6" filter="url(#blur)" />
            
      {/* Light purple accent */}
      <path d="M400,0 Q500,200 600,300 T800,400 T1000,500 V600 H800 Q700,400 600,300 T400,200 T200,0 Z" 
            fill="#bbd0ff" opacity="0.4" filter="url(#blur)" />
            
      {/* Light pink accent */}
      <path d="M-100,400 Q0,300 200,350 T400,300 T600,350 V600 H-100 Z" 
            fill="#ffd6e0" opacity="0.4" filter="url(#blur)" />
    </svg>
  );

  // Render login form
  const renderLoginForm = () => {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SvgBackground />
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {language === "English" ? "IT Help Desk Login" : "आयटी हेल्प डेस्क लॉगिन"}
          </h2>
          
          <div className="flex justify-center mb-6">
            <div className="flex border border-gray-300 rounded-md">
              <button 
                className={`px-4 py-2 ${authMode === 'login' ? 'bg-purple-500 text-white' : 'bg-white/70'}`}
                onClick={() => setAuthMode('login')}
              >
                {language === "English" ? "Login" : "लॉगिन"}
              </button>
              <button 
                className={`px-4 py-2 ${authMode === 'register' ? 'bg-purple-500 text-white' : 'bg-white/70'}`}
                onClick={() => setAuthMode('register')}
              >
                {language === "English" ? "Register" : "नोंदणी"}
              </button>
            </div>
          </div>
          
          {authError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {authError}
            </div>
          )}
          
          {authMode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  {language === "English" ? "Email" : "ईमेल"}
                </label>
                <input
                  id="email"
                  type="email" 
                  className="w-full border rounded-md p-2"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" htmlFor="password">
                  {language === "English" ? "Password" : "पासवर्ड"}
                </label>
                <input 
                  id="password"
                  type="password" 
                  className="w-full border rounded-md p-2"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600"
                disabled={loading}
              >
                {loading ? (language === "English" ? "Signing In..." : "साइन इन करत आहे...") : 
                 (language === "English" ? "Sign In" : "साइन इन")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  {language === "English" ? "Full Name" : "पूर्ण नाव"}
                </label>
                <input
                  id="name"
                  type="text" 
                  className="w-full border rounded-md p-2"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="register-email">
                  {language === "English" ? "Email" : "ईमेल"}
                </label>
                <input
                  id="register-email" 
                  type="email" 
                  className="w-full border rounded-md p-2"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" htmlFor="register-password">
                  {language === "English" ? "Password" : "पासवर्ड"}
                </label>
                <input
                  id="register-password" 
                  type="password" 
                  className="w-full border rounded-md p-2"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600"
                disabled={loading}
              >
                {loading ? (language === "English" ? "Creating Account..." : "खाते तयार करत आहे...") : 
                 (language === "English" ? "Create Account" : "खाते तयार करा")}
              </button>
            </form>
          )}
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              {language === "English" ? "Language" : "भाषा"}
            </label>
            <select 
              className="w-full border rounded-md p-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Marathi">मराठी</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!isInitialized) {
      return <div className="p-6 text-center">Initializing application...</div>;
    }
    
    if (loading) {
      return <div className="p-6 text-center">Loading dashboard data...</div>;
    }
    
    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={handleRefreshTickets} className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm">
              Retry
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">
            {language === "English" ? "Dashboard Overview" : "डॅशबोर्ड अवलोकन"}
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={handleRefreshTickets}
              className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
              {language === "English" ? "Refresh" : "रीफ्रेश"}
            </button>
            <button 
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-md"
              onClick={() => setActiveTab("createTicket")}
            >
              <Plus size={20} />
              {language === "English" ? "Create New Ticket" : "नवीन तिकीट तयार करा"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Total Tickets" : "एकूण तिकिटे"}</h2>
            <p className="text-4xl font-bold text-purple-500">{tickets.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Open Tickets" : "खुले तिकिटे"}</h2>
            <p className="text-4xl font-bold text-red-500">{getStatusCount("Open")}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "In Progress" : "प्रगतीपथावर"}</h2>
            <p className="text-4xl font-bold text-yellow-500">{getStatusCount("InProgress")}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Resolved" : "निराकरण केलेले"}</h2>
            <p className="text-4xl font-bold text-green-500">{getStatusCount("Resolved")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow md:col-span-3">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Recent Tickets" : "अलीकडील तिकिटे"}</h2>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === "English" ? "No tickets found. Create your first ticket!" : "कोणतीही तिकिटे सापडली नाहीत. आपले पहिले तिकीट तयार करा!"}
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.slice(0, 2).map(ticket => (
                  <div key={ticket.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{ticket.title}</h3>
                        <p className="text-gray-500 text-sm">{ticket.description?.substring(0, 50)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          ticket.status === "Open" ? "bg-red-100 text-red-800" :
                          ticket.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {ticket.status === "InProgress" 
                            ? (language === "English" ? "In Progress" : "प्रगतीपथावर")
                            : (language === "English" ? ticket.status : (ticket.status === "Open" ? "खुले" : "निराकरण केलेले"))}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          ticket.priority === "Low" ? "bg-gray-100 text-gray-800" :
                          ticket.priority === "Medium" ? "bg-orange-100 text-orange-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {language === "English" 
                            ? ticket.priority 
                            : ticket.priority === "Low" 
                              ? "कमी" 
                              : ticket.priority === "Medium" 
                                ? "मध्यम" 
                                : "उच्च"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Quick Actions" : "त्वरित क्रिया"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="flex flex-col items-center justify-center p-4 border rounded-md hover:bg-gray-50"
                onClick={() => handleQuickAction("createTicket")}
              >
                <Plus className="text-purple-500 mb-2" />
                <span className="text-sm">{language === "English" ? "Create Ticket" : "तिकीट तयार करा"}</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-4 border rounded-md hover:bg-gray-50"
                onClick={() => handleQuickAction("viewAllTickets")}
              >
                <Info className="text-purple-500 mb-2" />
                <span className="text-sm">{language === "English" ? "View All Tickets" : "सर्व तिकिटे पहा"}</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-4 border rounded-md hover:bg-gray-50"
                onClick={() => handleQuickAction("viewReports")}
              >
                <Clock className="text-purple-500 mb-2" />
                <span className="text-sm">{language === "English" ? "View Reports" : "अहवाल पहा"}</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-4 border rounded-md hover:bg-gray-50"
                onClick={() => handleQuickAction("resolvedTickets")}
              >
                <CheckCircle className="text-purple-500 mb-2" />
                <span className="text-sm">{language === "English" ? "Resolved Tickets" : "निराकरण केलेले तिकिटे"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const renderTickets = () => {
    if (!isInitialized) {
      return <div className="p-6 text-center">Initializing application...</div>;
    }
    
    if (loading) {
      return <div className="p-6 text-center">Loading tickets...</div>;
    }
    
    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={handleRefreshTickets} className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm">
              Retry
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex gap-2">
            <select 
              className="border rounded-md p-2 w-full md:w-48"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All">{language === "English" ? "All Tickets" : "सर्व तिकिटे"}</option>
              <option value="Open">{language === "English" ? "Open Tickets" : "खुले तिकिटे"}</option>
              <option value="InProgress">{language === "English" ? "In Progress" : "प्रगतीपथावर"}</option>
              <option value="Resolved">{language === "English" ? "Resolved" : "निराकरण केलेले"}</option>
            </select>
            
            <button 
              onClick={handleRefreshTickets}
              className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
              {language === "English" ? "Refresh" : "रीफ्रेश"}
            </button>
          </div>
          
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border rounded-md"
              placeholder={language === "English" ? "Search tickets..." : "तिकिटे शोधा..."}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {filteredTickets.length === 0 ? (
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-md shadow p-6 text-center">
            <p>{language === "English" ? "No tickets found" : "कोणतीही तिकिटे सापडली नाहीत"}</p>
          </div>
        ) : (
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-md shadow">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="border-b p-4">
                <h3 className="font-medium text-lg">{ticket.title}</h3>
                <p className="text-gray-600 mb-2">{ticket.description}</p>
                <div className="flex gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-md ${
                    ticket.status === "Open" ? "bg-red-100 text-red-800" :
                    ticket.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {ticket.status === "InProgress" 
                      ? (language === "English" ? "In Progress" : "प्रगतीपथावर")
                      : (language === "English" ? ticket.status : (ticket.status === "Open" ? "खुले" : "निराकरण केलेले"))}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-md ${
                    ticket.priority === "Low" ? "bg-purple-100 text-purple-800" :
                    ticket.priority === "Medium" ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {language === "English" 
                      ? ticket.priority 
                      : ticket.priority === "Low" 
                        ? "कमी" 
                        : ticket.priority === "Medium" 
                          ? "मध्यम" 
                          : "उच्च"}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                    {ticket.department}
                  </span>
                </div>
                
                {(user && (user.email.includes("admin") || ticket.createdBy === user.uid)) && (
                  <div className="mb-2 mt-2">
                    <label className="text-sm mr-2">
                      {language === "English" ? "Update Status:" : "स्थिती अद्यतनित करा:"}
                    </label>
                    <select 
                      className="border rounded p-1 text-sm"
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    >
                      console.log(ticket.status);
                      <option value="Open">{language === "English" ? "Open" : "खुले"}</option>
                      <option value="InProgress">{language === "English" ? "In Progress" : "प्रगतीपथावर"}</option>
                      <option value="Resolved">{language === "English" ? "Resolved" : "निराकरण केलेले"}</option>
                    </select>
                  </div>
                )}
                
                <div className="text-sm text-gray-500 mt-2">
                  {language === "English" ? "Created:" : "तयार केले:"} {ticket.createdAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
    
    const renderAnalytics = () => {
      if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
      }
      
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-8">
            {language === "English" ? "Reports & Analytics" : "अहवाल आणि विश्लेषण"}
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 rounded-md shadow">
              <h2 className="text-lg font-medium mb-4">
                {language === "English" ? "Tickets by Priority" : "प्राधान्यानुसार तिकिटे"}
              </h2>
              <div className="h-64">
                <BarChart width={500} height={250} data={getPriorityData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Tickets" />
                </BarChart>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 rounded-md shadow">
              <h2 className="text-lg font-medium mb-4">
                {language === "English" ? "Tickets by Department" : "विभागानुसार तिकिटे"}
              </h2>
              <div className="h-64">
                <BarChart width={500} height={250} data={getDepartmentData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" name="Tickets" />
                </BarChart>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    
    const renderCreateTicket = () => {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-8">
            {language === "English" ? "Create New Ticket" : "नवीन तिकीट तयार करा"}
          </h1>
          
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          
          <form onSubmit={handleCreateTicket} className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-md shadow">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                {language === "English" ? "Title" : "शीर्षक"}
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="w-full border rounded-md p-2"
                value={newTicket.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                {language === "English" ? "Description" : "वर्णन"}
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="w-full border rounded-md p-2"
                value={newTicket.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="priority">
                  {language === "English" ? "Priority" : "प्राधान्य"}
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="w-full border rounded-md p-2"
                  value={newTicket.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">{language === "English" ? "Low" : "कमी"}</option>
                  <option value="Medium">{language === "English" ? "Medium" : "मध्यम"}</option>
                  <option value="High">{language === "English" ? "High" : "उच्च"}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="department">
                  {language === "English" ? "Department" : "विभाग"}
                </label>
                <select
                  id="department"
                  name="department"
                  className="w-full border rounded-md p-2"
                  value={newTicket.department}
                  onChange={handleInputChange}
                >
                  <option value="IT">{language === "English" ? "IT" : "आयटी"}</option>
                  <option value="HR">{language === "English" ? "HR" : "मानव संसाधन"}</option>
                  <option value="Finance">{language === "English" ? "Finance" : "वित्त"}</option>
                  <option value="Operations">{language === "English" ? "Operations" : "ऑपरेशन्स"}</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="floor">
                {language === "English" ? "Floor" : "मजला"}
              </label>
              <select
                id="floor"
                name="floor"
                className="w-full border rounded-md p-2"
                value={selectedFloor}
                onChange={e => {
                  setSelectedFloor(e.target.value);
                  setNewTicket(prev => ({ ...prev, deviceId: "" })); // Reset device selection
                }}
                required
              >
                {Object.keys(floorConfig).map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="deviceId">
                {language === "English" ? "Device" : "डिव्हाइस"}
              </label>
              <select
                id="deviceId"
                name="deviceId"
                className="w-full border rounded-md p-2"
                value={newTicket.deviceId}
                onChange={handleInputChange}
                required
              >
                <option value="">{language === "English" ? "Select a device" : "डिव्हाइस निवडा"}</option>
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              >
                {language === "English" ? "Submit Ticket" : "तिकीट सबमिट करा"}
              </button>
            </div>
          </form>
        </div>
      );
    };
    // Main Layout
    if (!user) {
      // Remove the login/register form rendering here.
      // Optionally, you can return null or a loading spinner if needed.
      return null;
    }
    
    return (
      <div className="relative min-h-screen flex flex-col">
        {/* SVG Background */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 800 600" 
          className="fixed top-0 left-0 w-screen h-screen -z-50 pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
            </filter>
          </defs>
          
          {/* Background */}
          <rect width="100%" height="100%" fill="#f0f0f5" />
          
          {/* purple blob top left */}
          <path d="M-100,100 Q50,-50 200,100 T400,0 T600,100 T800,50 V-100 H-100 Z" 
                fill="#a0c4ff" opacity="0.6" filter="url(#blur)" />
          
          {/* Pink blob middle */}
          <path d="M-100,300 Q100,200 300,350 T500,250 T700,300 T900,250 V500 H-100 Z" 
                fill="#ffb6c1" opacity="0.5" filter="url(#blur)" />
              
          {/* Purple blob bottom right */}
          <path d="M0,600 Q200,500 400,600 T600,500 T800,600 T1000,500 V700 H0 Z" 
                fill="#c5b3e6" opacity="0.6" filter="url(#blur)" />
              
          {/* Light purple accent */}
          <path d="M400,0 Q500,200 600,300 T800,400 T1000,500 V600 H800 Q700,400 600,300 T400,200 T200,0 Z" 
                fill="#bbd0ff" opacity="0.4" filter="url(#blur)" />
              
          {/* Light pink accent */}
          <path d="M-100,400 Q0,300 200,350 T400,300 T600,350 V600 H-100 Z" 
                fill="#ffd6e0" opacity="0.4" filter="url(#blur)" />
        </svg>
  
        {/* Header */}  
        <header className="bg-white bg-opacity-80 backdrop-blur-sm shadow w-full h-16 flex-shrink-0">
          <div className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">
                {language === "English" ? "IT Help Desk" : "आयटी हेल्प डेस्क"}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell size={20} className="text-gray-600 cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {tickets.filter(t => t.status === "Open").length}
                </span>
              </div>
              
              <div className="relative">
                <button className="flex items-center gap-2 text-sm">
                  <User size={20} className="text-gray-600" />
                  <span>{user.email}</span>
                </button>
              </div>
              
              <button onClick={handleLogout} className="flex items-center gap-1 text-gray-600">
                <LogOut size={18} />
                <span>{language === "English" ? "Logout" : "लॉगआउट"}</span>
              </button>
              
              <select 
                className="border rounded-md p-1 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Marathi">मराठी</option>
              </select>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex flex-1 w-full mt-6 overflow-hidden">
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white bg-opacity-70 backdrop-blur-sm rounded-md shadow p-4 mb-6 md:mb-0 md:mr-6 overflow-auto">
              <nav>
                <ul className="space-y-1">
                  <li>
                    <button
                      className={`flex items-center space-x-3 w-full p-2 rounded-md ${activeTab === "dashboard" ? "bg-purple-50 text-purple-600" : "hover:bg-gray-50"}`}
                      onClick={() => setActiveTab("dashboard")}
                    >
                      <LayoutDashboard size={20} />
                      <span>{language === "English" ? "Dashboard" : "डॅशबोर्ड"}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center space-x-3 w-full p-2 rounded-md ${activeTab === "tickets" ? "bg-purple-50 text-purple-600" : "hover:bg-gray-50"}`}
                      onClick={() => setActiveTab("tickets")}
                    >
                      <Ticket size={20} />
                      <span>{language === "English" ? "Tickets" : "तिकिटे"}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center space-x-3 w-full p-2 rounded-md ${activeTab === "createTicket" ? "bg-purple-50 text-purple-600" : "hover:bg-gray-50"}`}
                      onClick={() => setActiveTab("createTicket")}
                    >
                      <Plus size={20} />
                      <span>{language === "English" ? "Create Ticket" : "तिकीट तयार करा"}</span>
                    </button>
                  </li>
              <li>
                <button
                  className={`flex items-center space-x-3 w-full p-2 rounded-md ${activeTab === "analytics" ? "bg-purple-50 text-purple-600" : "hover:bg-gray-50"}`}
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart2 size={20} />
                  <span>{language === "English" ? "Analytics" : "विश्लेषण"}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-opacity-70 backdrop-blur-sm rounded-md shadow overflow-auto">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "tickets" && renderTickets()}
          {activeTab === "createTicket" && renderCreateTicket()}
          {activeTab === "analytics" && renderAnalytics()}
        </div>
          </div>
        </div>
  
        {/* Add the Chatbot component here */}
        <Chatbot />
      </div>
    );
  };