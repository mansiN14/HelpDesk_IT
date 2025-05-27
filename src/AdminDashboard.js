import React, { useState, useEffect, useMemo } from "react";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, setDoc, query, where, orderBy } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Clock, Users, AlertTriangle, Check, Map, BarChart, Monitor, Cpu, Laptop, Award, Phone, Menu, X, Plus } from 'lucide-react';
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
  workstationRows: 10,
  cabinRows: 2,
  technicalWSRows: 3,
  conferenceRows: 1,
  meetingRows: 2,
  tlRows: 1,
};

const spaceTypes = {
  WORKSTATION: { prefix: 'WS', color: '#e3f2fd', borderColor: '#1976d2', range: 'WS001-WS415', total: 415 },
  MEETING_ROOM: { prefix: 'MR', color: '#f3e5f5', borderColor: '#7b1fa2', range: 'MR01-MR11', total: 11 },
  MD_CABIN: { prefix: 'CB', color: '#fff3e0', borderColor: '#f57c00', range: 'CB01-CB04', total: 4 },
  TECHNICAL_WS: { prefix: 'TWS', color: '#e8f5e8', borderColor: '#388e3c', range: 'TWS01-TWS26', total: 26 },
  CONFERENCE: { prefix: 'CO', color: '#ffebee', borderColor: '#d32f2f', range: 'CO01-CO02', total: 2 },
  TEAM_LEAD: { prefix: 'TL', color: '#f1f8e9', borderColor: '#689f38', range: 'TL01', total: 1 },
  CORRIDOR: { prefix: 'CORRIDOR', color: '#f5f5f5', borderColor: '#bdbdbd' },
  AMENITY: { prefix: 'AMENITY', color: '#fafafa', borderColor: '#9e9e9e' },
  EMPTY: { prefix: 'EMPTY', color: 'transparent', borderColor: 'transparent' }
};


// Layout generator as a hook
function useOfficeLayout(config) {
  return useMemo(() => {
    // ...copy your generateLayout logic here, but use plain JS, not template literals...
    const grid = Array(config.gridHeight).fill(null).map(() =>
      Array(config.gridWidth).fill(null).map(() => ({ type: 'EMPTY', id: null }))
    );

    let wsCounter = 1, mrCounter = 1, mdCounter = 1, twsCounter = 1, coCounter = 1, tlCounter = 1;

    // Corridors
    const mainCorridorRow = Math.floor(config.gridHeight / 2);
    for (let col = 0; col < config.gridWidth; col++) {
      for (let offset = 0; offset < config.aisleWidth; offset++) {
        if (mainCorridorRow + offset < config.gridHeight) {
          grid[mainCorridorRow + offset][col] = { type: 'CORRIDOR', id: 'MAIN_CORRIDOR' };
        }
      }
    }
    const mainCorridorCol = Math.floor(config.gridWidth / 2);
    for (let row = 0; row < config.gridHeight; row++) {
      for (let offset = 0; offset < config.aisleWidth; offset++) {
        if (mainCorridorCol + offset < config.gridWidth) {
          grid[row][mainCorridorCol + offset] = { type: 'CORRIDOR', id: 'MAIN_CORRIDOR' };
        }
      }
    }

    // Amenities
    const amenityPositions = [
      { row: 2, col: 5, id: 'COFFEE_MACHINE' },
      { row: 2, col: config.gridWidth - 6, id: 'TV_65_1' },
      { row: config.gridHeight - 3, col: 8, id: 'TV_65_2' },
    ];
    amenityPositions.forEach(pos => {
      if (pos.row < config.gridHeight && pos.col < config.gridWidth) {
        grid[pos.row][pos.col] = { type: 'AMENITY', id: pos.id };
      }
    });

    // MD Cabins
    const mdPositions = [
      { row: 1, col: 1 },
      { row: 1, col: config.gridWidth - 3 },
      { row: config.gridHeight - 3, col: 1 },
      { row: config.gridHeight - 3, col: config.gridWidth - 3 },
    ];
    mdPositions.slice(0, config.totalMDCabins).forEach(pos => {
      if (grid[pos.row][pos.col].type === 'EMPTY') {
        grid[pos.row][pos.col] = {
          type: 'MD_CABIN',
          id: `${spaceTypes.MD_CABIN.prefix}-${String(mdCounter).padStart(2, '0')}`
        };
        mdCounter++;
      }
    });

    // Conference Rooms
    const conferencePositions = [
      { row: 3, col: 2, width: 3, height: 2 },
      { row: config.gridHeight - 5, col: config.gridWidth - 5, width: 3, height: 2 },
    ];
    conferencePositions.slice(0, config.totalConferenceRooms).forEach(pos => {
      for (let r = pos.row; r < pos.row + pos.height && r < config.gridHeight; r++) {
        for (let c = pos.col; c < pos.col + pos.width && c < config.gridWidth; c++) {
          if (grid[r][c].type === 'EMPTY') {
            grid[r][c] = {
              type: 'CONFERENCE',
              id: `${spaceTypes.CONFERENCE.prefix}-${String(coCounter).padStart(2, '0')}`
            };
          }
        }
      }
      coCounter++;
    });

    // Meeting Rooms
    let mrPlaced = 0;
    for (let row = 0; row < config.gridHeight && mrPlaced < config.totalMeetingRooms; row++) {
      for (let col = 0; col < config.gridWidth && mrPlaced < config.totalMeetingRooms; col++) {
        if (grid[row][col].type === 'EMPTY') {
          const nearCorridor = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
          ].some(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            return newRow >= 0 && newRow < config.gridHeight &&
              newCol >= 0 && newCol < config.gridWidth &&
              grid[newRow][newCol].type === 'CORRIDOR';
          });
          if (nearCorridor && Math.random() > 0.7) {
            grid[row][col] = {
              type: 'MEETING_ROOM',
              id: `${spaceTypes.MEETING_ROOM.prefix}-${String(mrCounter).padStart(2, '0')}`
            };
            mrCounter++;
            mrPlaced++;
          }
        }
      }
    }

    // Team Lead
    let tlPlaced = 0;
    for (let row = 0; row < config.gridHeight && tlPlaced < config.totalTeamLeadTables; row++) {
      for (let col = 0; col < config.gridWidth && tlPlaced < config.totalTeamLeadTables; col++) {
        if (grid[row][col].type === 'EMPTY' && Math.random() > 0.95) {
          grid[row][col] = {
            type: 'TEAM_LEAD',
            id: `${spaceTypes.TEAM_LEAD.prefix}-${String(tlCounter).padStart(2, '0')}`
          };
          tlCounter++;
          tlPlaced++;
        }
      }
    }

    // Technical WS
    let twsPlaced = 0;
    for (let row = 0; row < config.gridHeight && twsPlaced < config.totalTechnicalWS; row++) {
      for (let col = 0; col < config.gridWidth && twsPlaced < config.totalTechnicalWS; col++) {
        if (grid[row][col].type === 'EMPTY') {
          let canPlaceCluster = true;
          const clusterPositions = [];
          for (let r = row; r < row + 2 && r < config.gridHeight; r++) {
            for (let c = col; c < col + 3 && c < config.gridWidth; c++) {
              if (grid[r][c].type !== 'EMPTY') {
                canPlaceCluster = false;
                break;
              }
              clusterPositions.push([r, c]);
            }
            if (!canPlaceCluster) break;
          }
          if (canPlaceCluster && clusterPositions.length >= 4 && Math.random() > 0.8) {
            clusterPositions.slice(0, Math.min(6, config.totalTechnicalWS - twsPlaced)).forEach(([r, c]) => {
              grid[r][c] = {
                type: 'TECHNICAL_WS',
                id: `${spaceTypes.TECHNICAL_WS.prefix}-${String(twsCounter).padStart(2, '0')}`
              };
              twsCounter++;
              twsPlaced++;
            });
          }
        }
      }
    }

    // Workstations
    let wsPlaced = 0;
    for (let row = 0; row < config.gridHeight && wsPlaced < config.totalWorkstations; row++) {
      for (let col = 0; col < config.gridWidth && wsPlaced < config.totalWorkstations; col++) {
        if (grid[row][col].type === 'EMPTY') {
          const clusterPositions = [];
          let canPlaceCluster = true;
          for (let r = row; r < row + 2 && r < config.gridHeight; r++) {
            for (let c = col; c < col + Math.ceil(config.clusterSize / 2) && c < config.gridWidth; c++) {
              if (grid[r][c].type !== 'EMPTY') {
                canPlaceCluster = false;
                break;
              }
              clusterPositions.push([r, c]);
            }
            if (!canPlaceCluster) break;
          }
          if (canPlaceCluster && clusterPositions.length >= 2) {
            clusterPositions.slice(0, Math.min(config.clusterSize, config.totalWorkstations - wsPlaced)).forEach(([r, c]) => {
              grid[r][c] = {
                type: 'WORKSTATION',
                id: `${spaceTypes.WORKSTATION.prefix}-${String(wsCounter).padStart(3, '0')}`
              };
              wsCounter++;
              wsPlaced++;
            });
          } else if (grid[row][col].type === 'EMPTY' && wsPlaced < config.totalWorkstations) {
            grid[row][col] = {
              type: 'WORKSTATION',
              id: `${spaceTypes.WORKSTATION.prefix}-${String(wsCounter).padStart(3, '0')}`
            };
            wsCounter++;
            wsPlaced++;
          }
        }
      }
    }
    return grid;
  }, [config]);
}

// OfficeDesk Component - Vertical Rectangular with Transparent Blue, Glowing Border, and Centered ID
const OfficeDesk = ({ system, status, onClick }) => {
  const baseClasses = "relative flex flex-col items-center justify-center rounded-md border-2 cursor-pointer transition-all duration-200 overflow-hidden";
  // Decrease size of seats further
  const sizeClasses = "w-10 h-14 md:w-16 md:h-24"; // Further adjusted size

  // Transparent blue background and blue glowing border
  const appearanceClasses = "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/40";

  const statusColor = status === 'open' ? 'bg-red-500' : status === 'in-progress' ? 'bg-yellow-500' : 'bg-green-500';
  const statusText = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();

  return (
    <div
      className={`${baseClasses} ${sizeClasses} ${appearanceClasses} ${status === 'available' ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      {/* System ID - Centered */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-mono text-center px-0.5 leading-tight">
        {system?.id || 'N/A'}
      </div>

      {/* Status Indicator / Priority - Bottom */}
      {status !== 'available' && (
        <div className="absolute bottom-0 left-0 right-0 text-white text-[6px] sm:text-[8px] font-bold text-center py-0.5 leading-tight bg-gray-700/80">
          <span className={`px-1 py-0.5 rounded-sm ${statusColor}`}>
            {statusText || 'Low'}
          </span>
        </div>
      )}

      {/* Overlay for hover effect - Keep the blue overlay */}
      {status === 'available' && (
         <div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-20 transition-opacity">
         </div>
      )}
    </div>
  );
};

// Main Admin App Component
export default function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFloor, setCurrentFloor] = useState('S1'); // Keep this one
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState(defaultLayoutConfig);
  const [floors, setFloors] = useState(['S1']);
  const [showCreateFloor, setShowCreateFloor] = useState(false);
  const [newFloorConfig, setNewFloorConfig] = useState({
    floorName: '',
    ...defaultLayoutConfig
  });
  const officeLayout = useOfficeLayout(layoutConfig);

  // Fetch all tickets for admin
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const ticketsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt ? data.createdAt.toDate().toLocaleString() : new Date().toLocaleString();
          return {
            id: doc.id,
            ...data,
            createdAt: createdAt
          };
        });
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

  // Add this component inside AdminDashboard component
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFloorConfig(prevConfig => ({
      ...prevConfig,
      [name]: name === 'floorName' ? value : parseInt(value) || 0,
    }));
  };


  const CreateFloorModal = () => {
    if (!showCreateFloor) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Create New Floor</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Floor Name</label>
              <input
                type="text"
                name="floorName"
                value={newFloorConfig.floorName}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., F1, S2, Ground Floor, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Workstations</label>
                <input
                  type="number"
                  name="totalWorkstations"
                  value={newFloorConfig.totalWorkstations}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Meeting Rooms</label>
                <input
                  type="number"
                  name="totalMeetingRooms"
                  value={newFloorConfig.totalMeetingRooms}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cabins</label>
                <input
                  type="number"
                  name="totalMDCabins"
                  value={newFloorConfig.totalMDCabins}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Conference Rooms</label>
                <input
                  type="number"
                  name="totalConferenceRooms"
                  value={newFloorConfig.totalConferenceRooms}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateFloor(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFloor}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Floor
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add this function to handle floor creation
  const handleCreateFloor = async () => {
    console.log("handleCreateFloor called"); // Debug log
    if (!newFloorConfig.floorName) {
      console.log("Floor name is missing"); // Debug log
      return;
    }

    try {
      const floorRef = doc(db, "floors", newFloorConfig.floorName);
      await setDoc(floorRef, {
        ...newFloorConfig,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setFloors(prev => [...prev, newFloorConfig.floorName]);
      setCurrentFloor(newFloorConfig.floorName);
      setLayoutConfig(prev => ({
        ...prev,
        [newFloorConfig.floorName]: newFloorConfig
      }));

      setShowCreateFloor(false);
      setNewFloorConfig({
        floorName: '',
        ...defaultLayoutConfig
      });
    } catch (error) {
      console.error("Error creating floor:", error);
    }
  };

  const saveFloorConfig = async (floorName, config) => {
    try {
      const floorRef = doc(db, "floors", floorName);
      await setDoc(floorRef, {
        ...config,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error saving floor config:", error);
    }
  };

  const fetchFloors = async () => {
    try {
      const floorsCollection = collection(db, "floors");
      const floorsSnapshot = await getDocs(floorsCollection);
      const floorsData = {};
      const floorNames = ['S1'];

      floorsSnapshot.forEach(doc => {
        floorsData[doc.id] = doc.data();
        if (!floorNames.includes(doc.id)) {
          floorNames.push(doc.id);
        }
      });

      setFloors(floorNames);
      setLayoutConfig(prevConfig => ({
        ...prevConfig,
        ...floorsData
      }));
    } catch (error) {
      console.error("Error fetching floors:", error);
    }
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    fetchFloors();
  }, []);

  // Modify the FloorView section in the return statement
  // Find this part in your existing code:
  {
    activeTab === 'map' && (
      <FloorView
        tickets={tickets}
        officeLayout={officeLayout}
        setSelectedTicket={handleTicketSelect}
        layoutConfig={layoutConfig}
        setLayoutConfig={setLayoutConfig}
      />
    )
  }

  // Replace it with:
  {
    activeTab === 'map' && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={currentFloor}
              onChange={(e) => setCurrentFloor(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              {floors.map(floor => (
                <option key={floor} value={floor}>{floor}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateFloor(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={16} />
              <span>Create Floor</span>
            </button>
          </div>
        </div>
        <FloorView
          tickets={tickets}
          officeLayout={officeLayout}
          setSelectedTicket={handleTicketSelect}
          layoutConfig={layoutConfig}
          setLayoutConfig={setLayoutConfig}
          currentFloor={currentFloor}
        />
        {showCreateFloor && <CreateFloorModal />}
      </div>
    )
  }
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <select
                      value={currentFloor}
                      onChange={(e) => setCurrentFloor(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {floors.map(floor => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCreateFloor(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus size={16} />
                      <span>Create Floor</span>
                    </button>
                  </div>
                </div>
                <FloorView
                  tickets={tickets}
                  officeLayout={officeLayout}
                  setSelectedTicket={handleTicketSelect}
                  layoutConfig={layoutConfig}
                  setLayoutConfig={setLayoutConfig}
                  currentFloor={currentFloor}
                />
                {showCreateFloor && <CreateFloorModal />}
              </div>
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
                  className={`flex items-center w-full p-2 md:p-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
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
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-medium"></span>
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

// FloorView Component - Updated with proper prop handling
function FloorView({ tickets, officeLayout, setSelectedTicket, layoutConfig, setLayoutConfig, currentFloor }) {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');

  // Section filters configuration
  const sectionFilters = [
      { type: 'WORKSTATION', label: 'Workstations', icon: <Laptop size={16} className="text-blue-400" /> },
      { type: 'MD_CABIN', label: 'Cabins', icon: <Users size={16} className="text-orange-400" /> },
      { type: 'TECHNICAL_WS', label: 'Tech Workstations', icon: <Cpu size={16} className="text-green-400" /> },
      { type: 'CONFERENCE', label: 'Conference', icon: <Phone size={16} className="text-red-400" /> },
      { type: 'MEETING_ROOM', label: 'Meeting Rooms', icon: <Clock size={16} className="text-purple-400" /> },
      { type: 'TEAM_LEAD', label: 'Team Lead', icon: <Award size={16} className="text-yellow-400" /> }
  ];

  // Function to filter systems by section
  const isSectionVisible = (system) => {
    return selectedSection === 'all' || system.type === selectedSection;
  };

  // Add this helper function inside FloorView, before the return statement
  // This function now organizes pairs into columns with a specific number of pairs per column
  const organizeLayoutByImage = (systems, pairsPerColumn = 4) => {
    const filteredSystems = systems.filter(system =>
      system.id && system.type !== 'EMPTY' && system.type !== 'CORRIDOR' && isSectionVisible(system)
    );

    const pairs = [];
    // Group filtered systems into horizontal pairs
    for (let i = 0; i < filteredSystems.length; i += 2) {
      pairs.push([filteredSystems[i], filteredSystems[i + 1] || null]); // Pair systems, handle odd number
    }

    // Distribute pairs into columns, with a fixed number of pairs per column
    const columns = [];
    let currentColumn = [];
    pairs.forEach((pair, index) => {
        currentColumn.push(pair);
        if (currentColumn.length === pairsPerColumn || index === pairs.length - 1) {
            columns.push(currentColumn);
            currentColumn = [];
        }
    });

    return columns; // Array of columns, each (except possibly the last) has pairsPerColumn pairs
  };

  // Generated connection pairs with sample device IDs
  const connectionPairs = [
    [
      { left: 'WS-001', right: 'WS-002' }, { left: 'WS-003', right: 'WS-004' }, { left: 'WS-005', right: 'WS-006' },
      { left: 'WS-007', right: 'WS-008' }, { left: 'WS-009', right: 'WS-010' }, { left: 'WS-011', right: 'WS-012' },
      { left: 'WS-013', right: 'WS-014' }
    ],
    [
      { left: 'WS-015', right: 'WS-016' }, { left: 'WS-017', right: 'WS-018' }, { left: 'WS-019', right: 'WS-020' },
      { left: 'WS-021', right: 'WS-022' }, { left: 'WS-023', right: 'WS-024' }, { left: 'WS-025', right: 'WS-026' },
      { left: 'WS-027', right: 'WS-028' }
    ],
    [
      { left: 'TWS-01', right: 'TWS-02' }, { left: 'TWS-03', right: 'TWS-04' }, { left: 'TWS-05', right: 'TWS-06' },
      { left: 'TWS-07', right: 'TWS-08' }, { left: 'TWS-09', right: 'TWS-10' }, { left: 'TWS-11', right: 'CB-01' },
      { left: 'CB-02', right: 'CB-03' }
    ],
    [
      { left: 'CB-04', right: 'CO-01' }, { left: 'CO-02', right: 'TL-01' }, { left: 'WS-029', right: 'WS-030' },
      { left: 'WS-031', right: 'WS-032' }, { left: 'WS-033', right: 'WS-034' }, { left: 'WS-035', right: 'WS-036' },
      { left: 'WS-037', right: 'WS-038' }
    ]
  ];

  const handleNumberClick = (numberId, number) => {
    setSelectedNumbers(prev =>
      prev.includes(numberId)
        ? prev.filter(id => id !== numberId)
        : [...prev, numberId]
    );
  };

  // Handle system click to select ticket
  const handleSystemClick = (system) => {
    const ticket = tickets.find(t => t.systemId === system.id);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

    return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-4 sm:p-8">
        {/* Section Filters - Responsive */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base ${selectedSection === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Map size={16} className="text-blue-400" />
              <span>All Sections</span>
            </button>
            {sectionFilters.map((filter) => (
              <button
                key={filter.type}
                onClick={() => setSelectedSection(filter.type)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base ${selectedSection === filter.type ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {filter.icon}
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floor Layout - Render Columns with Paired Systems */}
        {/* Use Flexbox to arrange columns horizontally with wrapping */}
        <div className="flex flex-wrap justify-center gap-x-6 sm:gap-x-10 md:gap-x-14 py-4"> {/* Reduced horizontal gaps */}
          {organizeLayoutByImage(officeLayout.flat(), 4).map((column, colIndex) => (
            // Container for each column, stacking pairs vertically
            <div key={`column-${colIndex}`} className="flex flex-col items-center gap-y-4"> {/* Vertical gap between pairs within a column */}
              {/* Map over the pairs within this column */}
              {column.map((pair, pairIndex) => (
                // Container for each horizontal pair
                <div key={`pair-${colIndex}-${pairIndex}`} className="flex items-center justify-center gap-0.5 sm:gap-1"> {/* Reduced gap between systems in a pair */}
                  {/* Render the first system in the pair */}
                  {pair[0] && (
                    <OfficeDesk
                      key={`system-${colIndex}-${pairIndex}-0`}
                      system={pair[0]}
                      status={tickets.find(t => t.systemId === pair[0].id)?.status || 'available'}
                      onClick={() => handleSystemClick(pair[0])}
                    />
                  )}

                  {/* Horizontal connection indicator between pair */}
                  {pair.length === 2 && pair[1] && (
                    <div className="flex items-center justify-center w-6"> {/* Adjust width as needed */}
                      <span className="text-blue-400 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">H</span>
                    </div>
                  )}

                  {/* Render the second system in the pair if it exists */}
                  {pair.length === 2 && pair[1] && (
                    <OfficeDesk
                      key={`system-${colIndex}-${pairIndex}-1`}
                      system={pair[1]}
                      status={tickets.find(t => t.systemId === pair[1].id)?.status || 'available'}
                      onClick={() => handleSystemClick(pair[1])}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ticket List Component - Updated for responsiveness
function TicketList({ tickets, setSelectedTicket }) {
  const [filter, setFilter] = useState('all');

  const filteredTickets = filter === 'all'
    ? tickets
    : tickets.filter(ticket => ticket.status?.toLowerCase() === filter.toLowerCase());

  // Priority badge component
    const colors = {
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white'
    };

  const PriorityBadge = ({ priority }) => {
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
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${filter === 'open' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${filter === 'in-progress' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-gray-300'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${filter === 'resolved' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
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
                  <span className={`text-xs px-2 py-1 rounded font-medium ${ticket.status?.toLowerCase() === 'open' ? 'bg-red-500 text-white' :
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
    <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 border-l border-gray-700 shadow-lg ${isMobile ? 'fixed inset-0 z-50' : 'w-72 md:w-80 lg:w-96'
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === 'open'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  Open
                </button>
                <button
                  onClick={() => updateStatus(ticket.id, 'in-progress')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === 'in-progress'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(ticket.id, 'resolved')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === 'resolved'
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
              <div className={`py-1 px-3 rounded-full inline-block text-xs font-medium ${ticket.priority === 'high' ? 'bg-red-500 text-white' :
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
                  className={`bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium ${!assignee || assignee === ticket.assignedTo
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
              <div className={`mt-1 rounded-full w-3 h-3 flex-shrink-0 ${ticket.status === 'open' ? 'bg-red-500' :
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
          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#FFFFFF' }}
          itemStyle={{ color: '#FFFFFF' }}
          labelStyle={{ color: '#FFFFFF' }}
        />
        <Legend
          wrapperStyle={{
            color: '#FFFFFF',
            fontSize: '1.1rem',
            padding: '8px 0',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
          iconSize={22}
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

  // Custom legend renderer for bigger colored boxes and white text
  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <div
        className="flex flex-wrap justify-center gap-4 mt-2 "
        style={{ width: '100%' }}
      >
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center mx-2 my-1">
            <span
              style={{
                display: 'inline-block',
                width: 28,
                height: 18,
                borderRadius: 4,
                background: entry.color,
                marginRight: 10,
                border: '2px solid #fff',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ color: '#ffff', fontSize: '1.1rem', fontWeight: 600 }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

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
          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#FFFFFF' }}

          itemStyle={{ color: '#FFF' }}
          labelStyle={{ color: '#FFF' }}
        />
        <Legend
          content={renderCustomLegend}
        />
      </PieChart>
    </div>
  );
}
