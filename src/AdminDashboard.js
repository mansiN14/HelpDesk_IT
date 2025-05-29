import React, { useState, useEffect, useMemo } from "react";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, setDoc, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Clock, Users, AlertTriangle, Check, Map, BarChart, Monitor, Cpu, Laptop, Award, Phone, Menu, X, Plus, Info } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ResponsiveContainer } from 'recharts';

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
  totalWorkstations: 412,
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
  WORKSTATION: { prefix: 'WS', color: '#e3f2fd', borderColor: '#1976d2', range: 'WS001-WS412', total: 412 },
  MEETING_ROOM: { prefix: 'MR', color: '#f3e5f5', borderColor: '#7b1fa2', range: 'MR01-MR11', total: 11 },
  MD_CABIN: { prefix: 'CB', color: '#fff3e0', borderColor: '#f57c00', range: 'CB01-CB04', total: 4 },
  TECHNICAL_WS: { prefix: 'TWS', color: '#e8f5e8', borderColor: '#388e3c', range: 'TWS01-TWS26', total: 26 },
  CONFERENCE: { prefix: 'CO', color: '#ffebee', borderColor: '#d32f2f', range: 'CO01-CO02', total: 2 },
  TEAM_LEAD: { prefix: 'TL', color: '#f1f8e9', borderColor: '#689f38', range: 'TL01', total: 1 },
 };


// Layout generator as a hook
function useOfficeLayout(config) {
  return useMemo(() => {
    const grid = Array(config.gridHeight).fill(null).map(() =>
      Array(config.gridWidth).fill(null).map(() => ({ type: 'EMPTY', id: null }))
    );

    // Use config values instead of hardcoded numbers
    let wsCounter = 1, wsPlaced = 0;
    for (let row = 0; row < config.gridHeight && wsPlaced < config.totalWorkstations; row++) {
      for (let col = 0; col < config.gridWidth && wsPlaced < config.totalWorkstations; col++) {
        if (grid[row][col].type === 'EMPTY') {
          grid[row][col] = {
            type: 'WORKSTATION',
            id: `WS-${String(wsCounter).padStart(3, '0')}`
          };
          wsCounter++;
          wsPlaced++;
        }
      }
    }
    // Meeting Rooms
    let mrCounter = 1, mrPlaced = 0;
    for (let row = 0; row < config.gridHeight && mrPlaced < config.totalMeetingRooms; row++) {
      for (let col = 0; col < config.gridWidth && mrPlaced < config.totalMeetingRooms; col++) {
        if (grid[row][col].type === 'EMPTY') {
          grid[row][col] = {
            type: 'MEETING_ROOM',
            id: `MR-${String(mrCounter).padStart(2, '0')}`
          };
          mrCounter++;
          mrPlaced++;
        }
      }
    }

    // MD Cabins
    let mdCounter = 1, mdPlaced = 0;
    for (let row = 0; row < config.gridHeight && mdPlaced < config.totalMDCabins; row++) {
      for (let col = 0; col < config.gridWidth && mdPlaced < config.totalMDCabins; col++) {
        if (grid[row][col].type === 'EMPTY') {
          grid[row][col] = {
            type: 'MD_CABIN',
            id: `CB-${String(mdCounter).padStart(2, '0')}`
          };
          mdCounter++;
          mdPlaced++;
        }
      }
    }

    // Technical Workstations
    let twsCounter = 1, twsPlaced = 0;
    for (let row = 0; row < config.gridHeight && twsPlaced < config.totalTechnicalWS; row++) {
      for (let col = 0; col < config.gridWidth && twsPlaced < config.totalTechnicalWS; col++) {
        if (grid[row][col].type === 'EMPTY') {
          grid[row][col] = {
            type: 'TECHNICAL_WS',
            id: `TWS-${String(twsCounter).padStart(2, '0')}`
          };
          twsCounter++;
          twsPlaced++;
        }
      }
    }

    // Conference Rooms
    let coCounter = 1, coPlaced = 0;
    for (let row = 0; row < config.gridHeight && coPlaced < config.totalConferenceRooms; row++) {
      for (let col = 0; col < config.gridWidth && coPlaced < config.totalConferenceRooms; col++) {
        if (grid[row][col].type === 'EMPTY') {
          grid[row][col] = {
            type: 'CONFERENCE',
            id: `CO-${String(coCounter).padStart(2, '0')}`
          };
          coCounter++;
          coPlaced++;
        }
      }
    }

    // Team Lead Tables
    let tlCounter = 1, tlPlaced = 0;
    for (let row = 0; row < config.gridHeight && tlPlaced < config.totalTeamLeadTables; row++) {
      for (let col = 0; col < config.gridWidth && tlPlaced < config.totalTeamLeadTables; col++) {
        if (grid[row][col].type === 'EMPTY') {
          grid[row][col] = {
            type: 'TEAM_LEAD',
            id: `TL-${String(tlCounter).padStart(2, '0')}`
          };
          tlCounter++;
          tlPlaced++;
        }
      }
    }

    return grid;
  }, [config]);
}

// OfficeDesk Component - Vertical Rectangular with Transparent purple, Glowing Border, and Centered ID
const OfficeDesk = ({ system, status, onClick }) => {
  const baseClasses = "relative flex flex-col items-center justify-center rounded-md border-2 transition-all duration-200 overflow-hidden";
  const sizeClasses = "w-10 h-14 md:w-16 md:h-24";

  // Get the appropriate background color based on status
  const getStatusBackground = () => {
    switch (status) {
      case 'open':
        return 'bg-red-500/20 border-red-500 cursor-pointer hover:scale-105';
      case 'in-progress':
        return 'bg-yellow-500/20 border-yellow-500 cursor-pointer';
      case 'resolved':
        return 'bg-purple-500/20 border-purple-500 cursor-pointer';
      default:
        return 'bg-purple-500/20 border-purple-500 cursor-pointer';
    }
  };

  const appearanceClasses = getStatusBackground();
  const statusColor = status === 'open' ? 'bg-red-500' : status === 'in-progress' ? 'bg-yellow-500' : 'bg-purple-500';
  const statusText = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();

  const handleClick = () => {
    if (status !== '') {
      onClick();
    }
  };

  return (
    <div
      className={`${baseClasses} ${sizeClasses} ${appearanceClasses}`}
      onClick={handleClick}
    >
      {/* System ID - Centered */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-mono text-center px-0.5 leading-tight">
        {system?.id || 'N/A'}
      </div>

      {/* Status Indicator / Priority - Bottom - Only show for open and in-progress */}
      {status !== 'available' && status !== 'resolved' && (
        <div className="absolute bottom-0 left-0 right-0 text-white text-[6px] sm:text-[8px] font-bold text-center py-0.5 leading-tight bg-gray-700/80">
          <span className={`px-1 py-0.5 rounded-sm ${statusColor}`}>
            {statusText || 'Low'}
          </span>
        </div>
      )}

      {/* Overlay for hover effect - Only for open tickets */}
      {status === 'open' && (
         <div className="absolute inset-0 bg-red-500 opacity-0 hover:opacity-20 transition-opacity">
         </div>
      )}
    </div>
  );
};

// Chart Components
function TicketTrendsChart({ data }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6'
            }}
            labelStyle={{ color: '#9CA3AF' }}
            formatter={(value, name) => {
              const formattedName = name === 'open' ? 'Open' : 
                                 name === 'inProgress' ? 'In Progress' : 
                                 'Resolved';
              return [value, formattedName];
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => {
              return value === 'open' ? 'Open' : 
                     value === 'inProgress' ? 'In Progress' : 
                     'Resolved';
            }}
          />
          <Line 
            type="monotone" 
            dataKey="open" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="inProgress" 
            stroke="#F59E0B" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PriorityDistribution({ high, medium, low }) {
  const data = [
    { name: 'High', value: high, color: '#EF4444' },
    { name: 'Medium', value: medium, color: '#F59E0B' },
    { name: 'Low', value: low, color: '#10B981' }
  ];

  // Calculate total for percentage
  const total = high + medium + low;

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6'
            }}
            formatter={(value, name) => {
              const percentage = ((value / total) * 100).toFixed(1);
              return [`${value} (${percentage}%)`, name];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              const percentage = ((entry.payload.value / total) * 100).toFixed(1);
              return (
                <span className="text-gray-300 text-sm">
                  {value} ({percentage}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {total === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No priority data available</p>
        </div>
      )}
    </div>
  );
}

// Dashboard Component - Updated for better responsiveness
function Dashboard({ tickets }) {
  // Calculate summary statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  // Calculate ticket metrics by priority
  const highPriorityTickets = tickets.filter(t => t.priority?.toLowerCase() === 'high').length;
  const mediumPriorityTickets = tickets.filter(t => t.priority?.toLowerCase() === 'medium').length;
  const lowPriorityTickets = tickets.filter(t => t.priority?.toLowerCase() === 'low').length;

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

  // Priority distribution data
  const priorityData = [
    { name: 'High', value: highPriorityTickets, color: '#EF4444' },
    { name: 'Medium', value: mediumPriorityTickets, color: '#F59E0B' },
    { name: 'Low', value: lowPriorityTickets, color: '#10B981' }
  ];

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-100 flex items-center">
        <BarChart size={20} className="text-purple-400 mr-2 md:mr-3" />
        Dashboard Overview
      </h2>

      {/* Top stats cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="h-[300px] sm:h-[400px]">
            <TicketTrendsChart data={ticketTrend} />
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-white mb-4">Priority Distribution</h3>
          <div className="h-[300px] sm:h-[400px]">
            <PriorityDistribution
              high={highPriorityTickets}
              medium={mediumPriorityTickets}
              low={lowPriorityTickets}
            />
          </div>
          {/* Add priority distribution summary */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-red-500/20 rounded-lg p-2 text-center">
              <div className="text-red-400 font-medium">{highPriorityTickets}</div>
              <div className="text-xs text-gray-400">High</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-2 text-center">
              <div className="text-yellow-400 font-medium">{mediumPriorityTickets}</div>
              <div className="text-xs text-gray-400">Medium</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-2 text-center">
              <div className="text-green-400 font-medium">{lowPriorityTickets}</div>
              <div className="text-xs text-gray-400">Low</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floor statistics table - Responsive */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md overflow-x-auto">
        <h3 className="text-lg font-medium text-white mb-4">Floor Statistics</h3>
        <div className="min-w-[600px]">
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

      {/* Recent activity section - Responsive */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {tickets.slice(0, 5).map((ticket, index) => (
            <div key={index} className="flex items-start bg-gray-900 p-3 rounded-lg">
              <div className={`mt-1 rounded-full w-3 h-3 flex-shrink-0 ${ticket.status === 'open' ? 'bg-red-500' :
                  ticket.status === 'in-progress' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-xs text-gray-400">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-200 truncate">
                  {ticket.status === 'open' ? 'New ticket opened' :
                    ticket.status === 'in-progress' ? 'Ticket assigned to ' + (ticket.assignedTo || 'staff') :
                      'Ticket resolved'} - {ticket.deviceId || ticket.systemId}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">{ticket.issue}</p>
              </div>
            </div>
          ))}
        </div>
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
    <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 border-l border-gray-700 shadow-lg ${isMobile ? 'fixed inset-0 z-50' : 'w-72 md:w-80 lg:w-96'}`}>
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
              <p className="text-gray-200">{ticket.description || ticket.issue || 'No description provided'}</p>
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

// Main Admin App Component
export default function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFloor, setCurrentFloor] = useState('S1');
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState({
    S1: {
      ...defaultLayoutConfig,
      totalWorkstations: 412,
      totalMeetingRooms: 11,
      totalMDCabins: 6,
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
      spaceTypes: {
        WORKSTATION: { prefix: 'WS', color: '#e3f2fd', borderColor: '#1976d2', range: 'WS001-WS412', total: 412 },
        MEETING_ROOM: { prefix: 'MR', color: '#f3e5f5', borderColor: '#7b1fa2', range: 'MR01-MR11', total: 11 },
        MD_CABIN: { prefix: 'CB', color: '#fff3e0', borderColor: '#f57c00', range: 'CB01-CB06', total: 6 },
        TECHNICAL_WS: { prefix: 'TWS', color: '#e8f5e8', borderColor: '#388e3c', range: 'TWS01-TWS26', total: 26 },
        CONFERENCE: { prefix: 'CO', color: '#ffebee', borderColor: '#d32f2f', range: 'CO01-CO02', total: 2 },
        TEAM_LEAD: { prefix: 'TL', color: '#f1f8e9', borderColor: '#689f38', range: 'TL01', total: 1 },
      }
    }
  });
  const [floors, setFloors] = useState(['S1']);
  const [showCreateFloor, setShowCreateFloor] = useState(false);
  const [newFloorConfig, setNewFloorConfig] = useState({
    floorName: '',
    ...defaultLayoutConfig
  });

  // Get the current floor's layout configuration
  const currentFloorConfig = layoutConfig[currentFloor] || layoutConfig['S1'];
  const officeLayout = useOfficeLayout(currentFloorConfig);

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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Technical Workstations</label>
                <input
                  type="number"
                  name="totalTechnicalWS"
                  value={newFloorConfig.totalTechnicalWS}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Team Lead Tables</label>
                <input
                  type="number"
                  name="totalTeamLeadTables"
                  value={newFloorConfig.totalTeamLeadTables}
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
    if (!newFloorConfig.floorName) return;

    try {
      // Use the values from newFloorConfig, not hardcoded ones
      const newConfig = {
        ...newFloorConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
        spaceTypes: {
          WORKSTATION: { prefix: 'WS', color: '#e3f2fd', borderColor: '#1976d2', range: `WS001-WS${newFloorConfig.totalWorkstations}`, total: newFloorConfig.totalWorkstations },
          MEETING_ROOM: { prefix: 'MR', color: '#f3e5f5', borderColor: '#7b1fa2', range: `MR01-MR${newFloorConfig.totalMeetingRooms}`, total: newFloorConfig.totalMeetingRooms },
          MD_CABIN: { prefix: 'CB', color: '#fff3e0', borderColor: '#f57c00', range: `CB01-CB${String(newFloorConfig.totalMDCabins).padStart(2, '0')}`, total: newFloorConfig.totalMDCabins },
          TECHNICAL_WS: { prefix: 'TWS', color: '#e8f5e8', borderColor: '#388e3c', range: `TWS01-TWS${newFloorConfig.totalTechnicalWS}`, total: newFloorConfig.totalTechnicalWS },
          CONFERENCE: { prefix: 'CO', color: '#ffebee', borderColor: '#d32f2f', range: `CO01-CO${String(newFloorConfig.totalConferenceRooms).padStart(2, '0')}`, total: newFloorConfig.totalConferenceRooms },
          TEAM_LEAD: { prefix: 'TL', color: '#f1f8e9', borderColor: '#689f38', range: `TL01`, total: newFloorConfig.totalTeamLeadTables }
        }
      };

      const floorRef = doc(db, "floors", newFloorConfig.floorName);
      await setDoc(floorRef, newConfig);

      setFloors(prev => [...prev, newFloorConfig.floorName]);
      setCurrentFloor(newFloorConfig.floorName);
      setLayoutConfig(prev => ({
        ...prev,
        [newFloorConfig.floorName]: newConfig
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
      const floorNames = [];

      // Always add S1 as the default floor if not present in Firestore
      floorsData['S1'] = {
        ...defaultLayoutConfig,
        spaceTypes: spaceTypes
      };
      floorNames.push('S1');

      floorsSnapshot.forEach(doc => {
        const floorData = doc.data();
        floorsData[doc.id] = {
          ...floorData,
          spaceTypes: floorData.spaceTypes || spaceTypes
        };
        if (!floorNames.includes(doc.id)) {
          floorNames.push(doc.id);
        }
      });

      floorNames.sort();
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select
              value={currentFloor}
              onChange={(e) => setCurrentFloor(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              {floors.map(floor => (
                <option key={floor} value={floor}>{floor}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateFloor(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <select
                      value={currentFloor}
                      onChange={(e) => setCurrentFloor(e.target.value)}
                      className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {floors.map(floor => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCreateFloor(true)}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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

// Header Component - Updated with better mobile responsiveness
function Header({ user, onLogout, toggleSidebar }) {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-100 p-2 sm:p-4 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
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
        <div className="flex items-center space-x-2 sm:space-x-4">
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
      </div>
    </header>
  );
}

// Sidebar Component - Updated with Recent Activity navigation
function Sidebar({ activeTab, setActiveTab, isOpen, closeSidebar }) {
  const tabs = [
    { id: 'map', label: 'Floor Map', icon: <Map size={20} /> },
    { id: 'tickets', label: 'Tickets', icon: <AlertTriangle size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
  ];

  // Get real-time ticket data from Firebase
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const q = query(
          collection(db, "tickets"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const activities = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            type: 'ticket',
            status: data.status,
            message: `${data.status === 'open' ? 'New ticket opened' :
              data.status === 'in-progress' ? 'Ticket assigned to ' + (data.assignedTo || 'staff') :
                'Ticket resolved'} - ${data.deviceId || data.systemId}`,
            time: data.createdAt?.toDate().toLocaleString() || new Date().toLocaleString(),
            issue: data.issue
          };
        });
        setRecentActivities(activities);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    // Initial fetch
    fetchRecentActivities();

    // Set up real-time listener
    const q = query(
      collection(db, "tickets"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          type: 'ticket',
          status: data.status,
          message: `${data.status === 'open' ? 'New ticket opened' :
            data.status === 'in-progress' ? 'Ticket assigned to ' + (data.assignedTo || 'staff') :
              'Ticket resolved'} - ${data.deviceId || data.systemId}`,
          time: data.createdAt?.toDate().toLocaleString() || new Date().toLocaleString(),
          issue: data.issue
        };
      });
      setRecentActivities(activities);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'ticket':
        return status === 'open' ? <AlertTriangle size={14} className="text-red-400" /> :
               status === 'in-progress' ? <Clock size={14} className="text-yellow-400" /> :
               <Check size={14} className="text-green-400" />;
      case 'system':
        return <Monitor size={14} className="text-blue-400" />;
      default:
        return <Info size={14} className="text-gray-400" />;
    }
  };

  const handleViewAllActivity = () => {
    setActiveTab('dashboard');
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <aside className={`bg-gray-900/40 backdrop-blur-xl text-gray-300 shadow-2xl border-r border-gray-700/30 fixed md:relative z-30 top-0 left-0 h-full transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} w-72`}>
      {/* Mobile Header */}
      <div className="flex justify-between items-center p-4 md:hidden border-b border-gray-700/30 bg-gray-900/30 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">
            IT
          </div>
          <h2 className="text-xl font-semibold text-purple-400">Support Control</h2>
        </div>
        <button onClick={closeSidebar} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700/30 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col items-center p-6 border-b border-gray-700/30 bg-gray-900/30 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl mb-3 shadow-lg shadow-purple-500/20">
          IT
        </div>
        <h2 className="text-xl font-semibold text-purple-400">Support Control</h2>
      </div>

      {/* Navigation */}
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100%-8rem)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/50 hover:scrollbar-thumb-gray-600">
        <style jsx>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: rgba(17, 24, 39, 0.5);
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(55, 65, 81, 0.8);
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgba(75, 85, 99, 0.8);
          }
        `}</style>
        <nav>
          <ul className="space-y-2">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full p-3.5 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600/90 to-purple-500/90 text-white shadow-lg shadow-purple-500/20'
                      : 'hover:bg-gray-800/30 text-gray-300'
                  }`}
                >
                  <span className={`mr-3.5 ${activeTab === tab.id ? 'text-white' : 'text-purple-400'}`}>
                    {React.cloneElement(tab.icon, {
                      className: `transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : 'scale-100'}`,
                      strokeWidth: activeTab === tab.id ? 2.5 : 2
                    })}
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* System Status Card */}
        <div className="mt-8 pt-6 border-t border-gray-700/30">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 shadow-lg">
            <h3 className="font-medium text-sm mb-3 text-purple-400 flex items-center">
              <Monitor size={18} className="mr-2 text-purple-400" strokeWidth={2} />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Active Tickets</span>
                <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-xs font-medium border border-red-500/20 backdrop-blur-sm">
                  {recentActivities.filter(activity => activity.status === 'open').length} Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">System Health</span>
                <span className="flex items-center text-green-400 text-xs font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse shadow-lg shadow-green-400/20"></span>
                  All Systems
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last Update</span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h3 className="font-medium text-sm mb-3 text-purple-400 flex items-center">
            <Clock size={18} className="mr-2 text-purple-400" strokeWidth={2} />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/30 hover:bg-gray-800/50 p-2.5 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 border border-gray-700/30 backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 truncate">{activity.message}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">{activity.time}</p>
                      {activity.issue && (
                        <p className="text-gray-400 text-[10px] mt-0.5 truncate">{activity.issue}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-800/30 p-2.5 rounded-lg text-xs text-gray-400 text-center">
                No recent activity
              </div>
            )}
          </div>
          <button 
            onClick={handleViewAllActivity}
            className="w-full mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center group"
          >
            <span>View All Activity</span>
            <BarChart size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// FloorView Component - Updated with proper prop handling
function FloorView({ tickets, officeLayout, setSelectedTicket, layoutConfig, setLayoutConfig, currentFloor }) {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');

  // Filter tickets for current floor
  const floorTickets = tickets.filter(ticket => ticket.floor === currentFloor);

  // Section filters configuration with consistent dark colors
  const sectionFilters = [
    { type: 'WORKSTATION', label: 'Workstations', icon: <Laptop size={16} className="text-gray-400" /> },
    { type: 'MD_CABIN', label: 'Cabins', icon: <Users size={16} className="text-gray-400" /> },
    { type: 'TECHNICAL_WS', label: 'Tech Workstations', icon: <Cpu size={16} className="text-gray-400" /> },
    { type: 'CONFERENCE', label: 'Conference', icon: <Phone size={16} className="text-gray-400" /> },
    { type: 'MEETING_ROOM', label: 'Meeting Rooms', icon: <Clock size={16} className="text-gray-400" /> },
    { type: 'TEAM_LEAD', label: 'Team Lead', icon: <Award size={16} className="text-gray-400" /> }
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

    // Group systems by their type
    const groupedSystems = filteredSystems.reduce((acc, system) => {
      const type = system.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(system);
      return acc;
    }, {});

    const columns = [];
    let currentColumn = [];
    let currentPairCount = 0;

    // Process each type of system separately
    Object.entries(groupedSystems).forEach(([type, systems]) => {
      // Add a spacer if we're starting a new type and the current column isn't empty
      if (currentColumn.length > 0) {
        currentColumn.push([null, null]); // Add a spacer pair
        currentPairCount++;
      }

      // Group systems into pairs
      for (let i = 0; i < systems.length; i += 2) {
        const pair = [systems[i], systems[i + 1] || null];
        
        // If we've reached the pairs per column limit, start a new column
        if (currentPairCount >= pairsPerColumn) {
          columns.push(currentColumn);
          currentColumn = [];
          currentPairCount = 0;
        }

        currentColumn.push(pair);
        currentPairCount++;
      }
    });

    // Add the last column if it's not empty
    if (currentColumn.length > 0) {
      columns.push(currentColumn);
    }

    return columns;
  };

  // Generated connection pairs with sample device IDs
  const connectionPairs = [
    [
      { left: 'WS-001', right: 'WS-002' }, { left: 'WS-003', right: 'WS-004' }, { left: 'WS-005', right: 'WS-006' },
      { left: 'WS-007', right: 'WS-008' }, { left: 'WS-009', right: 'WS-010' }, { left: 'WS-011', right: 'WS-012' },
      { left: 'WS-013', right: 'WS-014' }, { left: 'WS-015', right: 'WS-016' }, { left: 'WS-017', right: 'WS-018' }, 
      { left: 'WS-019', right: 'WS-020' }, { left: 'WS-021', right: 'WS-022' }, { left: 'WS-023', right: 'WS-024' }, 
      { left: 'WS-025', right: 'WS-026' }, { left: 'WS-027', right: 'WS-028' }, { left: 'WS-015', right: 'WS-016' },
      { left: 'WS-017', right: 'WS-018' }, { left: 'WS-019', right: 'WS-020' }, { left: 'WS-021', right: 'WS-022' }, 
      { left: 'WS-023', right: 'WS-024' }, { left: 'WS-025', right: 'WS-026' }, { left: 'WS-027', right: 'WS-028' }, 
      { left: 'WS-029', right: 'WS-030' }, { left: 'WS-031', right: 'WS-032' }, { left: 'WS-033', right: 'WS-034' },
      { left: 'WS-035', right: 'WS-036' }, { left: 'WS-037', right: 'WS-038' }, { left: 'WS-039', right: 'WS-040' },
      { left: 'WS-041', right: 'WS-042' }, { left: 'WS-043', right: 'WS-044' }, { left: 'WS-045', right: 'WS-046' },
      { left: 'WS-047', right: 'WS-048' }, { left: 'WS-049', right: 'WS-050' }, { left: 'WS-051', right: 'WS-052' },
      { left: 'WS-053', right: 'WS-054' }, { left: 'WS-055', right: 'WS-056' }, { left: 'WS-057', right: 'WS-058' },
      { left: 'WS-059', right: 'WS-060' }, { left: 'WS-061', right: 'WS-062' }, { left: 'WS-063', right: 'WS-064' },
      { left: 'WS-065', right: 'WS-066' }, { left: 'WS-067', right: 'WS-068' }, { left: 'WS-069', right: 'WS-070' },  
      { left: 'WS-071', right: 'WS-072' }, { left: 'WS-073', right: 'WS-074' }, { left: 'WS-075', right: 'WS-076' },
      { left: 'WS-077', right: 'WS-078' }, { left: 'WS-079', right: 'WS-080' }, { left: 'WS-081', right: 'WS-082' },
      { left: 'WS-083', right: 'WS-084' }, { left: 'WS-085', right: 'WS-086' }, { left: 'WS-087', right: 'WS-088' },
      { left: 'WS-089', right: 'WS-090' }, { left: 'WS-091', right: 'WS-092' }, { left: 'WS-093', right: 'WS-094' },
      { left: 'WS-095', right: 'WS-096' }, { left: 'WS-097', right: 'WS-098' }, { left: 'WS-099', right: 'WS-100' },
      { left: 'WS-101', right: 'WS-102' }, { left: 'WS-103', right: 'WS-104' }, { left: 'WS-105', right: 'WS-106' },
      { left: 'WS-107', right: 'WS-108' }, { left: 'WS-109', right: 'WS-110' }, { left: 'WS-111', right: 'WS-112' },
      { left: 'WS-113', right: 'WS-114' }, { left: 'WS-115', right: 'WS-116' }, { left: 'WS-117', right: 'WS-118' },
      { left: 'WS-119', right: 'WS-120' }, { left: 'WS-121', right: 'WS-122' }, { left: 'WS-123', right: 'WS-124' },
      { left: 'WS-125', right: 'WS-126' }, { left: 'WS-127', right: 'WS-128' }, { left: 'WS-129', right: 'WS-130' },
      { left: 'WS-131', right: 'WS-132' }, { left: 'WS-133', right: 'WS-134' }, { left: 'WS-135', right: 'WS-136' },
      { left: 'WS-137', right: 'WS-138' }, { left: 'WS-139', right: 'WS-140' }, { left: 'WS-141', right: 'WS-142' },
      { left: 'WS-143', right: 'WS-144' }, { left: 'WS-145', right: 'WS-146' }, { left: 'WS-147', right: 'WS-148' },
      { left: 'WS-149', right: 'WS-150' }, { left: 'WS-151', right: 'WS-152' }, { left: 'WS-153', right: 'WS-154' },
      { left: 'WS-155', right: 'WS-156' }, { left: 'WS-157', right: 'WS-158' }, { left: 'WS-159', right: 'WS-160' },
      { left: 'WS-161', right: 'WS-162' }, { left: 'WS-163', right: 'WS-164' }, { left: 'WS-165', right: 'WS-166' },
      { left: 'WS-167', right: 'WS-168' }, { left: 'WS-169', right: 'WS-170' }, { left: 'WS-171', right: 'WS-172' },
      { left: 'WS-173', right: 'WS-174' }, { left: 'WS-175', right: 'WS-176' }, { left: 'WS-177', right: 'WS-178' },
      { left: 'WS-179', right: 'WS-180' }, { left: 'WS-181', right: 'WS-182' }, { left: 'WS-183', right: 'WS-184' },
      { left: 'WS-185', right: 'WS-186' }, { left: 'WS-187', right: 'WS-188' }, { left: 'WS-189', right: 'WS-190' },
      { left: 'WS-191', right: 'WS-192' }, { left: 'WS-193', right: 'WS-194' }, { left: 'WS-195', right: 'WS-196' },
      { left: 'WS-197', right: 'WS-198' }, { left: 'WS-199', right: 'WS-199' }, { left: 'WS-200', right: 'WS-200' },
      { left: 'WS-201', right: 'WS-201' }, { left: 'WS-202', right: 'WS-202' }, { left: 'WS-203', right: 'WS-203' },
      { left: 'WS-204', right: 'WS-204' }, { left: 'WS-205', right: 'WS-205' }, { left: 'WS-206', right: 'WS-206' },
      { left: 'WS-207', right: 'WS-207' }, { left: 'WS-208', right: 'WS-208' }, { left: 'WS-209', right: 'WS-209' },
      { left: 'WS-210', right: 'WS-210' }, { left: 'WS-211', right: 'WS-211' }, { left: 'WS-212', right: 'WS-212' },
      { left: 'WS-213', right: 'WS-213' }, { left: 'WS-214', right: 'WS-214' }, { left: 'WS-215', right: 'WS-215' },
      { left: 'WS-216', right: 'WS-216' }, { left: 'WS-217', right: 'WS-217' }, { left: 'WS-218', right: 'WS-218' },
      { left: 'WS-219', right: 'WS-219' }, { left: 'WS-220', right: 'WS-220' }, { left: 'WS-221', right: 'WS-221' },
      { left: 'WS-222', right: 'WS-222' }, { left: 'WS-223', right: 'WS-223' }, { left: 'WS-224', right: 'WS-224' },
      { left: 'WS-225', right: 'WS-225' }, { left: 'WS-226', right: 'WS-226' }, { left: 'WS-227', right: 'WS-227' },
      { left: 'WS-228', right: 'WS-228' }, { left: 'WS-229', right: 'WS-229' }, { left: 'WS-230', right: 'WS-230' },
      { left: 'WS-231', right: 'WS-231' }, { left: 'WS-232', right: 'WS-232' }, { left: 'WS-233', right: 'WS-233' },
      { left: 'WS-234', right: 'WS-234' }, { left: 'WS-235', right: 'WS-235' }, { left: 'WS-236', right: 'WS-236' },
      { left: 'WS-237', right: 'WS-237' }, { left: 'WS-238', right: 'WS-238' }, { left: 'WS-239', right: 'WS-239' },
      { left: 'WS-240', right: 'WS-240' }, { left: 'WS-241', right: 'WS-241' }, { left: 'WS-242', right: 'WS-242' },
      { left: 'WS-243', right: 'WS-243' }, { left: 'WS-244', right: 'WS-244' }, { left: 'WS-245', right: 'WS-245' },
      { left: 'WS-246', right: 'WS-246' }, { left: 'WS-247', right: 'WS-247' }, { left: 'WS-248', right: 'WS-248' },
      { left: 'WS-249', right: 'WS-249' }, { left: 'WS-250', right: 'WS-250' }, { left: 'WS-251', right: 'WS-251' },
      { left: 'WS-252', right: 'WS-252' }, { left: 'WS-253', right: 'WS-253' }, { left: 'WS-254', right: 'WS-254' },
      { left: 'WS-255', right: 'WS-255' }, { left: 'WS-256', right: 'WS-256' }, { left: 'WS-257', right: 'WS-257' },
      { left: 'WS-258', right: 'WS-258' }, { left: 'WS-259', right: 'WS-259' }, { left: 'WS-260', right: 'WS-260' },
      { left: 'WS-261', right: 'WS-261' }, { left: 'WS-262', right: 'WS-262' }, { left: 'WS-263', right: 'WS-263' },
      { left: 'WS-264', right: 'WS-264' }, { left: 'WS-265', right: 'WS-265' }, { left: 'WS-266', right: 'WS-266' },
      { left: 'WS-267', right: 'WS-267' }, { left: 'WS-268', right: 'WS-268' }, { left: 'WS-269', right: 'WS-269' },
      { left: 'WS-270', right: 'WS-270' }, { left: 'WS-271', right: 'WS-271' }, { left: 'WS-272', right: 'WS-272' },
      { left: 'WS-273', right: 'WS-273' }, { left: 'WS-274', right: 'WS-274' }, { left: 'WS-275', right: 'WS-275' },
      { left: 'WS-276', right: 'WS-276' }, { left: 'WS-277', right: 'WS-277' }, { left: 'WS-278', right: 'WS-278' },
      { left: 'WS-279', right: 'WS-279' }, { left: 'WS-280', right: 'WS-280' }, { left: 'WS-281', right: 'WS-281' },
      { left: 'WS-282', right: 'WS-282' }, { left: 'WS-283', right: 'WS-283' }, { left: 'WS-284', right: 'WS-284' },
      { left: 'WS-285', right: 'WS-285' }, { left: 'WS-286', right: 'WS-286' }, { left: 'WS-287', right: 'WS-287' },
      { left: 'WS-288', right: 'WS-288' }, { left: 'WS-289', right: 'WS-289' }, { left: 'WS-290', right: 'WS-290' },
      { left: 'WS-291', right: 'WS-291' }, { left: 'WS-292', right: 'WS-292' }, { left: 'WS-293', right: 'WS-293' },
      { left: 'WS-294', right: 'WS-294' }, { left: 'WS-295', right: 'WS-295' }, { left: 'WS-296', right: 'WS-296' },
      { left: 'WS-297', right: 'WS-297' }, { left: 'WS-298', right: 'WS-298' }, { left: 'WS-299', right: 'WS-299' },
      { left: 'WS-300', right: 'WS-300' }, { left: 'WS-301', right: 'WS-301' }, { left: 'WS-302', right: 'WS-302' },
      { left: 'WS-303', right: 'WS-303' }, { left: 'WS-304', right: 'WS-304' }, { left: 'WS-305', right: 'WS-305' },
      { left: 'WS-306', right: 'WS-306' }, { left: 'WS-307', right: 'WS-307' }, { left: 'WS-308', right: 'WS-308' },
      { left: 'WS-309', right: 'WS-309' }, { left: 'WS-310', right: 'WS-310' }, { left: 'WS-311', right: 'WS-311' },
      { left: 'WS-312', right: 'WS-312' }, { left: 'WS-313', right: 'WS-313' }, { left: 'WS-314', right: 'WS-314' },
      { left: 'WS-315', right: 'WS-315' }, { left: 'WS-316', right: 'WS-316' }, { left: 'WS-317', right: 'WS-317' },
      { left: 'WS-318', right: 'WS-318' }, { left: 'WS-319', right: 'WS-319' }, { left: 'WS-320', right: 'WS-320' },
      { left: 'WS-321', right: 'WS-321' }, { left: 'WS-322', right: 'WS-322' }, { left: 'WS-323', right: 'WS-323' },
      { left: 'WS-324', right: 'WS-324' }, { left: 'WS-325', right: 'WS-325' }, { left: 'WS-326', right: 'WS-326' },
      { left: 'WS-327', right: 'WS-327' }, { left: 'WS-328', right: 'WS-328' }, { left: 'WS-329', right: 'WS-329' },
      { left: 'WS-330', right: 'WS-330' }, { left: 'WS-331', right: 'WS-331' }, { left: 'WS-332', right: 'WS-332' },
      { left: 'WS-333', right: 'WS-333' }, { left: 'WS-334', right: 'WS-334' }, { left: 'WS-335', right: 'WS-335' },
      { left: 'WS-336', right: 'WS-336' }, { left: 'WS-337', right: 'WS-337' }, { left: 'WS-338', right: 'WS-338' },
      { left: 'WS-339', right: 'WS-339' }, { left: 'WS-340', right: 'WS-340' }, { left: 'WS-341', right: 'WS-341' },
      { left: 'WS-342', right: 'WS-342' }, { left: 'WS-343', right: 'WS-343' }, { left: 'WS-344', right: 'WS-344' },
      { left: 'WS-345', right: 'WS-345' }, { left: 'WS-346', right: 'WS-346' }, { left: 'WS-347', right: 'WS-347' },
      { left: 'WS-348', right: 'WS-348' }, { left: 'WS-349', right: 'WS-349' }, { left: 'WS-350', right: 'WS-350' },
      { left: 'WS-351', right: 'WS-351' }, { left: 'WS-352', right: 'WS-352' }, { left: 'WS-353', right: 'WS-353' },
      { left: 'WS-354', right: 'WS-354' }, { left: 'WS-355', right: 'WS-355' }, { left: 'WS-356', right: 'WS-356' },
      { left: 'WS-357', right: 'WS-357' }, { left: 'WS-358', right: 'WS-358' }, { left: 'WS-359', right: 'WS-359' },
      { left: 'WS-360', right: 'WS-360' }, { left: 'WS-361', right: 'WS-361' }, { left: 'WS-362', right: 'WS-362' },
      { left: 'WS-363', right: 'WS-363' }, { left: 'WS-364', right: 'WS-364' }, { left: 'WS-365', right: 'WS-365' },
      { left: 'WS-366', right: 'WS-366' }, { left: 'WS-367', right: 'WS-367' }, { left: 'WS-368', right: 'WS-368' },
      { left: 'WS-369', right: 'WS-369' }, { left: 'WS-370', right: 'WS-370' }, { left: 'WS-371', right: 'WS-371' },
      { left: 'WS-372', right: 'WS-372' }, { left: 'WS-373', right: 'WS-373' }, { left: 'WS-374', right: 'WS-374' },
      { left: 'WS-375', right: 'WS-375' }, { left: 'WS-376', right: 'WS-376' }, { left: 'WS-377', right: 'WS-377' },
      { left: 'WS-378', right: 'WS-378' }, { left: 'WS-379', right: 'WS-379' }, { left: 'WS-380', right: 'WS-380' },
      { left: 'WS-381', right: 'WS-381' }, { left: 'WS-382', right: 'WS-382' }, { left: 'WS-383', right: 'WS-383' },
      { left: 'WS-384', right: 'WS-384' }, { left: 'WS-385', right: 'WS-385' }, { left: 'WS-386', right: 'WS-386' },
      { left: 'WS-387', right: 'WS-387' }, { left: 'WS-388', right: 'WS-388' }, { left: 'WS-389', right: 'WS-389' },
      { left: 'WS-390', right: 'WS-390' }, { left: 'WS-391', right: 'WS-391' }, { left: 'WS-392', right: 'WS-392' },
      { left: 'WS-393', right: 'WS-393' }, { left: 'WS-394', right: 'WS-394' }, { left: 'WS-395', right: 'WS-395' },
      { left: 'WS-396', right: 'WS-396' }, { left: 'WS-397', right: 'WS-397' }, { left: 'WS-398', right: 'WS-398' },
      { left: 'WS-399', right: 'WS-399' }, { left: 'WS-400', right: 'WS-400' }, { left: 'WS-401', right: 'WS-401' },
      { left: 'WS-402', right: 'WS-402' }, { left: 'WS-403', right: 'WS-403' }, { left: 'WS-404', right: 'WS-404' },
      { left: 'WS-405', right: 'WS-405' }, { left: 'WS-406', right: 'WS-406' }, { left: 'WS-407', right: 'WS-407' },
      { left: 'WS-408', right: 'WS-408' }, { left: 'WS-409', right: 'WS-409' }, { left: 'WS-410', right: 'WS-410' },
      { left: 'WS-411', right: 'WS-411' }, { left: 'TWS-01', right: 'TWS-02' }, { left: 'TWS-03', right: 'TWS-04' },
      { left: 'TWS-05', right: 'TWS-06' }, { left: 'TWS-07', right: 'TWS-08' }, { left: 'TWS-09', right: 'TWS-10' },
      { left: 'TWS-11', right: 'TWS-12' }, { left: 'TWS-13', right: 'TWS-14' }, { left: 'TWS-15', right: 'TWS-16' },
      { left: 'TWS-17', right: 'TWS-18' }, { left: 'TWS-19', right: 'TWS-20' }, { left: 'TWS-21', right: 'CB-01' },
      { left: 'CB-02', right: 'CB-03' }, { left: 'CB-04', right: 'MR-01' }, { left: 'MR-02', right: 'MR-03' },
      { left: 'MR-04', right: 'MR-05' }, { left: 'MR-06', right: 'MR-07' }, { left: 'MR-08', right: 'MR-09' },
      { left: 'MR-10', right: 'MR-11' }, { left: 'CO-01', right: 'CO-02' }, { left: 'TL-03', right: '' }
    ],
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
    const ticket = floorTickets.find(t => t.systemId === system.id);
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
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base ${
                selectedSection === 'all' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Map size={16} className={selectedSection === 'all' ? 'text-white' : 'text-gray-400'} />
              <span>All Sections</span>
            </button>
            {sectionFilters.map((filter) => (
              <button
                key={filter.type}
                onClick={() => setSelectedSection(filter.type)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base ${
                  selectedSection === filter.type 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {React.cloneElement(filter.icon, {
                  className: selectedSection === filter.type ? 'text-white' : 'text-gray-400'
                })}
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floor Layout - Render Columns with Paired Systems */}
        <div className="flex flex-wrap justify-center gap-x-6 sm:gap-x-10 md:gap-x-14 py-4">
          {organizeLayoutByImage(officeLayout.flat(), 4).map((column, colIndex) => (
            <div key={`column-${colIndex}`} className="flex flex-col items-center gap-y-4 mx-4">
              {column.map((pair, pairIndex) => (
                <div key={`pair-${colIndex}-${pairIndex}`} className="flex items-center justify-center gap-0.5 sm:gap-1 my-2">
                  {pair[0] && (
                    <OfficeDesk
                      key={`system-${colIndex}-${pairIndex}-0`}
                      system={pair[0]}
                      status={floorTickets.find(t => t.systemId === pair[0].id)?.status || 'available'}
                      onClick={() => handleSystemClick(pair[0])}
                    />
                  )}

                  {pair.length === 2 && pair[1] && (
                    <div className="flex items-center justify-center w-6">
                      <span className="text-purple-400 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">H</span>
                    </div>
                  )}

                  {pair.length === 2 && pair[1] && (
                    <OfficeDesk
                      key={`system-${colIndex}-${pairIndex}-1`}
                      system={pair[1]}
                      status={floorTickets.find(t => t.systemId === pair[1].id)?.status || 'available'}
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

// Ticket List Component - Updated for better responsiveness
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
    <div className="bg-gray-800 rounded-xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-700 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100 flex items-center">
          <AlertTriangle size={20} className="text-purple-400 mr-2 md:mr-3" />
          Support Tickets
        </h2>

        {/* Filter buttons - Responsive */}
        <div className="flex flex-wrap gap-2 bg-gray-900 p-1 rounded-lg border border-gray-700">
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

      {/* Tickets list - Responsive */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4 items-center">
                <div className="flex items-center col-span-1 sm:col-span-2">
                  <div className="bg-gray-800 p-1 sm:p-2 rounded border border-gray-700 mr-2 sm:mr-3">
                    <Laptop size={16} className="text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-200 truncate">{ticket.deviceId || ticket.systemId || 'Unknown Device'}</h3>
                    <p className="text-xs text-gray-400 truncate">
                      {ticket.floor || 'Unknown Floor'} · {ticket.createdAt || 'Unknown Date'}
                    </p>
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 md:col-span-3">
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{ticket.issue}</p>
                </div>

                <div className="col-span-1 flex items-center justify-end gap-2">
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
