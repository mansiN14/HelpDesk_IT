import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Clock, Users, AlertTriangle, Check, Map, BarChart, Monitor, Cpu, Laptop, Award, Phone, Menu, X } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Your Firebase configuration object
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
const db = getFirestore(app);

// Example initial data (customize as needed)
const initialTickets = [
  {
    id: 1,
    systemId: "S1-01",
    issue: "Monitor not working",
    priority: "high",
    status: "open",
    assignedTo: "",
    floor: "S1",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    systemId: "S2-03",
    issue: "Keyboard issue",
    priority: "medium",
    status: "in-progress",
    assignedTo: "Saff mem name",
    floor: "S2",
    createdAt: new Date().toISOString()
  }
  // Add more tickets as needed
];

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
  S3: {
    systems: [],
    cabins: []
  },
  S4: {
    systems: [],
    cabins: []
  }
};

// Main Admin App Component
export default function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFloor, setCurrentFloor] = useState('S1');
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch all tickets for admin
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const ticketsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleString() || new Date().toLocaleString()
        }));
        setTickets(ticketsData);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Add this to AdminDashboard component
  const refreshTickets = async () => {
    try {
      const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ticketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString() || new Date().toLocaleString()
      }));
      setTickets(ticketsData);
    } catch (err) {
      console.error("Error refreshing tickets:", err);
    }
  };

  // Update useEffect to include the refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTickets();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Function to update ticket status
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      // Update in Firestore
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  // Function to assign ticket to staff
  const assignTicket = (ticketId, staffName) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, assignedTo: staffName, status: 'in-progress' } : ticket
    ));
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, assignedTo: staffName, status: 'in-progress' });
    }
  };

  // Handle tab change (also close sidebar on mobile)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // Handle ticket selection (close sidebar on mobile when selecting ticket)
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Update the main container div and add the SVG background component properly
  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* SVG Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <svg 
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1c2a" />
              <stop offset="100%" stopColor="#121420" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="30" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base background */}
          <rect width="100%" height="100%" fill="url(#gradient)" />

          {/* Decorative elements */}
          <circle cx="10%" cy="20%" r="100" fill="#6366f1" opacity="0.1" filter="url(#glow)" />
          <circle cx="90%" cy="60%" r="150" fill="#8b5cf6" opacity="0.1" filter="url(#glow)" />
          <circle cx="50%" cy="80%" r="120" fill="#6366f1" opacity="0.1" filter="url(#glow)" />

          {/* Additional subtle patterns */}
          <path 
            d="M0,0 L100,0 L50,100 Z" 
            fill="#6366f1" 
            opacity="0.05" 
            transform="translate(100,100) rotate(45)"
          />
          <path 
            d="M0,0 L100,0 L50,100 Z" 
            fill="#8b5cf6" 
            opacity="0.05" 
            transform="translate(700,400) rotate(180)"
          />
        </svg>
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          user={user} 
          onLogout={onLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        <div className="flex flex-1 relative">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            isOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
          />
          <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto">
            {activeTab === 'map' && (
              <FloorView
                currentFloor={currentFloor}
                setCurrentFloor={setCurrentFloor}
                tickets={tickets}
                floorConfig={floorConfig}
                setSelectedTicket={handleTicketSelect}
              />
            )}
            {activeTab === 'tickets' && (
              <TicketList
                tickets={tickets}
                setSelectedTicket={handleTicketSelect}
              />
            )}
            {activeTab === 'dashboard' && <Dashboard tickets={tickets} />}
          </main>
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
              updateStatus={updateTicketStatus}
              assignTicket={assignTicket}
              isMobile={window.innerWidth < 768}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Header Component - Updated with mobile menu toggle
function Header({ user, onLogout, toggleSidebar }) {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-100 p-2 sm:p-4 shadow-lg border-b border-gray-700 flex justify-between items-center">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 md:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="bg-purple-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xl mr-2 sm:mr-3">
          IT
        </div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">IT Support Admin</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
        <div className="hidden sm:flex items-center bg-gray-800 px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-sm border border-gray-700">
          <Clock size={16} className="mr-1 sm:mr-2 text-purple-400" />
          <span className="text-xs sm:text-sm">{new Date().toLocaleDateString()}</span>
        </div>
        {user && (
          <div className="bg-purple-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-sm hidden sm:flex items-center">
            <Users size={16} className="mr-1 sm:mr-2" />
            <span className="font-medium text-xs sm:text-sm truncate max-w-24 md:max-w-full">{user.email}</span>
          </div>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="bg-red-600 px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-white text-xs sm:text-sm"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

// Sidebar Component - Updated with responsive design
function Sidebar({ activeTab, setActiveTab, isOpen, closeSidebar }) {
  const tabs = [
    { id: 'map', label: 'Floor Map', icon: <Map size={20} /> },
    { id: 'tickets', label: 'Tickets', icon: <AlertTriangle size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
  ];

  return (
    <aside className={`bg-gray-900 text-gray-300 shadow-lg border-r border-gray-700 fixed md:relative z-30 top-0 left-0 h-full transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} w-64`}>
      <div className="flex justify-between items-center p-4 md:hidden">
        <h2 className="text-xl font-semibold text-purple-400">Support Control</h2>
        <button onClick={closeSidebar} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        <h2 className="text-xl font-semibold mb-6 text-center text-purple-400 hidden md:block">Support Control</h2>
        <nav>
          <ul className="space-y-2 md:space-y-4">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full p-2 md:p-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <span className={`mr-3 md:mr-4 ${activeTab === tab.id ? 'text-white' : 'text-purple-400'}`}>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-gray-700">
          <div className="bg-gray-800 rounded-lg p-3 md:p-4 border border-gray-700">
            <h3 className="font-medium text-xs md:text-sm mb-2 text-purple-400">System Status</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm">Active Tickets:</span>
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm">System Online:</span>
              <span className="flex items-center text-green-400 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                All Systems
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// FloorView Component - Updated with responsive layout
function FloorView({ currentFloor, setCurrentFloor, tickets, floorConfig, setSelectedTicket }) {
  const floorTabs = Object.keys(floorConfig);

  // Function to check if a system has an open ticket
  const getSystemStatus = (systemId) => {
    const ticket = tickets.find(t => t.deviceId === systemId && t.status !== 'resolved');
    if (!ticket) return 'available';
    return ticket.status;
  };

  // Function to handle clicking on a system
  const handleSystemClick = (systemId) => {
    const ticket = tickets.find(t => t.deviceId === systemId && t.status !== 'resolved');
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

  // Helper to get ticket for a device
  const getDeviceTicket = (deviceId) => {
    return tickets.find(
      t => t.deviceId === deviceId && t.status !== "Resolved"
    );
  };

  // Example rendering for devices:
  const devices = [
    ...floorConfig[currentFloor].systems,
    ...floorConfig[currentFloor].cabins.flatMap(cabin => cabin.systems)
  ];

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-700">
      <div className="mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-100 flex items-center">
          <Map size={20} className="text-purple-400 mr-2 md:mr-3" />
          Floor Map
        </h2>
        
        {/* Floor Selection Tabs - Responsive */}
        <div className="flex flex-wrap bg-gray-900 p-1 rounded-xl mb-4 md:mb-8 mx-auto border border-gray-700">
          {floorTabs.map(floor => (
            <button
              key={floor}
              onClick={() => setCurrentFloor(floor)}
              className={`flex-1 py-2 md:py-3 rounded-lg transition-all duration-300 min-w-16 ${
                currentFloor === floor
                ? 'bg-purple-600 text-white font-medium shadow-lg transform scale-105'
                : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm md:text-lg font-medium">Floor {floor}</span>
                <span className="text-xs mt-1 opacity-75">
                  {tickets.filter(t => t.floor === floor && t.status !== 'resolved').length} active
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floor Layout - Responsive */}
      <div className="bg-gray-900 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-700 shadow-inner relative overflow-hidden">
        <h3 className="text-center mb-4 md:mb-8 font-bold text-lg md:text-xl text-purple-400 relative">
          Floor {currentFloor} Layout
        </h3>

        {/* Open Office Desks Section */}
        <div className="mb-6 md:mb-10 bg-gray-800 rounded-xl border border-gray-700 p-3 sm:p-4 md:p-6 shadow-md relative z-10">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="bg-gray-900 text-purple-400 p-1 md:p-2 rounded-lg border border-gray-700">
              <Monitor size={20} />
            </div>
            <h4 className="text-purple-400 font-bold text-base md:text-lg ml-2 md:ml-3">Open Office Desks</h4>
            <div className="h-px bg-gray-700 flex-grow ml-2 md:ml-4"></div>
          </div>
          
          {/* Office Desk Rows - Responsive Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-6 sm:gap-y-8 md:gap-y-12 gap-x-2 sm:gap-x-3 md:gap-x-4 mb-4 md:mb-8">
            {floorConfig[currentFloor].systems.slice(0, 5).map((system) => {
              const status = getSystemStatus(system.id);
              return (
                <OfficeDesk 
                  key={system.id}
                  system={system} 
                  status={status} 
                  onClick={() => handleSystemClick(system.id)}
                />
              );
            })}
          </div>
          
          {/* Aisle Space */}
          <div className="h-6 md:h-10 mb-4 md:mb-8 relative">
            <div className="absolute inset-0 border-t border-b border-dashed border-gray-600 flex items-center justify-center">
              <span className="bg-gray-900 px-2 md:px-4 text-xs text-gray-400">WALKING AISLE</span>
            </div>
          </div>
          
          {/* Second Row of Office Desks - Responsive Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-6 sm:gap-y-8 md:gap-y-12 gap-x-2 sm:gap-x-3 md:gap-x-4">
            {floorConfig[currentFloor].systems.slice(5, 10).map((system) => {
              const status = getSystemStatus(system.id);
              return (
                <OfficeDesk 
                  key={system.id}
                  system={system} 
                  status={status} 
                  onClick={() => handleSystemClick(system.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Private Cabin Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-3 sm:p-4 md:p-6 shadow-md relative z-10">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="bg-gray-900 text-purple-400 p-1 md:p-2 rounded-lg border border-gray-700">
              <Cpu size={20} />
            </div>
            <h4 className="text-purple-400 font-bold text-base md:text-lg ml-2 md:ml-3">Cabins</h4>
            <div className="h-px bg-gray-700 flex-grow ml-2 md:ml-4"></div>
          </div>

          {/* Cabins Layout - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {floorConfig[currentFloor].cabins.map(cabin => (
              <div key={cabin.id} className="border border-gray-700 rounded-lg p-2 sm:p-3 md:p-4 bg-gray-900 shadow-lg">
                <h5 className="text-purple-300 font-medium mb-2 md:mb-3 border-b border-gray-700 pb-1 md:pb-2">Cabin {cabin.id}</h5>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                  {cabin.systems.map(system => {
                    const status = getSystemStatus(system.id);
                    return (
                      <OfficeDesk 
                        key={system.id}
                        system={system} 
                        status={status} 
                        onClick={() => handleSystemClick(system.id)}
                        isSmall={true}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-4 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 mr-1 md:mr-2"></div>
            <span className="text-xs md:text-sm text-gray-300">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-500 mr-1 md:mr-2"></div>
            <span className="text-xs md:text-sm text-gray-300">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 mr-1 md:mr-2"></div>
            <span className="text-xs md:text-sm text-gray-300">Issue Reported</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// OfficeDesk Component - Updated for responsiveness
function OfficeDesk({ system, status, onClick, isSmall = false }) {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in-progress': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const sizes = isSmall 
    ? "scale-75 md:scale-90"
    : "";

  return (
    <div 
      onClick={onClick}
      className={`relative ${sizes} ${status !== 'available' ? 'cursor-pointer transform hover:scale-105 transition-transform' : ''}`}
    >
      {/* Desk */}
      <div className={`bg-gray-700 rounded-lg border border-gray-600 shadow-md p-2 flex flex-col items-center justify-center ${status !== 'available' ? 'ring-2 ring-offset-1 ring-offset-gray-800 ' + getStatusColor(status) : ''}`}>
        <div className="bg-gray-800 p-1 md:p-2 rounded-md mb-1 md:mb-2">
          <Laptop size={isSmall ? 14 : 18} className="text-purple-400" />
        </div>
        <span className={`font-mono text-xs ${status !== 'available' ? 'text-black font-medium' : 'text-gray-400'}`}>
          {system.id}
        </span>
      </div>
      
      {/* Status indicator */}
      {status !== 'available' && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full ${getStatusColor(status)} border-2 border-gray-800 shadow-lg`}></div>
      )}
    </div>
  );
}

// TicketList Component - Updated for responsiveness
function TicketList({ tickets, setSelectedTicket }) {
  const [filter, setFilter] = useState('all');
  
  // Update the filter logic in TicketList component
  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status?.toLowerCase() === filter.toLowerCase());

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const colors = {
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white'
    };
    
    return (
      <span className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded ${colors[priority?.toLowerCase()] || colors.low} font-medium`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase() || 'Low'}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100 flex items-center">
          <AlertTriangle size={20} className="text-purple-400 mr-2 md:mr-3" />
          Support Tickets
        </h2>
        
        {/* Filter buttons - Responsive */}
        <div className="flex flex-wrap bg-gray-900 p-1 rounded-lg border border-gray-700">
          <button 
            onClick={() => setFilter('all')}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('open')}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${filter === 'open' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Open
          </button>
          <button 
            onClick={() => setFilter('in-progress')}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${filter === 'in-progress' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('resolved')}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${filter === 'resolved' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
            Resolved
          </button>
        </div>
      </div>
      
      {/* Tickets list - Responsive with grid for large screens and list for small */}
      <div className="space-y-2 md:space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 text-center border border-gray-700">
            <p className="text-gray-400">No tickets match your filter criteria.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-gray-900 rounded-lg p-2 sm:p-3 md:p-4 border border-gray-700 hover:bg-gray-850 cursor-pointer transform hover:translate-x-1 transition-all duration-200"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4 items-center">
                <div className="flex items-center col-span-3 sm:col-span-2">
                  <div className="bg-gray-800 p-1 sm:p-2 rounded border border-gray-700 mr-2 sm:mr-3">
                    <Laptop size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-200">{ticket.deviceId || ticket.systemId || 'Unknown Device'}</h3>
                    <p className="text-xs text-gray-400">
                      {ticket.floor || 'Unknown Floor'} · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="col-span-3 sm:col-span-2 md:col-span-3">
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-1">{ticket.issue}</p>
                </div>
                
                <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    ticket.status?.toLowerCase() === 'open' ? 'bg-red-500 text-white' :
                    ticket.status?.toLowerCase() === 'in-progress' ? 'bg-yellow-500 text-black' :
                    ticket.status?.toLowerCase() === 'resolved' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1).toLowerCase() || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// TicketDetail Component - Updated for responsiveness
function TicketDetail({ ticket, onClose, updateStatus, assignTicket, isMobile }) {
  const [assignee, setAssignee] = useState(ticket.assignedTo || '');
  const [staffList] = useState(['Name1', 'Name2', 'Name3', 'Name4', 'Name5']); // Example staff list
  
  // Function to handle assignment
  const handleAssign = () => {
    if (assignee && assignee !== ticket.assignedTo) {
      assignTicket(ticket.id, assignee);
    }
  };
  
  return (
    <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 border-l border-gray-700 shadow-lg ${
      isMobile ? 'fixed inset-0 z-50' : 'w-72 md:w-80 lg:w-96'
    }`}>
      {/* Add decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ticketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </linearGradient>
              <filter id="ticketGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="1" k3="-1" />
              </filter>
            </defs>
            <circle cx="90" cy="10" r="20" fill="url(#ticketGradient)" filter="url(#ticketGlow)" />
            <circle cx="10" cy="90" r="15" fill="url(#ticketGradient)" filter="url(#ticketGlow)" />
            <path 
              d="M0,50 Q25,25 50,50 T100,50"
              stroke="url(#ticketGradient)"
              strokeWidth="0.5"
              fill="none"
              filter="url(#ticketGlow)"
            />
          </svg>
        </div>
      </div>

      {/* Header - Add glassmorphism effect */}
      <div className="relative flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-purple-400">Ticket Details</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Content - Add subtle background pattern */}
      <div className="relative p-3 sm:p-4 overflow-auto h-[calc(100vh-4rem)] bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/30">
        {/* Add subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" 
               style={{
                 backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
                 backgroundSize: '24px 24px'
               }}
          />
        </div>

        {/* Existing content with improved styling */}
        <div className="relative space-y-4">
          {/* Ticket header with icon */}
          <div className="flex items-start mb-4">
            <div className="bg-gray-800 p-2 rounded-lg border border-gray-700 mr-3">
              <Laptop size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-100">
                {ticket.deviceId || ticket.systemId || 'Unknown Device'}
              </h3>
              <p className="text-sm text-gray-400">
                Floor: {ticket.floor || 'Unknown'} · Created: {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Ticket details */}
          <div className="space-y-4">
            {/* Issue description */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Issue Description</h4>
              <p className="text-gray-200">{ticket.issue}</p>
            </div>
            
            {/* Status section */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => updateStatus(ticket.id, 'open')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'open' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Open
                </button>
                <button 
                  onClick={() => updateStatus(ticket.id, 'in-progress')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'in-progress' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  In Progress
                </button>
                <button 
                  onClick={() => updateStatus(ticket.id, 'resolved')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'resolved' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
            
            {/* Priority label */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Priority</h4>
              <div className={`py-1 px-3 rounded-full inline-block text-xs font-medium ${
                ticket.priority === 'high' ? 'bg-red-500 text-white' :
                ticket.priority === 'medium' ? 'bg-yellow-500 text-black' :
                'bg-green-500 text-white'
              }`}>
                {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1).toLowerCase() || 'Low'}
              </div>
            </div>
            
            {/* Assign section */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Assign Technician</h4>
              <div className="flex items-center gap-2">
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm p-2 flex-grow"
                >
                  <option value="">Select Technician</option>
                  {staffList.map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!assignee || assignee === ticket.assignedTo}
                  className={`bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium ${
                    !assignee || assignee === ticket.assignedTo 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-purple-700'
                  }`}
                >
                  Assign
                </button>
              </div>
              {ticket.assignedTo && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-400">Currently assigned to:</span>
                  <span className="ml-2 text-purple-400 font-medium">{ticket.assignedTo}</span>
                </div>
              )}
            </div>
            
            {/* Activity timeline */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="mt-1 bg-purple-500 rounded-full w-3 h-3 flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-200">Ticket created</p>
                  </div>
                </div>
                {ticket.assignedTo && (
                  <div className="flex items-start">
                    <div className="mt-1 bg-purple-500 rounded-full w-3 h-3 flex-shrink-0"></div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-200">Assigned to {ticket.assignedTo}</p>
                    </div>
                  </div>
                )}
                {ticket.status === 'resolved' && (
                  <div className="flex items-start">
                    <div className="mt-1 bg-purple-500 rounded-full w-3 h-3 flex-shrink-0"></div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.resolvedAt || ticket.updatedAt || ticket.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-200">Ticket resolved</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component - Updated for responsiveness
function Dashboard({ tickets }) {
  // Calculate summary statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  
  // Calculate ticket metrics by priority
  const highPriorityTickets = tickets.filter(t => t.priority === 'high').length;
  const mediumPriorityTickets = tickets.filter(t => t.priority === 'medium').length;
  const lowPriorityTickets = tickets.filter(t => t.priority === 'low').length;
  
  // Calculate floor statistics
  const floorStats = tickets.reduce((acc, ticket) => {
    const floor = ticket.floor || 'Unknown';
    
    if (!acc[floor]) {
      acc[floor] = { total: 0, open: 0, inProgress: 0, resolved: 0 };
    }
    
    acc[floor].total++;
    if (ticket.status === 'open') acc[floor].open++;
    if (ticket.status === 'in-progress') acc[floor].inProgress++;
    if (ticket.status === 'resolved') acc[floor].resolved++;
    
    return acc;
  }, {});
  
  // Example ticket trend data (in a real app, this would come from the server)
  const ticketTrend = [
    { date: '2025-05-10', open: 5, inProgress: 3, resolved: 2 },
    { date: '2025-05-11', open: 7, inProgress: 4, resolved: 3 },
    { date: '2025-05-12', open: 6, inProgress: 5, resolved: 5 },
    { date: '2025-05-13', open: 4, inProgress: 6, resolved: 7 },
    { date: '2025-05-14', open: 8, inProgress: 4, resolved: 5 },
    { date: '2025-05-15', open: 6, inProgress: 3, resolved: 8 },
    { date: '2025-05-16', open: 5, inProgress: 4, resolved: 6 },
    { date: '2025-05-17', open: openTickets, inProgress: inProgressTickets, resolved: resolvedTickets }
  ];
  
  // Priority percentage calculation
  const totalPriorityTickets = highPriorityTickets + mediumPriorityTickets + lowPriorityTickets;
  const highPercentage = totalPriorityTickets > 0 ? (highPriorityTickets / totalPriorityTickets) * 100 : 0;
  const mediumPercentage = totalPriorityTickets > 0 ? (mediumPriorityTickets / totalPriorityTickets) * 100 : 0;
  const lowPercentage = totalPriorityTickets > 0 ? (lowPriorityTickets / totalPriorityTickets) * 100 : 0;
  
  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-100 flex items-center">
        <BarChart size={20} className="text-purple-400 mr-2 md:mr-3" />
        Dashboard Overview
      </h2>
      
      {/* Top stats cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center shadow-md">
          <div className="bg-purple-500 p-3 rounded-lg mr-4">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <span className="text-gray-400 text-sm">Total Tickets</span>
            <h3 className="text-2xl font-bold text-white">{totalTickets}</h3>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center shadow-md">
          <div className="bg-red-500 p-3 rounded-lg mr-4">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <span className="text-gray-400 text-sm">Open Tickets</span>
            <h3 className="text-2xl font-bold text-white">{openTickets}</h3>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center shadow-md">
          <div className="bg-yellow-500 p-3 rounded-lg mr-4">
            <Clock size={20} className="text-black" />
          </div>
          <div>
            <span className="text-gray-400 text-sm">In Progress</span>
            <h3 className="text-2xl font-bold text-white">{inProgressTickets}</h3>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center shadow-md">
          <div className="bg-green-500 p-3 rounded-lg mr-4">
            <Check size={20} className="text-white" />
          </div>
          <div>
            <span className="text-gray-400 text-sm">Resolved</span>
            <h3 className="text-2xl font-bold text-white">{resolvedTickets}</h3>
          </div>
        </div>
      </div>
      
      {/* Charts row - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Ticket Trends Chart */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-white mb-4">Ticket Trends</h3>
          <div className="h-64">
            <TicketTrendsChart data={ticketTrend} />
          </div>
        </div>
        
        {/* Priority Distribution Chart */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-white mb-4">Priority Distribution</h3>
          <div className="h-64">
            <PriorityDistribution 
              high={highPriorityTickets}
              medium={mediumPriorityTickets}
              low={lowPriorityTickets}
            />
          </div>
        </div>
      </div>
      
      {/* Floor statistics table */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
        <h3 className="text-lg font-medium text-white mb-4">Floor Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-900">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Floor</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Open</th>
                <th className="px-4 py-3">In Progress</th>
                <th className="px-4 py-3 rounded-r-lg">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(floorStats).map(([floor, stats], index) => (
                <tr key={floor} className={`bg-gray-900 ${index % 2 === 0 ? 'bg-opacity-50' : 'bg-opacity-30'}`}>
                  <td className="px-4 py-3 font-medium">{floor}</td>
                  <td className="px-4 py-3">{stats.total}</td>
                  <td className="px-4 py-3">
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{stats.open}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">{stats.inProgress}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">{stats.resolved}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recent activity section */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {tickets.slice(0, 5).map((ticket, index) => (
            <div key={index} className="flex items-start bg-gray-900 p-3 rounded-lg">
              <div className={`mt-1 rounded-full w-3 h-3 flex-shrink-0 ${
                ticket.status === 'open' ? 'bg-red-500' :
                ticket.status === 'in-progress' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div className="ml-3">
                <p className="text-xs text-gray-400">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-200">
                  {ticket.status === 'open' ? 'New ticket opened' :
                   ticket.status === 'in-progress' ? 'Ticket assigned to ' + (ticket.assignedTo || 'staff') :
                   'Ticket resolved'} - {ticket.deviceId || ticket.systemId}
                </p>
                <p className="text-xs text-gray-400 mt-1">{ticket.issue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// TicketTrendsChart Component
function TicketTrendsChart({ data }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <LineChart width={500} height={250} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey="open" stroke="#EF4444" strokeWidth={2} />
        <Line type="monotone" dataKey="inProgress" stroke="#F59E0B" strokeWidth={2} />
        <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} />
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F9FAFB' }}
          itemStyle={{ color: '#F9FAFB' }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Legend
          wrapperStyle={{ color: '#F9FAFB' }}
        />
      </LineChart>
    </div>
  );
}

// PriorityDistribution Component
function PriorityDistribution({ high, medium, low }) {
  const data = [
    { name: 'High', value: high, color: '#EF4444' },
    { name: 'Medium', value: medium, color: '#F59E0B' },
    { name: 'Low', value: low, color: '#10B981' }
  ];
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <PieChart width={300} height={250}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F9FAFB' }}
          itemStyle={{ color: '#F9FAFB' }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Legend 
          wrapperStyle={{ color: '#F9FAFB' }}
        />
      </PieChart>
    </div>
  );
}
