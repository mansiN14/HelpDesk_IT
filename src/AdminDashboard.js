import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Clock, Users, AlertTriangle, Check, Map, BarChart, Monitor, Cpu, Laptop, Award, Phone } from 'lucide-react';

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
    assignedTo: "John",
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header user={user} onLogout={onLogout} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-auto bg-gray-800">
          {activeTab === 'map' && (
            <FloorView
              currentFloor={currentFloor}
              setCurrentFloor={setCurrentFloor}
              tickets={tickets}
              floorConfig={floorConfig}
              setSelectedTicket={setSelectedTicket}
            />
          )}
          {activeTab === 'tickets' && (
            <TicketList
              tickets={tickets}
              setSelectedTicket={setSelectedTicket}
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
          />
        )}
      </div>
    </div>
  );
}

// Header Component - Updated with null check
function Header({ user, onLogout }) {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-100 p-4 shadow-lg border-b border-gray-700 flex justify-between items-center">
      <div className="flex items-center">
        <div className="bg-purple-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl mr-3">
          IT
        </div>
        <h1 className="text-2xl font-bold">IT Support Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-700">
          <Clock size={18} className="mr-2 text-purple-400" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        {user && (
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center">
            <Users size={18} className="mr-2" />
            <span className="font-medium">{user.email}</span>
          </div>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-white"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

// Sidebar Component - Updated with dark professional theme
function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'map', label: 'Floor Map', icon: <Map size={20} /> },
    { id: 'tickets', label: 'Tickets', icon: <AlertTriangle size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 shadow-lg border-r border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-8 text-center text-purple-400">Support Control</h2>
        <nav>
          <ul className="space-y-4">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <span className={`mr-4 ${activeTab === tab.id ? 'text-white' : 'text-purple-400'}`}>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 pt-6 border-t border-gray-700">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-medium text-sm mb-2 text-purple-400">System Status</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Active Tickets:</span>
              <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System Online:</span>
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

  
// FloorView Component
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
    <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center">
          <Map size={24} className="text-purple-400 mr-3" />
          Floor Map Visualization
        </h2>
        
        {/* Floor Selection Tabs */}
        <div className="flex bg-gray-900 p-1 rounded-xl mb-8 max-w-md mx-auto border border-gray-700">
          {floorTabs.map(floor => (
            <button
              key={floor}
              onClick={() => setCurrentFloor(floor)}
              className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
                currentFloor === floor
                ? 'bg-purple-600 text-white font-medium shadow-lg transform scale-105'
                : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-lg font-medium">Floor {floor}</span>
                <span className="text-xs mt-1 opacity-75">
                  {tickets.filter(t => t.floor === floor && t.status !== 'resolved').length} active
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floor Layout */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-inner relative overflow-hidden">
        <h3 className="text-center mb-8 font-bold text-xl text-purple-400 relative">
          Floor {currentFloor} Layout
        </h3>

        {/* Open Office Desks Section */}
        <div className="mb-10 bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md relative z-10">
          <div className="flex items-center mb-6">
            <div className="bg-gray-900 text-purple-400 p-2 rounded-lg border border-gray-700">
              <Monitor size={24} />
            </div>
            <h4 className="text-purple-400 font-bold text-lg ml-3">Open Office Desks</h4>
            <div className="h-px bg-gray-700 flex-grow ml-4"></div>
          </div>
          
          {/* Office Desk Rows */}
          <div className="grid grid-cols-5 gap-y-12 gap-x-4 mb-8">
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
          <div className="h-10 mb-8 relative">
            <div className="absolute inset-0 border-t border-b border-dashed border-gray-600 flex items-center justify-center">
              <span className="bg-gray-900 px-4 text-xs text-gray-400">WALKING AISLE</span>
            </div>
          </div>
          
          {/* Second Row of Office Desks */}
          <div className="grid grid-cols-5 gap-y-12 gap-x-4">
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
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md relative z-10">
          <div className="flex items-center mb-6">
            <div className="bg-gray-900 text-purple-400 p-2 rounded-lg border border-gray-700">
              <Cpu size={24} />
            </div>
            <h4 className="text-purple-400 font-bold text-lg ml-3">Cabins</h4>
            <div className="h-px bg-gray-700 flex-grow ml-4"></div>
          </div>

          {/* Cabins Layout */}
          <div className="grid grid-cols-2 gap-8">
            {floorConfig[currentFloor].cabins.map(cabin => (
              <div key={cabin.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900 shadow-lg">
                <h5 className="text-purple-300 font-medium mb-3 border-b border-gray-700 pb-2">Cabin {cabin.id}</h5>
                <div className="grid grid-cols-5 gap-4">
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
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-300">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-300">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-300">Issue Reported</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// OfficeDesk Component
function OfficeDesk({ system, status, onClick, isSmall = false }) {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in-progress': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative ${isSmall ? 'scale-90' : ''} ${status !== 'available' ? 'cursor-pointer transform hover:scale-105 transition-transform' : ''}`}
    >
      {/* Desk */}
      <div className={`bg-gray-700 rounded-lg border border-gray-600 shadow-md p-3 flex flex-col items-center justify-center ${status !== 'available' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ' + getStatusColor(status) : ''}`}>
        <div className="bg-gray-800 p-2 rounded-md mb-2">
          <Laptop size={isSmall ? 16 : 22} className="text-purple-400" />
        </div>
        <span className={`font-mono text-xs ${status !== 'available' ? 'text-black font-medium' : 'text-gray-400'}`}>
          {system.id}
        </span>
      </div>
      
      {/* Status indicator */}
      {status !== 'available' && (
        <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${getStatusColor(status)} border-2 border-gray-800 shadow-lg`}></div>
      )}
    </div>
  );
}

// TicketList Component
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
      <span className={`text-xs px-2 py-1 rounded ${colors[priority?.toLowerCase()] || colors.low} font-medium`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase() || 'Low'}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center">
          <AlertTriangle size={24} className="text-purple-400 mr-3" />
          Support Tickets
        </h2>
        
        {/* Filter buttons */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded ${filter === 'open' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Open
          </button>
          <button 
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded ${filter === 'in-progress' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded ${filter === 'resolved' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Resolved
          </button>
        </div>
      </div>
      
      {/* Ticket Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Title</th>
              <th className="py-3 px-4 text-left font-medium">System</th>
              <th className="py-3 px-4 text-left font-medium">Description</th>
              <th className="py-3 px-4 text-left font-medium">Priority</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-left font-medium">Assigned To</th>
              <th className="py-3 px-4 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono text-gray-300">{ticket.title}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="bg-gray-800 p-1 rounded mr-2">
                        <Laptop size={16} className="text-purple-400" />
                      </span>
                      <span className="text-gray-300">{ticket.systemId || ticket.deviceId}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{ticket.description}</td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${ticket.status?.toLowerCase() === 'open' 
                        ? 'bg-red-500 text-white' 
                        : ticket.status?.toLowerCase() === 'in-progress'
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-green-500 text-white'}`
                    }>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {ticket.assignedTo || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  No tickets match your filter criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ tickets }) {
  // Status counts
  const openTickets = tickets.filter(t => t.status?.toLowerCase() === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status?.toLowerCase() === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status?.toLowerCase() === 'resolved').length;

  // Priority distribution
  const highPriority = tickets.filter(t => t.priority?.toLowerCase() === 'high').length;
  const mediumPriority = tickets.filter(t => t.priority?.toLowerCase() === 'medium').length;
  const lowPriority = tickets.filter(t => t.priority?.toLowerCase() === 'low').length;

  // Calculate average resolution time
  const resolvedTicketsList = tickets.filter(t => t.status === 'resolved');
  const avgResolutionTime = resolvedTicketsList.length > 0 
    ? calculateAverageResolutionTime(resolvedTicketsList)
    : "N/A";

  // Recent activity
  const recentActivities = tickets
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map(ticket => ({
      action: getActionFromStatus(ticket.status),
      description: ticket.description,
      time: formatTimeAgo(new Date(ticket.createdAt))
    }));

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center">
        <BarChart size={24} className="text-purple-400 mr-3" />
        Dashboard Overview
      </h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Open Tickets" 
          value={openTickets} 
          icon={<AlertTriangle size={24} />} 
          color="bg-gradient-to-br from-red-600 to-red-800" 
        />
        <StatsCard 
          title="In Progress" 
          value={inProgressTickets} 
          icon={<Clock size={24} />} 
          color="bg-gradient-to-br from-yellow-500 to-yellow-700" 
        />
        <StatsCard 
          title="Resolved" 
          value={resolvedTickets} 
          icon={<Check size={24} />} 
          color="bg-gradient-to-br from-green-500 to-green-700" 
        />
      </div>

      {/* Priority Distribution and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center">
            <Award size={20} className="text-purple-400 mr-2" />
            Ticket Priority Distribution
          </h3>
          <div className="space-y-4">
            <ProgressBar label="High Priority" value={highPriority} total={tickets.length} color="bg-red-500" />
            <ProgressBar label="Medium Priority" value={mediumPriority} total={tickets.length} color="bg-yellow-500" />
            <ProgressBar label="Low Priority" value={lowPriority} total={tickets.length} color="bg-green-500" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-200">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <ActivityItem 
                key={index}
                action={activity.action}
                description={activity.description}
                time={activity.time}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ProgressBar Component
function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-medium text-gray-400">{value} / {total}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// StatsCard Component
function StatsCard({ title, value, icon, color }) {
  return (
    <div className={`rounded-xl p-6 ${color} text-white shadow-lg border border-gray-700`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium opacity-90">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

// MetricCard Component
function MetricCard({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-200 mt-1">{value}</p>
    </div>
  );
}

// ActivityItem Component
function ActivityItem({ action, description, time }) {
  return (
    <div className="flex p-3 border-l-4 border-purple-500 bg-gray-800 rounded-r-lg">
      <div className="ml-3">
        <p className="font-medium text-purple-400">{action}</p>
        <p className="text-sm text-gray-300">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

// TicketDetail Component
function TicketDetail({ ticket, onClose, updateStatus, assignTicket }) {
  const [staffName, setStaffName] = useState('');
  
  const handleAssign = () => {
    if (staffName.trim()) {
      assignTicket(ticket.id, staffName);
      setStaffName('');
    }
  };
  
  return (
    <div className="w-96 bg-gray-900 border-l border-gray-700 shadow-2xl overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-100">Ticket Details</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Ticket ID and System ID */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Ticket ID</p>
              <p className="text-lg font-mono font-bold text-gray-100">#{ticket.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">System ID</p>
              <p className="text-lg font-mono font-bold text-gray-100">{ticket.systemId}</p>
            </div>
          </div>
        </div>
        
        {/* Ticket Status */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Status</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => updateStatus(ticket.id, 'open')}
              className={`py-2 px-3 rounded-lg ${
                ticket.status?.toLowerCase() === 'open' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Open
            </button>
            <button 
              onClick={() => updateStatus(ticket.id, 'in-progress')}
              className={`py-2 px-3 rounded-lg ${
                ticket.status?.toLowerCase() === 'in-progress' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              In Progress
            </button>
            <button 
              onClick={() => updateStatus(ticket.id, 'resolved')}
              className={`py-2 px-3 rounded-lg ${
                ticket.status?.toLowerCase() === 'resolved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
        
        {/* Ticket Details */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Description</p>
            <p className="text-gray-200 bg-gray-800 p-3 rounded-lg border border-gray-700">{ticket.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Priority</p>
            <div className={`text-white p-2 rounded-lg font-medium inline-block
              ${ticket.priority === 'high'
                ? 'bg-red-600'
                : ticket.priority === 'medium'
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-green-600'}`
            }>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Floor</p>
            <p className="text-gray-200">{ticket.floor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Created At</p>
            <p className="text-gray-200">{new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Assign Ticket */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Assigned To</p>
          <p className="text-gray-200 mb-3">
            {ticket.assignedTo || 'Not assigned'}
          </p>
          <div className="flex">
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Staff name"
              className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAssign}
              className="bg-purple-600 text-white px-4 rounded-r-lg hover:bg-purple-700"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateAverageResolutionTime(resolvedTickets) {
  const times = resolvedTickets.map(ticket => {
    const created = new Date(ticket.createdAt);
    const resolved = new Date(ticket.resolvedAt || ticket.updatedAt || ticket.createdAt);
    return resolved - created;
  });
  
  const avgTime = times.reduce((acc, time) => acc + time, 0) / times.length;
  return Math.round(avgTime / (1000 * 60 * 60)) + " hours";
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function getActionFromStatus(status) {
  switch(status?.toLowerCase()) {
    case 'resolved': return 'Ticket resolved';
    case 'in-progress': return 'Ticket in progress';
    case 'open': return 'New ticket opened';
    default: return 'Ticket updated';
  }
}
