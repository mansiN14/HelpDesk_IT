import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, User, Search, Plus, Info, Clock, CheckCircle, LogOut, Laptop, Users, Cpu, Phone, Award, Map } from "lucide-react";
import { LayoutDashboard, Ticket, BookOpen, BarChart2 } from "lucide-react";
import Chatbot from './chatbot';
import { useMemo } from "react";
import { useRef } from "react";
import { db, auth } from './firebase';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  updateDoc,
  orderBy,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { 
  Menu, 
  X, 
  HelpCircle, 
  ChevronDown, 
  Layout,
  FilePlus,
} from "lucide-react";

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
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredIssues, setFilteredIssues] = useState([]);
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
    floor: "S1", // Add floor to the ticket state
    type: "Hardware", // Add type to the ticket state, default to Hardware
    building: "Building 1" // Add building to the ticket state, default to Building 1
  });

  // Define mapping between buildings and floors (copy from AdminDashboard, or ideally share)
  const buildingFloorMap = {
    'Building 1': ['S1', 'S2'],
    'Building 2': ['F1', 'F2', 'F3'],
    'Building 3': ['G1'],
    // Removed Building 4 and 5
  };

  // State for floors available based on selected building in the form
  const [availableFormFloors, setAvailableFormFloors] = useState(buildingFloorMap[newTicket.building] || []);

  // Update available form floors when the selected building in the form changes
  useEffect(() => {
    const floorsForBuilding = buildingFloorMap[newTicket.building] || [];
    setAvailableFormFloors(floorsForBuilding);
    // Reset floor selection if the current floor is not available in the new building
    if (!floorsForBuilding.includes(newTicket.floor)) {
      setNewTicket(prev => ({ ...prev, floor: floorsForBuilding[0] || '' }));
    }
  }, [newTicket.building]);

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
        // Real-time updates will be handled by the other useEffect
      } else {
        setIssues([]);
        setFilteredIssues([]);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch tickets when user changes or actively requested
  useEffect(() => {
    if (user && isInitialized) {
      // Set up real-time listener for tickets
      let queryRef;
      
      if (user.email.includes("admin")) {
        // Admin sees all issues
        queryRef = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
      } else {
        // Regular users see only their issues - ADD BUILDING FILTER HERE
        // IMPORTANT: The 'user' object needs a 'building' property for this filter to work.
        // Ensure user building is saved during registration/login and included in the user object.
        if (user.building) {
          queryRef = query(
            collection(db, "tickets"), 
            where("createdBy", "==", user.uid),
            where("building", "==", user.building), // Filter by user's building
            orderBy("createdAt", "desc")
          );
        } else {
          // If user building is not available, fetch only issues created by the user
          // (without building filter, but this might show tickets from other buildings
          // if user created them there and floor names are duplicated)
          console.warn("User building not found. Fetching tickets only by user ID. Filtering by building will not work.");
          queryRef = query(
            collection(db, "tickets"), 
            where("createdBy", "==", user.uid),
            orderBy("createdAt", "desc")
          );
        }
      }
      
      const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        console.log("Real-time update received");
        const ticketsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let createdAt;
          try {
            // Handle Firestore Timestamp
            if (data.createdAt?.toDate) {
              createdAt = data.createdAt.toDate().toLocaleString();
            }
            // Handle string date
            else if (typeof data.createdAt === 'string') {
              createdAt = new Date(data.createdAt).toLocaleString();
            }
            // Handle number timestamp
            else if (typeof data.createdAt === 'number') {
              createdAt = new Date(data.createdAt).toLocaleString();
            }
            // Handle Date object
            else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt.toLocaleString();
            }
            // If no valid date found, use current date
            else {
              console.warn("Invalid date format for issue:", doc.id);
              createdAt = new Date().toLocaleString();
            }
          } catch (err) {
            console.error("Error converting date for issue:", doc.id, err);
            createdAt = new Date().toLocaleString();
          }
          return {
            id: doc.id,
            ...data,
            createdAt: createdAt
          };
        });
        
        console.log("Issues loaded:", ticketsData.length);
        setIssues(ticketsData);
        setFilteredIssues(ticketsData); // Initialize filtered issues
        setError(null);
        setLoading(false);
      }, (error) => {
        console.error("Error in real-time listener:", error);
        setError("Failed to load issues: " + error.message);
        setIssues([]);
        setFilteredIssues([]);
        setLoading(false);
      });
      
      // Cleanup subscription on unmount
      return () => unsubscribe();
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

  // Apply search and filters
  useEffect(() => {
    if (issues.length > 0) {
      let results = [...issues];
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(issue => 
          issue.title?.toLowerCase().includes(query) || 
          issue.description?.toLowerCase().includes(query) ||
          issue.department?.toLowerCase().includes(query)
        );
      }
      
      // Apply status filter
      if (filterStatus !== "All") {
        const lowerCaseFilterStatus = filterStatus.toLowerCase();
        results = results.filter(issue => issue.status?.toLowerCase() === lowerCaseFilterStatus);
      }
      
      setFilteredIssues(results);
    } else {
      setFilteredIssues([]);
    }
  }, [searchQuery, filterStatus, issues]);

  // Mock data for tickets by priority - based on actual data now
  const getPriorityData = () => {
    const priorityCounts = {
      "Low": 0, 
      "Medium": 0, 
      "High": 0
    };
    
    issues.forEach(issue => {
      if (priorityCounts.hasOwnProperty(issue.priority)) {
        priorityCounts[issue.priority]++;
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
    
    issues.forEach(issue => {
      if (!deptCounts[issue.department]) {
        deptCounts[issue.department] = 0;
      }
      deptCounts[issue.department]++;
    });
    
    return Object.keys(deptCounts).map(key => ({
      name: key,
      value: deptCounts[key]
    }));
  };

  const getStatusCount = (status) => {
    return issues.filter(issue => issue.status?.toLowerCase() === status.toLowerCase()).length;
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
      setError("You must be logged in to create an issue");
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
        empName: user.empName || user.name || 'N/A', // Add employee name from user object
        floor: newTicket.floor, // Use the floor from newTicket state
        building: newTicket.building // Add the building from newTicket state
      };
      
      await addDoc(collection(db, "tickets"), ticketData);
      console.log("Issue created successfully");
      
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
      // onSnapshot listener will handle updates automatically
      
      // Navigate to issues tab
      setActiveTab("issues");
    } catch (err) {
      console.error("Error creating issue:", err);
      setError("Failed to create issue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change for a ticket
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setLoading(true);
      const ticketRef = doc(db, "tickets", ticketId);
      
      const updateData = {
        status: newStatus
      };

      // Add resolvedAt timestamp if status is resolved
      if (newStatus === 'Resolved') { // Ensure this matches your status string
        updateData.resolvedAt = Timestamp.now(); // Use Firestore Timestamp
      } else {
        // Optional: Remove resolvedAt if status changes back from Resolved
        // Depending on your logic, you might want to clear the resolvedAt date
        // if a ticket is reopened. Use Firebase's field value delete if needed.
        // updateData.resolvedAt = firebase.firestore.FieldValue.delete(); // Example
      }

      await updateDoc(ticketRef, updateData);

      console.log("Issue status updated successfully");

    } catch (err) {
      console.error("Error updating issue:", err);
      setError("Failed to update issue: " + err.message);
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
      case "viewAllIssues":
        setActiveTab("issues");
        break;
      case "viewReports":
        setActiveTab("analytics");
        break;
      case "resolvedIssues":
        setFilterStatus("Resolved");
        setActiveTab("issues");
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
    // No need for manual refresh as we're using real-time updates
    console.log("Real-time updates are active, no manual refresh needed");
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
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-gray-900/50 to-purple-900/50 backdrop-blur-3xl"></div>
        <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-purple-500/20 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {language === "English" ? "IT Help Desk Login" : "आयटी हेल्प डेस्क लॉगिन"}
          </h2>
          
          <div className="flex justify-center mb-8">
            <div className="flex border border-purple-500/30 rounded-lg overflow-hidden">
              <button 
                className={`px-6 py-3 ${authMode === 'login' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                onClick={() => setAuthMode('login')}
              >
                {language === "English" ? "Login" : "लॉगिन"}
              </button>
              <button 
                className={`px-6 py-3 ${authMode === 'register' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                onClick={() => setAuthMode('register')}
              >
                {language === "English" ? "Register" : "नोंदणी"}
              </button>
            </div>
          </div>
          
          {authError && (
            <div className="mb-6 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-700/50 backdrop-blur-sm">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300" htmlFor="email">
                {language === "English" ? "Email" : "ईमेल"}
              </label>
              <input
                id="email"
                type="email" 
                className="w-full bg-transparent border border-purple-500/20 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300" htmlFor="password">
                {language === "English" ? "Password" : "पासवर्ड"}
              </label>
              <input 
                id="password"
                type="password" 
                className="w-full bg-transparent border border-purple-500/20 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white p-3 rounded-lg hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              disabled={loading}
            >
              {loading ? (language === "English" ? "Signing In..." : "साइन इन करत आहे...") : 
               (language === "English" ? "Sign In" : "साइन इन")}
            </button>
          </form>
          
          <div className="mt-8">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {language === "English" ? "Language" : "भाषा"}
            </label>
            <select 
              className="w-full bg-transparent border border-purple-500/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
      return <div className="p-6 text-center">Loading dashboard issues...</div>;
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
              {language === "English" ? "Create New Issue" : "नवीन समस्या तयार करा"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Total Issues" : "एकूण समस्या"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-purple-500">{issues.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Open Issues" : "खुले समस्या"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-red-500">{getStatusCount("Open")}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "In Progress" : "प्रगतीपथावर"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-yellow-500">{getStatusCount("InProgress")}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow">
            <h2 className="text-gray-500 mb-2">{language === "English" ? "Resolved Issues" : "निराकरण केलेले समस्या"}</h2>
            <p className="text-3xl md:text-4xl font-bold text-green-500">{getStatusCount("Resolved")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-md shadow lg:col-span-3">
            <h2 className="text-lg font-medium mb-4">{language === "English" ? "Recent Issues" : "अलीकडील समस्या"}</h2>
            {issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === "English" ? "No issues found. Create your first issue!" : "कोणत्याही समस्या सापडल्या नाहीत. आपली पहिली समस्या तयार करा!"}
              </div>
            ) : (
              <div className="space-y-4">
                {issues.slice(0, 2).map(issue => (
                  <div key={issue.id} className="border-b pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{issue.title}</h3>
                        <p className="text-gray-500 text-sm">{issue.description?.substring(0, 50)}...</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          issue.status === "Open" ? "bg-red-100 text-red-800" :
                          issue.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {issue.status === "InProgress" 
                            ? (language === "English" ? "In Progress" : "प्रगतीपथावर")
                            : (language === "English" ? issue.status : (issue.status === "Open" ? "खुले" : "निराकरण केलेले"))}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          issue.priority === "Low" ? "bg-gray-100 text-gray-800" :
                          issue.priority === "Low" ? "bg-gray-100 text-gray-800" :
                          issue.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {language === "English" ? issue.priority : 
                            (issue.priority === "Low" ? "कमी" : 
                             issue.priority === "Medium" ? "मध्यम" : "उच्च")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <span>{issue.createdAt}</span>
                       <span className="flex items-center space-x-2">
                          <span>{issue.department}</span>
                           {issue.assignedTo && (
                           <span className="text-purple-600 font-medium text-xs sm:text-sm">
                              ({language === "English" ? "Handler" : "हँडलर"}: {issue.assignedTo})
                           </span>
                         )}
                       </span>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setActiveTab("issues")} 
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {language === "English" ? "View All Issues" : "सर्व समस्या पहा"} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTicketsList = () => {
    if (loading) {
      return <div className="p-6 text-center">Loading issues...</div>;
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
            {language === "English" ? "All Issues" : "सर्व समस्या"}
          </h1>
          <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full border rounded-md"
                placeholder={language === "English" ? "Search issues..." : "समस्या शोधा..."}
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
              {language === "English" ? "New Issue" : "नवीन समस्या"}
            </button>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-md shadow p-8 text-center">
            <div className="text-gray-500 mb-4">
              {language === "English" ? "No issues found" : "कोणत्याही समस्या सापडल्या नाहीत"}
            </div>
            <button 
              onClick={() => setActiveTab("createTicket")}
              className="bg-purple-500 text-white px-4 py-2 rounded-md"
            >
              {language === "English" ? "Create your first issue" : "आपली पहिली समस्या तयार करा"}
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
                    <th className="py-3 px-4 text-left font-medium text-gray-500 hidden md:table-cell">
                      {language === "English" ? "Handler" : "हँडलर"}
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 hidden md:table-cell">
                      {language === "English" ? "Raised On" : "केव्हा दाखल केले"}
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 hidden md:table-cell">
                      {language === "English" ? "Resolved On" : "केव्हा निराकरण केले"}
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 hidden md:table-cell">
                      {language === "English" ? "Remark" : "शेरा"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-sm text-gray-500 md:hidden">{issue.department}</div>
                          <div className="text-xs text-gray-400">{issue.createdAt}</div>
                          {/* Display handler inline on small screens */}
                          {issue.assignedTo && (
                            <div className="text-xs text-gray-500 mt-1 md:hidden">
                              {language === "English" ? "Handler" : "हँडलर"}: <span className="text-purple-600 font-medium">{issue.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">{issue.department}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          issue.priority === "Low" ? "bg-gray-100 text-gray-800" :
                          issue.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {language === "English" ? issue.priority : 
                            (issue.priority === "Low" ? "कमी" : 
                             issue.priority === "Medium" ? "मध्यम" : "उच्च")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          issue.status === "Open" ? "bg-red-100 text-red-800" :
                          issue.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {issue.status === "InProgress" 
                            ? (language === "English" ? "In Progress" : "प्रगतीपथावर")
                            : (language === "English" ? issue.status : (issue.status === "Open" ? "खुले" : "निराकरण केलेले"))}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {/* Display handler in dedicated column on larger screens */}
                        <span className="hidden md:inline">{issue.assignedTo || ''}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 hidden md:table-cell whitespace-nowrap">
                        {issue.createdAt || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 hidden md:table-cell whitespace-nowrap">
                        {/* Display Resolved At date and time, handling potential null/invalid dates */}
                        {issue.resolvedAt ? (issue.resolvedAt instanceof Date && !isNaN(issue.resolvedAt.getTime()) ? issue.resolvedAt.toLocaleString() : 'N/A') : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 hidden md:table-cell whitespace-nowrap">
                        {/* Display "Solved" if status is Resolved, otherwise '-' */}
                        {issue.status === 'Resolved' ? (language === "English" ? "Solved" : "निराकरण केलेले") : '-'}
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
            {language === "English" ? "Create New Issue" : "नवीन समस्या तयार करा"}
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
                  {language === "English" ? "Issue Title" : "समस्या शीर्षक"}
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
              
              {/* New Building Field */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="building">
                  {language === "English" ? "Building" : "इमारत"}
                </label>
                <select
                  id="building"
                  name="building"
                  className="w-full border rounded-md p-2"
                  value={newTicket.building}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Building 1">Building 1</option>
                  <option value="Building 2">Building 2</option>
                  <option value="Building 3">Building 3</option>
                  {/* Removed Building 4 and 5 options */}
                </select>
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
                  {availableFormFloors.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
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
              
               {/* New field for Issue Type */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="type">
                  {language === "English" ? "Issue Type" : "समस्येचा प्रकार"}
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full border rounded-md p-2"
                  value={newTicket.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Hardware">{language === "English" ? "Hardware" : "हार्डवेअर"}</option>
                  <option value="Software">{language === "English" ? "Software" : "सॉफ्टवेअर"}</option>
                  <option value="Network">{language === "English" ? "Network" : "नेटवर्क"}</option>
                  <option value="Other">{language === "English" ? "Other" : "इतर"}</option>
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
                  (language === "English" ? "Create Issue" : "समस्या तयार करा")}
              </button>
            </div>
          </form>
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
                  <h3 className="font-medium">{language === "English" ? "How do I create an issue?" : "मी समस्या कशी तयार करू?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Click on the 'Create Issue' button in the dashboard or navigation menu, fill out the form with your issue details, and submit." 
                      : "डॅशबोर्ड किंवा नेव्हिगेशन मेनूमधील 'समस्या तयार करा' बटणावर क्लिक करा, आपल्या समस्येचा तपशील सह फॉर्म भरा आणि सबमिट करा."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "How are issue priorities determined?" : "समस्या प्राधान्य कसे निर्धारित केले जातात?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "You can select the priority level when creating an issue. Choose 'Low' for minor issues, 'Medium' for standard issues, and 'High' for urgent matters that require immediate attention." 
                      : "समस्या तयार करताना आपण प्राधान्य स्तर निवडू शकता. किरकोळ समस्यांसाठी 'कमी', मानक समस्यांसाठी 'मध्यम' आणि तात्काळ लक्ष देण्याची आवश्यकता असलेल्या तातडीच्या बाबींसाठी 'उच्च' निवडा."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "Who can see my issues?" : "माझ्या समस्या कोण पाहू शकतो?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Only you and the support staff can see your issues. Administrators have access to all issues in the system for management purposes." 
                      : "फक्त आपण आणि सपोर्ट स्टाफ आपल्या समस्या पाहू शकतात. प्रशासकांना व्यवस्थापन उद्देशांसाठी सिस्टममधील सर्व समस्यांचा प्रवेश आहे."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "How do I check the status of my issue?" : "मी माझ्या समस्याची स्थिती कशी तपासू?"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Go to the 'Issues' tab to see all your issues and their current status. Issues are marked as 'Open', 'In Progress', or 'Resolved'." 
                      : "'समस्या' टॅबवर जा आणि आपली सर्व समस्या आणि त्यांची वर्तमान स्थिती पहा. समस्या 'खुले', 'प्रगतीपथावर' किंवा 'निराकरण केलेले' म्हणून चिन्हांकित केल्या जातात।"}
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
                      ? "The dashboard provides an overview of all your issues, quick actions, and analytical charts. Use the sidebar to navigate between different sections of the application." 
                      : "डॅशबोर्ड आपल्या सर्व समस्यांचे, त्वरित कृती आणि विश्लेषणात्मक चार्टचे अवलोकन प्रदान करतो. अॅप्लिकेशनच्या विविध विभागांमध्ये नेव्हिगेट करण्यासाठी साइडबार वापरा."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">{language === "English" ? "Creating and Managing Issues" : "समस्या तयार करणे आणि व्यवस्थापित करणे"}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {language === "English" 
                      ? "Create new issues by clicking 'New Issue', fill in the required fields, and submit. View all issues in the 'Issues' tab where you can also filter and search for specific issues." 
                      : "'नवीन समस्या' वर क्लिक करून नवीन समस्या तयार करा, आवश्यक फील्ड भरा आणि सबमिट करा. 'समस्या' टॅबमध्ये सर्व समस्या पहा जिथे आपण विशिष्ट समस्यांसाठी फिल्टर आणि शोध देखील करू शकता."}
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
                onClick={() => setActiveTab("issues")} 
                className={`flex items-center px-3 py-2 w-full rounded-md ${activeTab === "issues" ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-purple-50"}`}
              >
                <Ticket size={20} className="mr-3" />
                <span>{language === "English" ? "Issues" : "समस्या"}</span>
              </button>
              <button 
                onClick={() => setActiveTab("createTicket")}
                className={`flex items-center px-3 py-2 w-full rounded-md ${activeTab === "createTicket" ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-purple-50"}`}
              >
                <FilePlus size={20} className="mr-3" />
                <span>{language === "English" ? "Raise Issue" : "समस्या वाढवा"}</span>
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
                {activeTab === "issues" && (language === "English" ? "Issues" : "समस्या")}
                {activeTab === "createTicket" && (language === "English" ? "Create Issue" : "समस्या तयार करा")}
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
          {activeTab === "issues" && renderTicketsList()}
          {activeTab === "createTicket" && renderCreateTicketForm()}
          {activeTab === "help" && renderHelp()}
        </main>
      </div>
    </div>
  );
};
