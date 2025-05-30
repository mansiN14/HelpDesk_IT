import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, User, Search, Plus, Info, Clock, CheckCircle, LogOut, Laptop, Users, Cpu, Phone, Award, Map } from "lucide-react";
import { LayoutDashboard, Ticket, BookOpen, BarChart2 } from "lucide-react";
import { initializeApp } from "firebase/app";
import Chatbot from './chatbot';
import { useMemo } from "react";
import { useRef } from "react";

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
import { 
  Menu, 
  X, 
  HelpCircle, 
  ChevronDown, 
  Layout,
  FilePlus,
} from "lucide-react";

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
      { id: "WS-001" }, { id: "WS-002" }, { id: "WS-003" }, { id: "WS-004" }, { id: "WS-005" },
      { id: "WS-006" }, { id: "WS-007" }, { id: "WS-008" }, { id: "WS-009" }, { id: "WS-010" },
      { id: "WS-011" }, { id: "WS-012" }, { id: "WS-013" }, { id: "WS-014" }, { id: "WS-015" },
      { id: "WS-016" }, { id: "WS-017" }, { id: "WS-018" }, { id: "WS-019" }, { id: "WS-020" },
      { id: "WS-021" }, { id: "WS-022" }, { id: "WS-023" }, { id: "WS-024" }, { id: "WS-025" },
      { id: "WS-026" }, { id: "WS-027" }, { id: "WS-028" }, { id: "WS-029" }, { id: "WS-030" },
      { id: "WS-031" }, { id: "WS-032" }, { id: "WS-033" }, { id: "WS-034" }, { id: "WS-035" },
      { id: "WS-036" }, { id: "WS-037" }, { id: "WS-038" }, { id: "WS-039" }, { id: "WS-040" },
      { id: "WS-041" }, { id: "WS-042" }, { id: "WS-043" }, { id: "WS-044" }, { id: "WS-045" },
      { id: "WS-046" }, { id: "WS-047" }, { id: "WS-048" }, { id: "WS-049" }, { id: "WS-050" },
      { id: "WS-051" }, { id: "WS-052" }, { id: "WS-053" }, { id: "WS-054" }, { id: "WS-055" },
      { id: "WS-056" }, { id: "WS-057" }, { id: "WS-058" }, { id: "WS-059" }, { id: "WS-060" },
      { id: "WS-061" }, { id: "WS-062" }, { id: "WS-063" }, { id: "WS-064" }, { id: "WS-065" },
      { id: "WS-066" }, { id: "WS-067" }, { id: "WS-068" }, { id: "WS-069" }, { id: "WS-070" },
      { id: "WS-071" }, { id: "WS-072" }, { id: "WS-073" }, { id: "WS-074" }, { id: "WS-075" },
      { id: "WS-076" }, { id: "WS-077" }, { id: "WS-078" }, { id: "WS-079" }, { id: "WS-080" },
      { id: "WS-081" }, { id: "WS-082" }, { id: "WS-083" }, { id: "WS-084" }, { id: "WS-085" },
      { id: "WS-086" }, { id: "WS-087" }, { id: "WS-088" }, { id: "WS-089" }, { id: "WS-090" },
      { id: "WS-091" }, { id: "WS-092" }, { id: "WS-093" }, { id: "WS-094" }, { id: "WS-095" },
      { id: "WS-096" }, { id: "WS-097" }, { id: "WS-098" }, { id: "WS-099" }, { id: "WS-100" },
      { id: "WS-101" }, { id: "WS-102" }, { id: "WS-103" }, { id: "WS-104" }, { id: "WS-105" },
      { id: "WS-106" }, { id: "WS-107" }, { id: "WS-108" }, { id: "WS-109" }, { id: "WS-110" },
      { id: "WS-111" }, { id: "WS-112" }, { id: "WS-113" }, { id: "WS-114" }, { id: "WS-115" },
      { id: "WS-116" }, { id: "WS-117" }, { id: "WS-118" }, { id: "WS-119" }, { id: "WS-120" },
      { id: "WS-121" }, { id: "WS-122" }, { id: "WS-123" }, { id: "WS-124" }, { id: "WS-125" },
      { id: "WS-126" }, { id: "WS-127" }, { id: "WS-128" }, { id: "WS-129" }, { id: "WS-130" },
      { id: "WS-131" }, { id: "WS-132" }, { id: "WS-133" }, { id: "WS-134" }, { id: "WS-135" },
      { id: "WS-136" }, { id: "WS-137" }, { id: "WS-138" }, { id: "WS-139" }, { id: "WS-140" },
      { id: "WS-141" }, { id: "WS-142" }, { id: "WS-143" }, { id: "WS-144" }, { id: "WS-145" },
      { id: "WS-146" }, { id: "WS-147" }, { id: "WS-148" }, { id: "WS-149" }, { id: "WS-150" },
      { id: "WS-151" }, { id: "WS-152" }, { id: "WS-153" }, { id: "WS-154" }, { id: "WS-155" },
      { id: "WS-156" }, { id: "WS-157" }, { id: "WS-158" }, { id: "WS-159" }, { id: "WS-160" },
      { id: "WS-161" }, { id: "WS-162" }, { id: "WS-163" }, { id: "WS-164" }, { id: "WS-165" },
      { id: "WS-166" }, { id: "WS-167" }, { id: "WS-168" }, { id: "WS-169" }, { id: "WS-170" },
      { id: "WS-171" }, { id: "WS-172" }, { id: "WS-173" }, { id: "WS-174" }, { id: "WS-175" },
      { id: "WS-176" }, { id: "WS-177" }, { id: "WS-178" }, { id: "WS-179" }, { id: "WS-180" },
      { id: "WS-181" }, { id: "WS-182" }, { id: "WS-183" }, { id: "WS-184" }, { id: "WS-185" },
      { id: "WS-186" }, { id: "WS-187" }, { id: "WS-188" }, { id: "WS-189" }, { id: "WS-190" },
      { id: "WS-191" }, { id: "WS-192" }, { id: "WS-193" }, { id: "WS-194" }, { id: "WS-195" },
      { id: "WS-196" }, { id: "WS-197" }, { id: "WS-198" }, { id: "WS-199" }, { id: "WS-200" },
      { id: "WS-201" }, { id: "WS-202" }, { id: "WS-203" }, { id: "WS-204" }, { id: "WS-205" },
      { id: "WS-206" }, { id: "WS-207" }, { id: "WS-208" }, { id: "WS-209" }, { id: "WS-210" },
      { id: "WS-211" }, { id: "WS-212" }, { id: "WS-213" }, { id: "WS-214" }, { id: "WS-215" },
      { id: "WS-216" }, { id: "WS-217" }, { id: "WS-218" }, { id: "WS-219" }, { id: "WS-220" },
      { id: "WS-221" }, { id: "WS-222" }, { id: "WS-223" }, { id: "WS-224" }, { id: "WS-225" },
      { id: "WS-226" }, { id: "WS-227" }, { id: "WS-228" }, { id: "WS-229" }, { id: "WS-230" },
      { id: "WS-231" }, { id: "WS-232" }, { id: "WS-233" }, { id: "WS-234" }, { id: "WS-235" },
      { id: "WS-236" }, { id: "WS-237" }, { id: "WS-238" }, { id: "WS-239" }, { id: "WS-240" },
      { id: "WS-241" }, { id: "WS-242" }, { id: "WS-243" }, { id: "WS-244" }, { id: "WS-245" },
      { id: "WS-246" }, { id: "WS-247" }, { id: "WS-248" }, { id: "WS-249" }, { id: "WS-250" },
      { id: "WS-251" }, { id: "WS-252" }, { id: "WS-253" }, { id: "WS-254" }, { id: "WS-255" },
      { id: "WS-256" }, { id: "WS-257" }, { id: "WS-258" }, { id: "WS-259" }, { id: "WS-260" },
      { id: "WS-261" }, { id: "WS-262" }, { id: "WS-263" }, { id: "WS-264" }, { id: "WS-265" },
      { id: "WS-266" }, { id: "WS-267" }, { id: "WS-268" }, { id: "WS-269" }, { id: "WS-270" },
      { id: "WS-271" }, { id: "WS-272" }, { id: "WS-273" }, { id: "WS-274" }, { id: "WS-275" },
      { id: "WS-276" }, { id: "WS-277" }, { id: "WS-278" }, { id: "WS-279" }, { id: "WS-280" },
      { id: "WS-281" }, { id: "WS-282" }, { id: "WS-283" }, { id: "WS-284" }, { id: "WS-285" },
      { id: "WS-286" }, { id: "WS-287" }, { id: "WS-288" }, { id: "WS-289" }, { id: "WS-290" },
      

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

const defaultLayoutConfig = {
  totalWorkstations: 415,
  totalMeetingRooms: 11,
  totalMDCabins: 4,
  totalTechnicalWS: 26,
  totalConferenceRooms: 2,
  totalTeamLeadTables: 1,
  gridWidth: 30,
  gridHeight: 20,
  clusterSize: 6,
  aisleWidth: 2,
};

const spaceTypes = {
  WORKSTATION: { prefix: 'WS', color: '#e3f2fd', borderColor: '#1976d2' },
  MEETING_ROOM: { prefix: 'MR', color: '#f3e5f5', borderColor: '#7b1fa2' },
  MD_CABIN: { prefix: 'MD', color: '#fff3e0', borderColor: '#f57c00' },
  TECHNICAL_WS: { prefix: 'TWS', color: '#e8f5e8', borderColor: '#388e3c' },
  CONFERENCE: { prefix: 'CO', color: '#ffebee', borderColor: '#d32f2f' },
  TEAM_LEAD: { prefix: 'TL', color: '#f1f8e9', borderColor: '#689f38' },
  CORRIDOR: { prefix: 'CORRIDOR', color: '#f5f5f5', borderColor: '#bdbdbd' },
  AMENITY: { prefix: 'AMENITY', color: '#fafafa', borderColor: '#9e9e9e' },
  EMPTY: { prefix: 'EMPTY', color: 'transparent', borderColor: 'transparent' }
};


function useOfficeLayout(config) {
  return useMemo(() => {
    if (!config || !config.gridHeight || !config.gridWidth) {
      // Return an empty grid if config is missing
      return [[]];
    }
    // ...your full grid generation logic here...
    const grid = Array(config.gridHeight).fill(null).map(() =>
      Array(config.gridWidth).fill(null).map(() => ({ type: 'EMPTY', id: null }))
    );
    // ...rest of your logic...
    return grid;
  }, [config]);
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State to handle mobile menu
  const [sidebarOpen, setSidebarOpen] = useState(false); // Add missing state for sidebar
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State for user dropdown
  const userDropdownRef = useRef(null);
  
  // Form state for creating new tickets
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "Medium",
    department: "IT",
    systemId: "",
    floor: "S1" // Add floor to the ticket state
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

  // Get available systems for the current floor
  const availableSystems = getDevicesForFloor(selectedFloor);

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
      setIsUserDropdownOpen(false); // Close dropdown on logout
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
        status: "open", // Changed to lowercase to match the expected format
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        userEmail: user.email,
        floor: selectedFloor // Add the current floor
      };
      
      await addDoc(collection(db, "tickets"), ticketData);
      console.log("Ticket created successfully");
      
      // Reset form
      setNewTicket({
        title: "",
        description: "",
        priority: "Medium",
        department: "IT",
        systemId: "",
        floor: "S1" // Reset floor
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
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile menu when tab changes
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
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-75"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
        </filter>
      </defs>
      
      {/* Background */}
      <rect width="100%" height="100%" fill="#f0f0f5" />
      
      {/* Purple blob top left */}
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
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">
            {language === "English" ? "Dashboard Overview" : "डॅशबोर्ड अवलोकन"}
          </h1>
          <div className="flex flex-wrap gap-2">
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
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-md w-full sm:w-auto justify-center"
              onClick={() => setActiveTab("createTicket")}
            >
              <Plus size={20} />
              {language === "English" ? "Create New Ticket" : "नवीन तिकीट तयार करा"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Total Tickets" : "एकूण तिकिटे"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-purple-500">{tickets.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Open Tickets" : "खुले तिकिटे"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-red-500">{getStatusCount("Open")}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "In Progress" : "प्रगतीपथावर"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-yellow-500">{getStatusCount("InProgress")}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Resolved" : "निराकरण केलेले"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-green-500">{getStatusCount("Resolved")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow lg:col-span-3">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Recent Tickets" : "अलीकडील तिकिटे"}</h2>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === "English" ? "No tickets found. Create your first ticket!" : "कोणतीही तिकिटे सापडली नाहीत. आपले पहिले तिकीट तयार करा!"}
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.slice(0, 2).map(ticket => (
                  <div key={ticket.id} className="border-b pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{ticket.title}</h3>
                        <p className="text-gray-500 text-sm">{ticket.description?.substring(0, 50)}...</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                          ticket.priority === "Low" ? "bg-gray-100 text-gray-800" :
                          ticket.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {language === "English" ? ticket.priority : 
                            (ticket.priority === "Low" ? "कमी" : 
                             ticket.priority === "Medium" ? "मध्यम" : "उच्च")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <span>{ticket.createdAt}</span>
                      <span>{ticket.department}</span>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setActiveTab("tickets")} 
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {language === "English" ? "View All Tickets" : "सर्व तिकिटे पहा"} →
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Quick Actions" : "जलद कृती"}</h2>
            <div className="space-y-2">
              <button 
                onClick={() => handleQuickAction("createTicket")}
                className="w-full text-left px-4 py-2 rounded-md hover:bg-purple-50 flex items-center gap-2"
              >
                <Plus size={18} />
                <span>{language === "English" ? "Create Ticket" : "तिकीट तयार करा"}</span>
              </button>
              <button 
                onClick={() => handleQuickAction("viewAllTickets")}
                className="w-full text-left px-4 py-2 rounded-md hover:bg-purple-50 flex items-center gap-2"
              >
                <Ticket size={18} />
                <span>{language === "English" ? "View All Tickets" : "सर्व तिकिटे पहा"}</span>
              </button>
              <button 
                onClick={() => handleQuickAction("resolvedTickets")}
                className="w-full text-left px-4 py-2 rounded-md hover:bg-purple-50 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                <span>{language === "English" ? "Resolved Tickets" : "निराकरण केलेली तिकिटे"}</span>
              </button>
              <button 
                onClick={() => handleQuickAction("viewReports")}
                className="w-full text-left px-4 py-2 rounded-md hover:bg-purple-50 flex items-center gap-2"
              >
                <BarChart2 size={18} />
                <span>{language === "English" ? "View Reports" : "अहवाल पहा"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Tickets by Priority */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Tickets by Priority" : "प्राधान्यानुसार तिकिटे"}</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPriorityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Tickets by Department */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Tickets by Department" : "विभागानुसार तिकिटे"}</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDepartmentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTicketsList = () => {
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
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">
            {language === "English" ? "All Tickets" : "सर्व तिकिटे"}
          </h1>
          <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full border rounded-md"
                placeholder={language === "English" ? "Search tickets..." : "तिकिटे शोधा..."}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <select
              className="w-full md:w-auto border rounded-md p-2"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All">{language === "English" ? "All Status" : "सर्व स्थिती"}</option>
              <option value="Open">{language === "English" ? "Open" : "खुले"}</option>
              <option value="InProgress">{language === "English" ? "In Progress" : "प्रगतीपथावर"}</option>
              <option value="Resolved">{language === "English" ? "Resolved" : "निराकरण केलेले"}</option>
            </select>
            <button 
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-md justify-center"
              onClick={() => setActiveTab("createTicket")}
            >
              <Plus size={20} />
              {language === "English" ? "New Ticket" : "नवीन तिकीट"}
            </button>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-md shadow p-8 text-center">
            <div className="text-gray-500 mb-4">
              {language === "English" ? "No tickets found" : "कोणतीही तिकिटे सापडली नाहीत"}
            </div>
            <button 
              onClick={() => setActiveTab("createTicket")}
              className="bg-purple-500 text-white px-4 py-2 rounded-md"
            >
              {language === "English" ? "Create your first ticket" : "आपले पहिले तिकीट तयार करा"}
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-md shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">
                      {language === "English" ? "Title" : "शीर्षक"}
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 hidden md:table-cell">
                      {language === "English" ? "Department" : "विभाग"}
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 hidden md:table-cell">
                      {language === "English" ? "Priority" : "प्राधान्य"}
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">
                      {language === "English" ? "Status" : "स्थिती"}
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">
                      {language === "English" ? "Actions" : "कृती"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-sm text-gray-500 md:hidden">{ticket.department}</div>
                          <div className="text-xs text-gray-400">{ticket.createdAt}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">{ticket.department}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          ticket.priority === "Low" ? "bg-gray-100 text-gray-800" :
                          ticket.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {language === "English" ? ticket.priority : 
                            (ticket.priority === "Low" ? "कमी" : 
                             ticket.priority === "Medium" ? "मध्यम" : "उच्च")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          ticket.status === "Open" ? "bg-red-100 text-red-800" :
                          ticket.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {ticket.status === "InProgress" 
                            ? (language === "English" ? "In Progress" : "प्रगतीपथावर")
                            : (language === "English" ? ticket.status : (ticket.status === "Open" ? "खुले" : "निराकरण केलेले"))}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {ticket.status === "Open" && (
                            <button 
                              onClick={() => handleStatusChange(ticket.id, "InProgress")}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md hover:bg-yellow-200"
                            >
                              {language === "English" ? "Start" : "सुरू करा"}
                            </button>
                          )}
                          {ticket.status === "InProgress" && (
                            <button 
                              onClick={() => handleStatusChange(ticket.id, "Resolved")}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md hover:bg-green-200"
                            >
                              {language === "English" ? "Resolve" : "निराकरण करा"}
                            </button>
                          )}
                          {ticket.status === "Resolved" && (
                            <button 
                              onClick={() => handleStatusChange(ticket.id, "Open")}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md hover:bg-purple-200"
                            >
                              {language === "English" ? "Reopen" : "पुन्हा सुरू करा"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCreateTicketForm = () => {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold">
            {language === "English" ? "Create New Ticket" : "नवीन तिकीट तयार करा"}
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-md shadow p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleCreateTicket}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="title">
                  {language === "English" ? "Ticket Title" : "तिकीट शीर्षक"}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full border rounded-md p-2"
                  value={newTicket.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="floor">
                  {language === "English" ? "Floor" : "मजला"}
                </label>
                <select
                  id="floor"
                  name="floor"
                  className="w-full border rounded-md p-2"
                  value={newTicket.floor}
                  onChange={handleInputChange}
                  required
                >
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                  <option value="S4">S4</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="systemId">
                  {language === "English" ? "System ID" : "सिस्टम आयडी"}
                </label>
                <input
                  type="text"
                  id="systemId"
                  name="systemId"
                  className="w-full border rounded-md p-2"
                  value={newTicket.systemId}
                  onChange={handleInputChange}
                  placeholder={language === "English" ? "Enter system ID (e.g., WS-001)" : "सिस्टम आयडी टाका"}
                  required
                />
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
                  required
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">
                    {language === "English" ? "Finance" : "वित्त"}
                  </option>
                  <option value="Operations">
                    {language === "English" ? "Operations" : "कार्यवाही"}
                  </option>
                  <option value="Facilities">
                    {language === "English" ? "Facilities" : "सुविधा"}
                  </option>
                </select>
              </div>
              
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
                  required
                >
                  <option value="Low">
                    {language === "English" ? "Low" : "कमी"}
                  </option>
                  <option value="Medium">
                    {language === "English" ? "Medium" : "मध्यम"}
                  </option>
                  <option value="High">
                    {language === "English" ? "High" : "उच्च"}
                  </option>
                </select>
              </div>
              
              <div className="md:col-span-2">
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
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2"
                onClick={() => setActiveTab("dashboard")}
              >
                {language === "English" ? "Cancel" : "रद्द करा"}
              </button>
              <button
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded-md"
                disabled={loading}
              >
                {loading ? 
                  (language === "English" ? "Creating..." : "तयार करत आहे...") : 
                  (language === "English" ? "Create Ticket" : "तिकीट तयार करा")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold">
            {language === "English" ? "Analytics & Reports" : "अनॅलिटिक्स आणि अहवाल"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Priority */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Tickets by Priority" : "प्राधान्यानुसार तिकिटे"}</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPriorityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Tickets by Department */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Tickets by Department" : "विभागानुसार तिकिटे"}</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDepartmentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Ticket Status Summary" : "तिकीट स्थिती सारांश"}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">{language === "English" ? "Status" : "स्थिती"}</th>
                    <th className="py-3 px-4 text-left">{language === "English" ? "Count" : "संख्या"}</th>
                    <th className="py-3 px-4 text-left">{language === "English" ? "Percentage" : "टक्केवारी"}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-800">
                        {language === "English" ? "Open" : "खुले"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusCount("Open")}</td>
                    <td className="py-3 px-4">
                      {tickets.length > 0 ? 
                        `${Math.round((getStatusCount("Open") / tickets.length) * 100)}%` : 
                        "0%"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-md bg-yellow-100 text-yellow-800">
                        {language === "English" ? "In Progress" : "प्रगतीपथावर"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusCount("InProgress")}</td>
                    <td className="py-3 px-4">
                      {tickets.length > 0 ? 
                        `${Math.round((getStatusCount("InProgress") / tickets.length) * 100)}%` : 
                        "0%"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-800">
                        {language === "English" ? "Resolved" : "निराकरण केलेले"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusCount("Resolved")}</td>
                    <td className="py-3 px-4">
                      {tickets.length > 0 ? 
                        `${Math.round((getStatusCount("Resolved") / tickets.length) * 100)}%` : 
                        "0%"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHelp = () => {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold">
            {language === "English" ? "Help & Support" : "मदत आणि सहाय्य"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow mb-6">
              <h2 className="text-lg font-medium mb-4">{language === "English" ? "Frequently Asked Questions" : "वारंवार विचारले जाणारे प्रश्न"}</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{language === "English" ? "How do I create a ticket?" : "मी तिकीट कसे तयार करू?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Click on the 'Create Ticket' button in the dashboard or navigation menu, fill out the form with your issue details, and submit." 
                      : "डॅशबोर्ड किंवा नेव्हिगेशन मेनूमधील 'तिकीट तयार करा' बटणावर क्लिक करा, आपल्या समस्येचा तपशील सह फॉर्म भरा आणि सबमिट करा."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "How are ticket priorities determined?" : "तिकीट प्राधान्य कसे निर्धारित केले जातात?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "You can select the priority level when creating a ticket. Choose 'Low' for minor issues, 'Medium' for standard issues, and 'High' for urgent matters that require immediate attention." 
                      : "तिकीट तयार करताना आपण प्राधान्य स्तर निवडू शकता. किरकोळ समस्यांसाठी 'कमी', मानक समस्यांसाठी 'मध्यम' आणि तात्काळ लक्ष देण्याची आवश्यकता असलेल्या तातडीच्या बाबींसाठी 'उच्च' निवडा."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "Who can see my tickets?" : "माझी तिकिटे कोण पाहू शकतो?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Only you and the support staff can see your tickets. Administrators have access to all tickets in the system for management purposes." 
                      : "फक्त आपण आणि सपोर्ट स्टाफ आपली तिकिटे पाहू शकतात. प्रशासकांना व्यवस्थापन उद्देशांसाठी सिस्टममधील सर्व तिकिटांचा प्रवेश आहे."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "How do I check the status of my ticket?" : "मी माझ्या तिकीटची स्थिती कशी तपासू?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Go to the 'Tickets' tab to see all your tickets and their current status. Tickets are marked as 'Open', 'In Progress', or 'Resolved'." 
                      : "'तिकिटे' टॅबवर जा आणि आपली सर्व तिकिटे आणि त्यांची वर्तमान स्थिती पहा. तिकिटे 'खुले', 'प्रगतीपथावर' किंवा 'निराकरण केलेले' म्हणून चिन्हांकित केली जातात."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
              <h2 className="text-lg font-medium mb-4">{language === "English" ? "User Guide" : "वापरकर्ता मार्गदर्शक"}</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{language === "English" ? "Dashboard Navigation" : "डॅशबोर्ड नेव्हिगेशन"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "The dashboard provides an overview of all your tickets, quick actions, and analytical charts. Use the sidebar to navigate between different sections of the application." 
                      : "डॅशबोर्ड आपल्या सर्व तिकिटांचे, त्वरित कृती आणि विश्लेषणात्मक चार्टचे अवलोकन प्रदान करतो. अॅप्लिकेशनच्या विविध विभागांमध्ये नेव्हिगेट करण्यासाठी साइडबार वापरा."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "Creating and Managing Tickets" : "तिकिटे तयार करणे आणि व्यवस्थापित करणे"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Create new tickets by clicking 'New Ticket', fill in the required fields, and submit. View all tickets in the 'Tickets' tab where you can also filter and search for specific tickets." 
                      : "'नवीन तिकीट' वर क्लिक करून नवीन तिकिटे तयार करा, आवश्यक फील्ड भरा आणि सबमिट करा. 'तिकिटे' टॅबमध्ये सर्व तिकिटे पहा जिथे आपण विशिष्ट तिकिटांसाठी फिल्टर आणि शोध देखील करू शकता."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
              <h2 className="text-lg font-medium mb-4">{language === "English" ? "Contact Support" : "सपोर्टशी संपर्क साधा"}</h2>
              
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                alert(language === "English" ? "Support request submitted!" : "सपोर्ट विनंती सबमिट केली!");
              }}>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="support-name">
                    {language === "English" ? "Name" : "नाव"}
                  </label>
                  <input
                    type="text"
                    id="support-name"
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="support-email">
                    {language === "English" ? "Email" : "ईमेल"}
                  </label>
                  <input
                    type="email"
                    id="support-email"
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="support-subject">
                    {language === "English" ? "Subject" : "विषय"}
                  </label>
                  <input
                    type="text"
                    id="support-subject"
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="support-message">
                    {language === "English" ? "Message" : "संदेश"}
                  </label>
                  <textarea
                    id="support-message"
                    rows="4"
                    className="w-full border rounded-md p-2"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                >
                  {language === "English" ? "Submit Request" : "विनंती सबमिट करा"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Always call hooks at the top level!
  const layoutConfig = defaultLayoutConfig;
  const officeLayout = useOfficeLayout(layoutConfig);

  // Extract device/system IDs from the layout grid
  const deviceTypes = [
    "WORKSTATION", "MEETING_ROOM", "MD_CABIN", "TECHNICAL_WS", "CONFERENCE", "TEAM_LEAD"
  ];
  const allDevicesFromLayout = Array.isArray(officeLayout)
    ? officeLayout.flat().filter(cell => deviceTypes.includes(cell.type) && cell.id).map(cell => cell.id)
    : [];

  const uniqueDevices = Array.from(new Set(allDevicesFromLayout));

  // Now you can use uniqueDevices in your renderCreateTicketForm

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">{language === "English" ? "Loading..." : "लोड करत आहे..."}</div>
        </div>
      </div>
    );
  }

  if (!user && isInitialized) {
    return renderLoginForm();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Add SvgBackground here */}
      <SvgBackground />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white/50 backdrop-blur-md shadow transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}>
        
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-purple-600">HelpDesk</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X size={24} />
            </button>
          </div>
          <div className="p-4">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`flex items-center px-3 py-2 w-full rounded-md ${activeTab === "dashboard" ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-purple-50"}`}
              >
                <Layout size={20} className="mr-3" />
                <span>{language === "English" ? "Dashboard" : "डॅशबोर्ड"}</span>
              </button>
              <button 
                onClick={() => setActiveTab("tickets")} 
                className={`flex items-center px-3 py-2 w-full rounded-md ${activeTab === "tickets" ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-purple-50"}`}
              >
                <Ticket size={20} className="mr-3" />
                <span>{language === "English" ? "Tickets" : "तिकिटे"}</span>
              </button>
              <button 
                onClick={() => setActiveTab("createTicket")} 
                className={`flex items-center px-3 py-2 w-full rounded-md ${activeTab === "createTicket" ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-purple-50"}`}
              >
                <FilePlus size={20} className="mr-3" />
                <span>{language === "English" ? "Create Ticket" : "तिकीट तयार करा"}</span>
              </button>
              <button 
                onClick={() => setActiveTab("analytics")} 
                className={`flex items-center px-3 py-2 w-full rounded-md ${activeTab === "analytics" ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-purple-50"}`}
              >
                <BarChart2 size={20} className="mr-3" />
                <span>{language === "English" ? "Analytics" : "अनॅलिटिक्स"}</span>
              </button>
              <button 
                onClick={() => setActiveTab("help")} 
                className={`flex items-center px-3 py-2 w-full rounded-md ${activeTab === "help" ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-purple-50"}`}
              >
                <HelpCircle size={20} className="mr-3" />
                <span>{language === "English" ? "Help" : "मदत"}</span>
              </button>
            </nav>
          </div>
        
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-2">
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-medium hidden sm:block">
                {activeTab === "dashboard" && (language === "English" ? "Dashboard" : "डॅशबोर्ड")}
                {activeTab === "tickets" && (language === "English" ? "Tickets" : "तिकिटे")}
                {activeTab === "createTicket" && (language === "English" ? "Create Ticket" : "तिकीट तयार करा")}
                {activeTab === "analytics" && (language === "English" ? "Analytics" : "अनॅलिटिक्स")}
                {activeTab === "help" && (language === "English" ? "Help" : "मदत")}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  className="border rounded-md py-1 px-2 text-sm appearance-none pr-8"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Marathi">मराठी</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={16} />
                </div>
              </div>
              <button className="p-1 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <div className="relative flex items-center">
                <button 
                  className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center hover:bg-purple-300 focus:outline-none"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <User size={16} />
                </button>
                {isUserDropdownOpen && (
                  <div 
                    ref={userDropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                  >
                    <div className="block px-4 py-2 text-sm text-gray-700">{user?.email}</div>
                    <div className="border-t border-gray-100"></div>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      {language === "English" ? "Logout" : "लॉगआउट"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "tickets" && renderTicketsList()}
          {activeTab === "createTicket" && renderCreateTicketForm()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "help" && renderHelp()}
        </main>
      </div>
    </div>
  );
};
