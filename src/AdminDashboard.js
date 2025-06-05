import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, setDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Clock, Users, AlertTriangle, Check, Map, Monitor, Cpu, Laptop, Award, Phone, Menu, X, Plus, Info, Bell, ChevronDown, Calendar, Settings, BarChart } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Custom calendar styles
const calendarStyles = `
  .react-calendar-custom {
    width: 350px;
    max-width: 100%;
    background: transparent !important;
    border: none !important;
    font-family: inherit;
  }

  .react-calendar-custom .react-calendar__tile {
    padding: 1em 0.5em;
    background: transparent;
    text-align: center;
    line-height: 16px;
    color: white;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .react-calendar-custom .react-calendar__tile:enabled:hover,
  .react-calendar-custom .react-calendar__tile:enabled:focus {
    background: rgba(139, 92, 246, 0.2);
    color: white;
    border-radius: 0.5rem;
  }

  .react-calendar-custom .react-calendar__tile--now {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 0.5rem;
    font-weight: bold;
    color: white;
  }

  .react-calendar-custom .react-calendar__tile--active {
    background: rgba(139, 92, 246, 0.5) !important;
    color: white;
    border-radius: 0.5rem;
  }

  .react-calendar-custom .react-calendar__navigation button {
    color: white;
    min-width: 44px;
    background: transparent;
    font-size: 16px;
    margin-top: 8px;
  }

  .react-calendar-custom .react-calendar__navigation button:enabled:hover,
  .react-calendar-custom .react-calendar__navigation button:enabled:focus {
    background: rgba(139, 92, 246, 0.2);
    border-radius: 0.5rem;
  }

  .react-calendar-custom .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
    color: rgba(255, 255, 255, 0.7);
  }

  .react-calendar-custom .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
  }

  .react-calendar-custom .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = calendarStyles;
  document.head.appendChild(styleSheet);
}

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

// OfficeDesk Component - Restored to always show all devices as clickable
const OfficeDesk = ({ system, status, onClick }) => {
  const baseClasses = "relative flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden";
  const isTicketOpen = status === 'open';
  const monitorScreenStroke = isTicketOpen ? '#FF0000' : '#A78BFA'; // Border is already purple
  const monitorScreenStrokeWidth = isTicketOpen ? '12' : '8';
  const openTicketOverlay = isTicketOpen ? (
    <rect
      x="30" y="20" width="240" height="160" rx="20" ry="20"
      fill="rgba(255, 0, 0, 0.3)"
    />
  ) : null;
  const hoverEffectClass = 'hover:scale-105';
  return (
    <div
      className={`${baseClasses} w-14 h-20 md:w-24 md:h-32 ${hoverEffectClass}`}
      onClick={onClick}
    >
      <svg width="100%" height="100%" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" className="block m-auto">
        {/* Monitor Screen - Change fill to transparent purple */}
        <rect
          x="30" y="20" width="240" height="160" rx="20" ry="20"
          fill="rgba(167, 139, 250, 0.2)" // Transparent purple - Fixed syntax
          stroke={monitorScreenStroke}
          strokeWidth={monitorScreenStrokeWidth}
        />
        {openTicketOverlay}
        {/* Monitor Stands - Change fill to purple */}
        <rect x="110" y="200" width="80" height="12" rx="6" ry="6" fill="#A78BFA"/>
        <rect x="145" y="180" width="10" height="30" fill="#A78BFA"/>
        <text
          x="150"
          y="100"
          fontSize="40"
          fill="#FFFFFF"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-mono select-none pointer-events-none"
        >
          {system?.id || 'N/A'}
        </text>
      </svg>
    </div>
  );
};

// Chart Components
function IssueOverviewChart({ data }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
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
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => value}
          />
          <Line dataKey="count" stroke="#8B5CF6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function IssueBreakdownChart({ data, total }) {
  // data is expected to be an array like: [{ name: 'Category', value: count, color: '#color' }, ...]
  // total is the total number for percentage calculation

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Adjust size as needed
            outerRadius={90} // Adjust size as needed
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {/* Centered Total Text */}
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold text-white">
             {total}
           </text>
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
          {/* Legend is handled by the summary boxes below the chart in this design */}
        </PieChart>
      </ResponsiveContainer>
       {/* Summary boxes below the chart */}
       {/* These are now rendered in the Dashboard component where IssueBreakdownChart is used */}
       {/* If you prefer the chart component to render them, move the mapping logic here */}
       {/* For now, leaving them in Dashboard for flexibility */}
      {total === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No breakdown data available</p>
        </div>
      )}
    </div>
  );
}

// Dashboard Component - Updated for better responsiveness
function Dashboard({ tickets, usersList }) {
  // Calculate summary statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const unresolvedTickets = openTickets + inProgressTickets; // Unresolved = Open + In Progress
  const pendingQueue = openTickets + inProgressTickets; // Queue = Current Pending Issues (assuming this is open + in-progress)

  // Calculate ticket metrics by type (placeholder - assuming issue description contains keywords)
  // Calculate ticket metrics by type using the new 'type' field
  const networkIssues = tickets.filter(t => t.type?.toLowerCase() === 'network').length;
  const softwareIssues = tickets.filter(t => t.type?.toLowerCase() === 'software').length;
  const hardwareIssues = tickets.filter(t => t.type?.toLowerCase() === 'hardware').length;
  const otherIssues = tickets.filter(t => t.type?.toLowerCase() === 'other' || !t.type).length;

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

  // Function to generate daily ticket counts
  const generateDailyTicketCounts = (tickets, days = 7) => {
    const dailyCounts = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize counts for the last 'days' number of days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      dailyCounts[dateString] = 0;
    }

    // Debug log for date range
    console.log("generateDailyTicketCounts: Date range initialized:", Object.keys(dailyCounts));

    // Count tickets by creation date
    tickets.forEach(ticket => {
      try {
        let createdAtDate;
        if (ticket.createdAt?.toDate) {
          // Handle Firestore Timestamp
          createdAtDate = ticket.createdAt.toDate();
        } else if (typeof ticket.createdAt === 'string') {
          // Handle string date
          createdAtDate = new Date(ticket.createdAt);
        } else if (ticket.createdAt instanceof Date) {
          // Handle Date object
          createdAtDate = ticket.createdAt;
        } else {
          console.warn("generateDailyTicketCounts: Invalid date format for ticket:", ticket.id, ticket.createdAt);
          return;
        }

        // Set time to midnight for accurate date comparison
        createdAtDate.setHours(0, 0, 0, 0);
          const dateString = createdAtDate.toISOString().split('T')[0];

        // Debug log for ticket date processing
        // console.log("generateDailyTicketCounts: Processing ticket:", { id: ticket.id, createdAt: ticket.createdAt, dateString: dateString }); // Keep this log if detailed check is needed

          if (dailyCounts.hasOwnProperty(dateString)) {
            dailyCounts[dateString]++;
        }
      } catch (error) {
        console.error("generateDailyTicketCounts: Error processing ticket date:", ticket.id, error);
      }
    });

    // Debug log for final counts
    console.log("generateDailyTicketCounts: Final daily counts:", dailyCounts);

    // Convert to array format for recharts, sorted by date
    const chartData = Object.entries(dailyCounts)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({
      date: date,
        count: count
    }));

    console.log("generateDailyTicketCounts: Final chart data array:", chartData);

    return chartData;
  };

  // Generate Issue Overview data from actual tickets
  const issueOverviewData = generateDailyTicketCounts(tickets, 7); // Get data for the last 7 days

  console.log("AdminDashboard: Data being passed to IssueOverviewChart:", issueOverviewData);

  // Priority distribution data (adapting for Issue Breakdown visual)
  const issueBreakdownData = [
    { name: 'Network', value: networkIssues, color: '#60A5FA' }, // purple
    { name: 'Software', value: softwareIssues, color: '#C084FC' }, // Purple
    { name: 'Hardware', value: hardwareIssues, color: '#F59E0B' }, // Amber
    { name: 'Other', value: otherIssues, color: '#2DD4BF' }, // Teal
  ];

  // Example Resolvers data (Placeholder)
  // Modify this to use actual data from tickets and usersList
  const resolversData = useMemo(() => {
    const resolverStats = usersList.reduce((acc, user) => {
      // Initialize stats for each user
      acc[user.id] = {
        id: user.id,
        name: user.displayName || user.email || 'Unknown User', // Use display name or email
        empId: user.empId || 'N/A', // Assuming empId might be on user object
        total: 0,
        open: 0, // Add count for open tickets assigned
        inProgress: 0, // Add count for in-progress tickets assigned
        resolved: 0, // Add count for resolved tickets assigned
        // Add counts by issue type if needed, similar to issue breakdown
      };
      return acc;
    }, {});

    // Iterate through tickets and update resolver stats
    tickets.forEach(ticket => {
      if (ticket.assignedTo) {
        // Find the resolver in the usersList by name or other identifier
        const assignedResolver = usersList.find(user => user.displayName === ticket.assignedTo || user.email === ticket.assignedTo);
        if (assignedResolver && resolverStats[assignedResolver.id]) {
          resolverStats[assignedResolver.id].total++;
          if (ticket.status === 'open') resolverStats[assignedResolver.id].open++;
          if (ticket.status === 'in-progress') resolverStats[assignedResolver.id].inProgress++;
          if (ticket.status === 'resolved') resolverStats[assignedResolver.id].resolved++;
        }
      }
    });

    // Convert stats object to array and sort if needed
    return Object.values(resolverStats).sort((a, b) => b.total - a.total); // Sort by total assigned tickets

  }, [tickets, usersList]); // Re-calculate when tickets or usersList change

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-100 flex items-center">
        <BarChart size={20} className="text-purple-400 mr-2 md:mr-3" />
        Dashboard Overview
      </h2>

      {/* Top stats cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Issues Card */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col items-start justify-center shadow-md min-h-[120px]">
          <span className="text-gray-400 text-sm mb-2">Total Issues</span>
          <h3 className="text-4xl font-bold text-white">{totalTickets}</h3>
        </div>

        {/* Resolved Issues Card */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col items-start justify-center shadow-md min-h-[120px]">
          <span className="text-gray-400 text-sm mb-2">Resolved</span>
          <h3 className="text-4xl font-bold text-white">{resolvedTickets}</h3>
        </div>

        {/* Unresolved Issues Card */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col items-start justify-center shadow-md min-h-[120px]">
          <span className="text-gray-400 text-sm mb-2">Unresolved</span>
          <h3 className="text-4xl font-bold text-white">{unresolvedTickets}</h3>
        </div>

        {/* Queue Card */}
        <div className="bg-red-700/50 rounded-xl p-4 border border-red-600 flex flex-col items-start justify-center shadow-md min-h-[120px]">
          <span className="text-red-300 text-sm mb-2">Queue</span>
          <h3 className="text-4xl font-bold text-white">{pendingQueue}</h3>
          <span className="text-red-300 text-xs mt-1">Current Pending Issues</span>
        </div>
      </div>

      {/* Charts row - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Issue Breakdown Chart (formerly Priority Distribution) */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md flex flex-col items-center">
          <h3 className="text-lg font-medium text-white mb-4">Issue Breakdown</h3>
          <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center">
             <PieChart width={400} height={400}>
              <Pie
                data={issueBreakdownData}
                cx={200}
                cy={200}
                innerRadius={80}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {issueBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
               <text x={200} y={200} textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold text-white">
                {totalTickets}
              </text>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#F3F4F6'
                }}
                formatter={(value, name) => {
                  const percentage = ((value / totalTickets) * 100).toFixed(1);
                  return [`${value} (${percentage}%)`, name];
                }}
              />
            </PieChart>
          </div>
           {/* Issue Breakdown Summary (Network, Software, etc.) */}
          <div className="mt-4 grid grid-cols-2 gap-2 w-full">
            {issueBreakdownData.map((entry, index) => (
               <div key={index} className={`bg-gray-700/30 rounded-lg p-2 text-center border border-gray-600/50`}>
                <div className="text-gray-300 font-medium">{entry.value}</div>
                <div className="text-xs text-gray-400">{entry.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Overview Chart (formerly Ticket Trends) */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-white mb-4">Issue Overview</h3>
          <div className="h-[300px] sm:h-[400px]">
            {console.log("IssueOverviewChart: Rendering with data:", issueOverviewData)}
            <IssueOverviewChart data={issueOverviewData} />
          </div>
        </div>
      </div>


       {/* Queue Section */}
       <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
         <h3 className="text-lg font-medium text-white mb-4">Queue</h3>
         <div className="space-y-3">
            {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').slice(0, 5).map((ticket, index) => (
              <div key={ticket.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-2">
                   {/* Display System Type */}
                   <span className="text-xs px-2 py-1 rounded font-medium bg-purple-600 text-white">{ticket.type?.charAt(0).toUpperCase() + ticket.type?.slice(1).toLowerCase() || 'Issue'}</span>
                   {/* Display Floor */}
                   <span className="text-xs px-2 py-1 rounded font-medium bg-gray-700 text-gray-300">{ticket.floor || 'Floor N/A'}</span>
                   {/* Display Device/System ID */}
                   <span className="text-xs px-2 py-1 rounded font-medium bg-purple-600 text-white">{ticket.deviceId || ticket.systemId || 'ID N/A'}</span>
                </div>
                 <div className="flex items-center space-x-3">
                   {/* Removed placeholder numerical badges and Get button for now */}
                    <div className="flex items-center text-gray-400 text-xs">
                       <Clock size={14} className="mr-1"/>
                       {/* Display Time in Queue (using creation time for now) */}
                       <span>
                         {ticket.createdAt 
                           ? ((typeof ticket.createdAt.toDate === 'function' ? ticket.createdAt.toDate() : new Date(ticket.createdAt)))?.toISOString() || 'N/A'
                           : 'N/A'}
                       </span>
                    </div>
                 </div>
              </div>
            ))}
            {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length === 0 && (
              <div className="text-gray-400 text-sm text-center">No pending issues in the queue.</div>
            )}
         </div>
       </div>

      {/* Recently Resolved Section */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
        <h3 className="text-lg font-medium text-white mb-4">Recently Resolved</h3>
        <div className="space-y-3">
          {/* Content for Recently Resolved will go here */}
          {tickets.filter(t => t.status === 'resolved').slice(0, 5).map((ticket, index) => (
             <div key={index} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
               <div className="flex items-center space-x-2">
                  {/* Display System Type or Placeholder */}
                  <span className="text-xs px-2 py-1 rounded font-medium bg-purple-600 text-white">{ticket.type?.charAt(0).toUpperCase() + ticket.type?.slice(1).toLowerCase() || 'N/A'}</span>
                  {/* Display Floor or Placeholder */}
                  <span className="text-xs px-2 py-1 rounded font-medium bg-gray-700 text-gray-300">{ticket.floor || 'N/A'}</span>
                  {/* Display Device/System ID or Placeholder */}
                  <span className="text-xs px-2 py-1 rounded font-medium bg-purple-600 text-white">{ticket.deviceId || ticket.systemId || 'N/A'}</span>
               </div>
                <div className="flex items-center space-x-3">
                  {/* Removed placeholder numerical badges */}
                   <div className="flex items-center text-gray-400 text-xs">
                      <Clock size={14} className="mr-1"/>
                      {/* Display Resolved At date and time (as ISO string) */}
                      <span>
                        {ticket.resolvedAt 
                          ? (typeof ticket.resolvedAt.toDate === 'function' ? ticket.resolvedAt.toDate() : new Date(ticket.resolvedAt))?.toISOString() || 'N/A'
                          : ticket.updatedAt 
                            ? (typeof ticket.updatedAt.toDate === 'function' ? ticket.updatedAt.toDate() : new Date(ticket.updatedAt))?.toISOString() || 'N/A'
                            : 'N/A'}
                      </span>
                   </div>
                </div>
             </div>
           ))}
           {tickets.filter(t => t.status === 'resolved').length === 0 && (
              <div className="text-gray-400 text-sm text-center">No recently resolved issues.</div>
           )}
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
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium border border-red-500/20 backdrop-blur-sm">
                      {stats.open}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-500/20 backdrop-blur-sm">
                      {stats.inProgress}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium border border-green-500/20 backdrop-blur-sm">
                      {stats.resolved}
                    </span>
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
              <div className={`mt-1 rounded-full w-3 h-3 flex-shrink-0 ${
                ticket.status === 'open' ? 'bg-red-500' :
                  ticket.status === 'in-progress' ? 'bg-yellow-500' :
                    'bg-green-500'
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
function TicketDetail({ ticket, onClose, updateStatus, assignTicket, isMobile, isViewOnly, getBuildingFromFloor }) {
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
                Building: {getBuildingFromFloor(ticket.floor)} · Floor: {ticket.floor || 'Unknown'} · Created: {ticket.createdAt ? (typeof ticket.createdAt.toDate === 'function' ? ticket.createdAt.toDate() : new Date(ticket.createdAt)).toLocaleString() : 'N/A'}
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
            {!isViewOnly && ( // Only show if NOT in view-only mode
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
            )}

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
            {!isViewOnly && ( // Only show if NOT in view-only mode
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
            )}

            {/* Activity timeline */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="mt-1 bg-purple-500 rounded-full w-3 h-3 flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-400">
                      {ticket.createdAt ? (typeof ticket.createdAt.toDate === 'function' ? ticket.createdAt.toDate() : new Date(ticket.createdAt)).toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-200">Ticket created</p>
                  </div>
                </div>
                {ticket.assignedTo && (
                  <div className="flex items-start">
                    <div className="mt-1 bg-purple-500 rounded-full w-3 h-3 flex-shrink-0"></div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-400">
                        {ticket.updatedAt ? (typeof ticket.updatedAt.toDate === 'function' ? ticket.updatedAt.toDate() : new Date(ticket.updatedAt)).toLocaleString() : 'N/A'}
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
                        {ticket.resolvedAt ? (typeof ticket.resolvedAt.toDate === 'function' ? ticket.resolvedAt.toDate() : new Date(ticket.resolvedAt)).toLocaleString() : 'N/A'}
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

// New Modal Component: DeviceActionModal
function DeviceActionModal({ system, onClose, setShowChangeDeviceIdForm, selectedSystemForAction, tickets, setSelectedTicket, setIsTicketDetailViewOnly }) {
  // Placeholder image component (replace with actual SVG/image if available)
  // This is a basic placeholder using a Lucide icon. You'll want to replace this
  // with the actual illustration from your second screenshot.
  const Illustration = () => (
    <div className="flex justify-center mb-6">
      {/* Replace this SVG with your actual illustration */}
      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Adjusted placeholder shapes for dark theme */}
        {/* Using shades of gray and purple that fit the dark background */}
        <circle cx="75" cy="60" r="40" fill="#374151"/> {/* Dark gray circle */}
        <rect x="30" y="80" width="90" height="50" rx="10" fill="#4B5563"/> {/* Medium gray rect */}
        <path d="M75 130 L60 145 L90 145 L75 130Z" fill="#6B21A8"/> {/* Dark purple triangle */}
        {/* Add other details from your illustration with dark theme colors */}
      </svg>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/80 rounded-lg shadow-xl p-6 max-w-sm w-full text-center relative border border-purple-700 backdrop-blur-xl">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        {/* Illustration */}
        <Illustration />

        {/* Optional: Display system info */}
        {system && (
          <p className="text-gray-200 mb-4 text-lg font-semibold">Device: {system.id || system.deviceId || system.systemId}</p>
        )}

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => {
              console.log("Change Device ID clicked for system:", system);
              onClose(); // Close the action modal
              setShowChangeDeviceIdForm(true); // Open the change ID form modal
              // selectedSystemForAction state is already set in AdminDashboard
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-lg font-medium"
          >
            Change Device ID
          </button>
          <button
            onClick={() => {
              console.log("Check Issue clicked for system:", system);
              onClose(); // Close the action modal
              const relevantTicket = tickets.find(
                t => (t.systemId === system.id || t.deviceId === system.id) &&
                     (t.status === 'open' || t.status === 'in-progress')
              );
              if (relevantTicket) {
                setSelectedTicket(relevantTicket); // Open the ticket details sidebar
                setIsTicketDetailViewOnly(true); // Set to true for view-only mode
              } else {
                console.warn("Check Issue clicked, but no relevant open/in-progress ticket found for system:", system);
                // Optionally, handle this case (e.g., show a message) - currently does nothing.
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg font-medium"
          >
            Check Issue
          </button>
        </div>
      </div>
    </div>
  );
}

// New Modal Component: ChangeDeviceIdFormModal
function ChangeDeviceIdFormModal({ system, onClose, onSave }) {
  const [newDeviceId, setNewDeviceId] = useState('');
  const [confirmDeviceId, setConfirmDeviceId] = useState('');
  const [error, setError] = useState(null);

  const handleSave = () => {
    setError(null);
    if (newDeviceId.trim() === '') {
      setError('New Device ID cannot be empty.');
      return;
    }
    if (newDeviceId !== confirmDeviceId) {
      setError('New Device ID and Confirm Device ID do not match.');
      return;
    }

    // Call the parent onSave function with the system and new ID
    onSave(system.id, newDeviceId);
    onClose(); // Close the modal after saving
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/80 rounded-lg shadow-xl p-6 max-w-sm w-full text-center relative border border-purple-700 backdrop-blur-xl">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-white mb-2">Change Device ID</h3>
        {system && (
          <p className="text-gray-600 mb-4 text-sm">(Current: {system.id || system.deviceId || system.systemId})</p>
        )}

        {error && (
          <div className="text-red-600 text-sm mb-4">{error}</div>
        )}

        {/* Input fields */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Enter New Device ID"
            value={newDeviceId}
            onChange={(e) => setNewDeviceId(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-700"
          />
          <input
            type="text"
            placeholder="Confirm Device New ID"
            value={confirmDeviceId}
            onChange={(e) => setConfirmDeviceId(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-700"
          />
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSave}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity font-medium text-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Main Admin App Component
export default function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state for selected building
  // Changed default building name from 'Town Square' to 'Building 1'
  const [selectedBuilding, setSelectedBuilding] = useState('Building 1'); // Default building

  // Add state for the device action modal
  const [deviceActionModalOpen, setDeviceActionModalOpen] = useState(false);
  const [selectedSystemForAction, setSelectedSystemForAction] = useState(null);

  // Add state for the change device ID form modal
  const [showChangeDeviceIdForm, setShowChangeDeviceIdForm] = useState(false);

  // Add check for user authentication
  useEffect(() => {
    if (!user) {
      console.error('No user object provided to AdminDashboard');
      // You might want to redirect to login here
      return;
    }
  }, [user]);

  // Calculate summary statistics from the tickets state
  const totalTicketsCount = tickets.length;
  const resolvedTicketsCount = tickets.filter(t => t.status === 'resolved').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const unresolvedTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length; // Unresolved = Open + In Progress (for dashboard summary card)

  const [currentFloor, setCurrentFloor] = useState('S1');
  const [activeTab, setActiveTab] = useState('tickets'); // Changed default tab to 'tickets'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State to control view-only mode for TicketDetail
  const [isTicketDetailViewOnly, setIsTicketDetailViewOnly] = useState(false);
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

  // Function to get building from floor
  const getBuildingFromFloor = (floor) => {
    if (!floor) return 'N/A';

    // Map floors to buildings
    if (floor.startsWith('S')) return 'Building 1';
    if (floor.startsWith('F')) return 'Building 2';
    if (floor.startsWith('G')) return 'Building 3';

    return 'N/A';
  };

  // Update the useEffect for fetching tickets to use real-time updates
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        // Create a query for tickets
        const q = query(
          collection(db, "tickets"),
          orderBy("createdAt", "desc")
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const ticketsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to JavaScript Date objects
            const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : (typeof data.createdAt === 'string' ? new Date(data.createdAt) : null));
            const updatedAtDate = data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt instanceof Date ? data.updatedAt : (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : null));
            const resolvedAtDate = data.resolvedAt?.toDate ? data.resolvedAt.toDate() : (data.resolvedAt instanceof Date ? data.resolvedAt : (typeof data.resolvedAt === 'string' ? new Date(data.resolvedAt) : null));

            return {
              id: doc.id,
              ...data,
              createdAt: createdAtDate,
              updatedAt: updatedAtDate,
              resolvedAt: resolvedAtDate,
              floor: data.floor || 'N/A'
            };
          });
          console.log("AdminDashboard: Real-time tickets update received:", ticketsData);
          setTickets(ticketsData);
          setLoading(false);
        }, (error) => {
          console.error("AdminDashboard: Error in real-time tickets listener:", error);
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (err) {
        console.error("AdminDashboard: Error setting up tickets listener:", err);
        setLoading(false);
      }
    };

    fetchTickets();
  }, [selectedBuilding]); // Re-run when building changes

  // Add this to AdminDashboard component
  const refreshTickets = async () => {
    try {
      // Modify refresh to filter by selected building
      const q = query(
        collection(db, "tickets"),
        // where("building", "==", selectedBuilding), // Filter by selected building
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const ticketsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamps to JavaScript Date objects
        const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : (typeof data.createdAt === 'string' ? new Date(data.createdAt) : null));
        const updatedAtDate = data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt instanceof Date ? data.updatedAt : (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : null));
        const resolvedAtDate = data.resolvedAt?.toDate ? data.resolvedAt.toDate() : (data.resolvedAt instanceof Date ? data.resolvedAt : (typeof data.resolvedAt === 'string' ? new Date(data.resolvedAt) : null));

        return {
        id: doc.id,
          ...data,
          createdAt: createdAtDate, // Store as Date object
          updatedAt: updatedAtDate, // Store as Date object
          resolvedAt: resolvedAtDate, // Store as Date object
           // Ensure floor is present for logging
          floor: data.floor || 'N/A'
        };
      });
      console.log("AdminDashboard: Refreshed tickets successfully (dates as Date objects).", ticketsData);
      setTickets(ticketsData);
    } catch (err) {
      console.error("AdminDashboard: Error refreshing tickets:", err);
    } finally {
      console.log("AdminDashboard: currentFloor state:", currentFloor);
    }
  };

  // Update useEffect to include the refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTickets();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedBuilding, currentFloor]); // Also re-run interval if currentFloor changes

  // State for users (potential resolvers)
  const [usersList, setUsersList] = useState([]);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, "users");
        // You might want to add a filter here if only specific users are resolvers (e.g., where("role", "==", "resolver"))
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("AdminDashboard: Fetched users successfully.", usersData);
        setUsersList(usersData);
      } catch (error) {
        console.error("AdminDashboard: Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []); // Fetch users only once on mount

  // Function to update ticket status
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      // Update in Firestore
      const ticketRef = doc(db, "tickets", ticketId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date()
      };

      // Add resolvedAt timestamp when status is changed to resolved
      if (newStatus === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      await updateDoc(ticketRef, updateData);

      // Update local state
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? { 
          ...ticket, 
          status: newStatus,
          updatedAt: new Date(),
          resolvedAt: newStatus === 'resolved' ? new Date() : ticket.resolvedAt
        } : ticket
      ));

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ 
          ...selectedTicket, 
          status: newStatus,
          updatedAt: new Date(),
          resolvedAt: newStatus === 'resolved' ? new Date() : selectedTicket.resolvedAt
        });
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  // Function to assign ticket to staff
  const assignTicket = async (ticketId, staffName) => {
    try {
      // Update in Firestore
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        assignedTo: staffName,
        status: 'in-progress', // Set status to in-progress on assignment
        updatedAt: new Date()
      });

      // Update local state
    setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, assignedTo: staffName, status: 'in-progress', updatedAt: new Date() } : ticket
    ));
    if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, assignedTo: staffName, status: 'in-progress', updatedAt: new Date() });
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
    }
  };

  // Handle tab change (also close sidebar on mobile)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Close sidebar on mobile when changing tabs
    if (window.innerWidth < 768) {
    setSidebarOpen(false);
    }
  };

  // Handle ticket selection (close sidebar on mobile when selecting ticket)
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDetailViewOnly(false); // Set to false for full edit mode from Reports
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

  // Define mapping between buildings and floors
  const buildingFloorMap = {
    'Building 1': ['S1', 'S2'],
    'Building 2': ['F1', 'F2', 'F3'],
    'Building 3': ['G1'],
    // Removed Building 4 and 5
  };

  // State for floors available based on selected building
  const [availableFloors, setAvailableFloors] = useState(buildingFloorMap[selectedBuilding] || []);

  // Update available floors and current floor when building changes
  useEffect(() => {
    const floorsForBuilding = buildingFloorMap[selectedBuilding] || [];
    setAvailableFloors(floorsForBuilding);
    // Set current floor to the first available floor for the selected building
    if (floorsForBuilding.length > 0) {
      setCurrentFloor(floorsForBuilding[0]);
    } else {
      setCurrentFloor(''); // Or handle case with no floors
    }
  }, [selectedBuilding]);

  // Add this state for upload status
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null, success: false });

  // Update the handlePhotoUpload function
  const handlePhotoUpload = async (file) => {
    if (!file) {
      console.error('No file provided for upload');
      throw new Error('No file provided for upload');
    }

    // Check if user exists and has uid
    if (!user || !user.uid) {
      console.error('User not authenticated');
      throw new Error('User not authenticated. Please log in again.');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type. Please upload an image.');
      throw new Error('Invalid file type. Please upload an image.');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large. Maximum size is 5MB.');
      throw new Error('File too large. Maximum size is 5MB.');
    }

    try {
      console.log('Starting file upload...');
      const storageRef = ref(storage, `profile_photos/${user.uid}/${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('File uploaded successfully:', uploadResult);

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL received:', downloadURL);

      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        updatedAt: serverTimestamp()
      });
      console.log('User document updated with new photo URL');

      // Verify the URL is accessible
      try {
        const response = await fetch(downloadURL, { method: 'HEAD' });
        if (!response.ok) {
          console.error('Photo URL is not accessible:', response.status);
          throw new Error('Photo URL is not accessible');
        }
        console.log('Photo URL is accessible');
      } catch (error) {
        console.error('Error verifying photo URL:', error);
        throw new Error('Failed to verify photo URL accessibility');
      }

      return downloadURL;
    } catch (error) {
      console.error('Error in handlePhotoUpload:', error);
      throw error;
    }
  };

  // Function to handle building selection
  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    console.log('Selected Building:', building);
    // Re-fetch tickets or filter existing tickets based on the new building
    // For now, we'll rely on the useEffect for fetching which includes the building filter.
  };

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
      <div className="relative flex-1">
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

  // Add authentication check
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-red-500">Please log in to access the admin dashboard.</div>
      </div>
    );
  }

  // Filter tickets by selected building for header counts and views
  console.log("AdminDashboard: Selected Building for filtering:", selectedBuilding);
  console.log("AdminDashboard: First 5 tickets before filtering:", tickets.slice(0, 5).map(t => ({ id: t.id, building: t.building, floor: t.floor })));

  // Filter tickets for the currently selected floor for dashboard and header counts
  const ticketsForCurrentFloor = tickets.filter(ticket => {
    // If currentFloor is empty (e.g., no floors for selected building), show no tickets
    if (!currentFloor) return false;
    return ticket.floor === currentFloor;
  });

  console.log("AdminDashboard: Tickets filtered for current floor (", currentFloor, "):", ticketsForCurrentFloor);

  // Calculate summary statistics for the currently selected floor
  const totalIssuesForDisplay = ticketsForCurrentFloor.length;
  const resolvedIssuesForDisplay = ticketsForCurrentFloor.filter(t => t.status === 'resolved').length;
  const openIssuesForDisplay = ticketsForCurrentFloor.filter(t => t.status === 'open').length;

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
          onLogout={onLogout} // <--- The onLogout prop is passed here
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          totalIssues={totalIssuesForDisplay}
          resolvedIssues={resolvedIssuesForDisplay}
          openIssues={openIssuesForDisplay}
          onPhotoUpload={handlePhotoUpload} // Pass the photo upload function as a prop
          selectedBuilding={selectedBuilding} // Pass selected building state
          onBuildingSelect={handleBuildingSelect} // Pass building selection handler
          currentFloor={currentFloor}
          setCurrentFloor={setCurrentFloor}
          availableFloors={availableFloors}
          setShowCreateFloor={setShowCreateFloor}
        />
        {/* Conditional Overlay for mobile sidebar */}
        {sidebarOpen && ( // Only show overlay if sidebar is open
           <div
             className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" // Hide overlay on medium screens and up
             onClick={() => setSidebarOpen(false)}
           ></div>
        )}
        <div className="flex flex-1 relative">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            isOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
            tickets={tickets}
          />
          {/* Main content area - Adjust for sidebar on mobile and desktop */}
          <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto transition-all duration-300`}>
            {/* Render content based on activeTab */}
            {activeTab === 'reports' && ( // <--- Changed 'tickets' to 'reports'
              <ReportsView
                tickets={tickets}
                setSelectedTicket={handleTicketSelect}
              />
            )}
            {activeTab === 'dashboard' && (
              <Dashboard
                tickets={tickets}
                usersList={usersList}
              />
            )}
            {activeTab === 'map' && (
              <div className="relative flex flex-1 items-center justify-center">
                <FloorView
                  tickets={tickets}
                  officeLayout={officeLayout}
                  setSelectedTicket={handleTicketSelect}
                  layoutConfig={layoutConfig}
                  setLayoutConfig={setLayoutConfig}
                  currentFloor={currentFloor}
                  setSelectedSystemForAction={setSelectedSystemForAction}
                  setDeviceActionModalOpen={setDeviceActionModalOpen}
                />
                {showCreateFloor && <CreateFloorModal />}
              </div>
            )}
          </main>

          {/* Render the new Device Action Modal */}
          {deviceActionModalOpen && (
            <DeviceActionModal
              system={selectedSystemForAction}
              onClose={() => setDeviceActionModalOpen(false)}
              setShowChangeDeviceIdForm={setShowChangeDeviceIdForm}
              selectedSystemForAction={selectedSystemForAction}
              tickets={tickets} // Pass the tickets list
              setSelectedTicket={setSelectedTicket} // Pass the state setter
              setIsTicketDetailViewOnly={setIsTicketDetailViewOnly} // Pass the setter
            />
          )}

          {/* Render the Change Device ID Form Modal */}
          {showChangeDeviceIdForm && selectedSystemForAction && (
            <ChangeDeviceIdFormModal
              system={selectedSystemForAction}
              onClose={() => setShowChangeDeviceIdForm(false)}
              onSave={handleSaveNewDeviceId} // Pass the save handler
            />
          )}

          {/* Existing Ticket Detail Sidebar rendering */}
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
              updateStatus={updateTicketStatus}
              assignTicket={assignTicket}
              isMobile={window.innerWidth < 768}
              isViewOnly={isTicketDetailViewOnly} // Pass the view-only state
              getBuildingFromFloor={getBuildingFromFloor} // Pass the function
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Header Component - Updated without photo upload functionality
function Header({ user, onLogout, toggleSidebar, totalIssues, resolvedIssues, openIssues, onPhotoUpload, selectedBuilding, onBuildingSelect, currentFloor, setCurrentFloor, availableFloors, setShowCreateFloor }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTownSquareDropdownOpen, setIsTownSquareDropdownOpen] = useState(false);
  const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const toggleTownSquareDropdown = () => {
    setIsTownSquareDropdownOpen(!isTownSquareDropdownOpen);
  };

  const handleBuildingSelect = (building) => {
    onBuildingSelect(building);
    setIsTownSquareDropdownOpen(false);
  };

  // Floor dropdown logic
  const handleFloorSelect = (floor) => {
    setCurrentFloor(floor);
    setIsFloorDropdownOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 p-4 shadow-lg">
      {/* Main header container with flex properties */}
      {/* Using flex-wrap for responsiveness on smaller screens, aligning items and adding padding */}
      <div className="flex flex-wrap items-center px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left section - Sidebar Toggle and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
            className="text-white hover:text-gray-300 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          {/* Placeholder for Company Logo */}
          <div className="w-12 h-10 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">Logo</div> {/* Placeholder */}
        </div>

        {/* Middle section - Building/Floor Selectors and Create Floor Button */}
        {/* Allowing this section to grow and take space, centering its content */}
        <div className="flex items-center space-x-4 flex-grow justify-center">
            {/* Building selector dropdown */}
            <div className="relative">
              <button
                onClick={toggleTownSquareDropdown}
                className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none"
              >
                <span className="font-medium">{selectedBuilding}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isTownSquareDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleBuildingSelect('Building 1')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Building 1
                    </button>
                    <button
                      onClick={() => handleBuildingSelect('Building 2')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Building 2
                    </button>
                    <button
                      onClick={() => handleBuildingSelect('Building 3')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Building 3
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Floor selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFloorDropdownOpen(!isFloorDropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none border border-gray-700 rounded px-3 py-1 bg-gray-800"
              >
                <span className="font-medium">Floor: {currentFloor}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isFloorDropdownOpen && (
                <div className="absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {availableFloors.map(floor => (
                      <button
                        key={floor}
                        onClick={() => handleFloorSelect(floor)}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${floor === currentFloor ? 'font-bold bg-gray-200' : ''}`}
                        role="menuitem"
                      >
                        {floor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Create Floor button */}
            <button
              onClick={() => setShowCreateFloor(true)}
              className="ml-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none"
            >
              Create Floor
            </button>
          </div>

        {/* Right section - Stats, Calendar, Profile */}
        {/* Keeping these grouped and aligned to the right */}
        <div className="flex items-center space-x-6 ml-auto">
          {/* Stats */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="text-center bg-gray-800/50 px-3 py-2 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-white">{totalIssues}</div>
              <div className="text-xs sm:text-sm text-gray-300">Total</div>
            </div>
            <div className="text-center bg-gray-800/50 px-3 py-2 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-400">{resolvedIssues}</div>
              <div className="text-xs sm:text-sm text-gray-300">Resolved</div>
            </div>
            <div className="text-center bg-gray-800/50 px-3 py-2 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-red-400">{openIssues}</div>
              <div className="text-xs sm:text-sm text-gray-300">Open</div>
            </div>
          </div>

            {/* Calendar button */}
            <div className="relative">
              <button
                onClick={toggleCalendar}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <Calendar className="w-6 h-6" />
              </button>

              {isCalendarOpen && (
                <div className="absolute right-0 mt-2 p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-lg shadow-xl z-50 border border-purple-500/20 backdrop-blur-sm">
                  <ReactCalendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    className="react-calendar-custom !bg-transparent !border-none"
                    tileClassName="!text-white hover:!bg-purple-500/20"
                    navigationLabel={({ date }) => (
                      <span className="text-white font-semibold">
                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    prevLabel={<span className="text-white">◀</span>}
                    nextLabel={<span className="text-white">▶</span>}
                  />
                </div>
              )}
            </div>

            {/* Profile section */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          onPhotoUpload(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <span className="text-white">{user?.name || 'Admin'}</span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <div className="font-medium">{user?.name || 'Admin'}</div>
                      <div className="text-gray-500">{user?.department || 'IT Department'}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    <div className="border-t border-gray-100"></div>
          <button
            onClick={onLogout} // <--- This calls the onLogout prop
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
          >
            Logout
          </button>
                  </div>
                </div>
        )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Sidebar Component - Adjusted for desktop visibility and mobile slide-in
function Sidebar({ activeTab, setActiveTab, isOpen, closeSidebar, tickets }) {
  const tabs = [
    { id: 'map', label: 'Floor Map', icon: <Map size={20} /> },
    { id: 'reports', label: 'Reports', icon: <AlertTriangle size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> }, // Make sure this line has the icon
  ];

  // Calculate active tickets
  const activeTicketsCount = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in-progress').length;

  return (
    // Adjusted classes: fixed on mobile, relative on md+, controlled translation only on mobile
    <aside className={`bg-gray-900/40 backdrop-blur-xl text-gray-300 shadow-2xl border-r border-gray-700/30 z-30 top-0 left-0 h-full w-64 transition-transform duration-300 ease-in-out fixed
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
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

      {/* Desktop Header - Always visible at the top of the fixed sidebar */}
      <div className="hidden md:flex flex-col items-center p-6 border-b border-gray-700/30 bg-gray-900/30 backdrop-blur-sm relative">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl mb-3 shadow-lg shadow-purple-500/20">
          IT
        </div>
        <h2 className="text-xl font-semibold text-purple-400">Support Control</h2>
        {/* Add Close Button for Desktop */}
        <button onClick={closeSidebar} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700/30 transition-colors">
          <X size={24} />
        </button>
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
                  className={`flex items-center w-full p-3.5 rounded-xl transition-all duration-200 ${activeTab === tab.id
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
                  {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length} Active
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
      </div>
    </aside>
  );
}

// FloorView Component - Updated for responsiveness
function FloorView({ 
  officeLayout, 
  tickets, 
  setSelectedTicket, 
  currentFloor,
  setSelectedSystemForAction,
  setDeviceActionModalOpen 
}) {
  const [selectedSection, setSelectedSection] = useState('floor'); // Default to 'floor'
  const [selectedSystem, setSelectedSystem] = useState(null);

  const handleSystemClick = (system) => {
    console.log("handleSystemClick entered for system:", system);
    setSelectedSystem(system); // Keep this if you use selectedSystem elsewhere
    
    // Find the most recent ticket for this system
    console.log("All tickets available:", tickets);
    const systemTickets = tickets.filter(t => 
      (t.systemId === system.id || t.deviceId === system.id) && 
      (t.status === 'open' || t.status === 'in-progress')
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("Found system tickets:", systemTickets);

    if (systemTickets.length > 0) {
      // If there are open tickets, show the action modal
      console.log("Open ticket found, showing action modal for system:", system);
      setSelectedSystemForAction(system); // Store system info for the modal
      setDeviceActionModalOpen(true); // Open the modal

      // Do NOT call setSelectedTicket here if you don't want the sidebar to open
      // setSelectedTicket(systemTickets[0]); // Comment out or remove this line

    } else {
      // If no open tickets, you might still want to allow creating a new ticket
      // or do nothing. Based on your request, we only show the modal for open tickets.
      // If you want to create a new ticket from the map click when no open ticket exists,
      // keep the new ticket creation logic here and call setSelectedTicket with the new ticket.
      console.log("No open tickets found for system. Not showing action modal.");
      // Optional: You could add logic here to handle clicks on devices without open tickets
      // (e.g., show a "Create New Ticket" modal)
      setSelectedTicket(null); // Ensure sidebar is closed if no open ticket
      setSelectedSystemForAction(null); // Clear system for action
      setDeviceActionModalOpen(false); // Ensure modal is closed
    }
  };

  // isSectionVisible is now handled within the rendering logic to group by type

  const getSectionColor = (type) => {
    switch (type) {
      case 'WS': return 'bg-purple-500';
      case 'MS': return 'bg-green-500';
      case 'PR': return 'bg-purple-500';
      case 'EMPTY': return 'bg-gray-200';
      case 'CORRIDOR': return 'bg-gray-300';
      default: return 'bg-gray-400';
    }
  };

  const organizeLayoutByImage = (systems) => {
    // Simply return the array of systems without pairing
    return systems;
  };

  // Define the new sections
  const sections = [
    { id: 'floor', label: 'Floor' },
    { id: 'cabin', label: 'Cabin' },
  ];

  // Filter systems based on the overall selected section
  const systemsForSelectedSection = officeLayout.flat().filter(system =>
    system.id && system.type !== 'EMPTY' && system.type !== 'CORRIDOR' &&
    ((selectedSection === 'floor' && (system.type === 'WORKSTATION' || system.type === 'TECHNICAL_WS' || system.type === 'TEAM_LEAD')) ||
     (selectedSection === 'cabin' && (system.type === 'MD_CABIN' || system.type === 'MEETING_ROOM' || system.type === 'CONFERENCE')))
  );

  // Group systems within the selected section by their specific type
  const groupedSystems = systemsForSelectedSection.reduce((acc, system) => {
    const type = system.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(system);
    return acc;
  }, {});

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-4 sm:p-8">
        <div className="mb-4 sm:mb-8">
          {/* Toggle-like Section Filters */}
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-700 rounded-full p-1 space-x-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedSection === section.id
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Render grouped systems */}
        {/* Apply flex centering here to the container holding system groups */}
        <div className="flex flex-col items-center justify-center space-y-8 min-h-[500px]">
          {/* ... existing code before the map loop ... */}
{Object.entries(groupedSystems).map(([type, systems]) => (
  <div key={type} className="w-full flex flex-col items-center">
    <h3 className="text-lg font-semibold text-white mb-4">{type.replace('_', ' ').toUpperCase()}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 lg:grid-cols-8 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-6 sm:gap-y-8 py-4">
      {systems.map((system, index) => {
        // Determine the status for the current system on the current floor
        const systemStatus = tickets.find(
          t => (t.systemId === system.id || t.deviceId === system.id) && t.floor === currentFloor
        )?.status || 'available';

        // Determine if the device should be clickable
        const isClickable = systemStatus === 'open';

        return (
          // Add conditional classes for styling (cursor, opacity)
          <div
            key={`system-${type}-${index}`}
            className={`flex items-center justify-center ${isClickable ? '' : 'cursor-not-allowed opacity-60'}`}
            // Apply onClick handler only if the device is clickable
            onClick={isClickable ? () => handleSystemClick(system) : undefined}
          >
            <OfficeDesk
              key={`officesystem-${type}-${index}`}
              system={system}
              status={systemStatus} // Pass the determined status
              // onClick prop on OfficeDesk itself can be removed or made redundant
              // as the click handling is now on the wrapper div
            />
          </div>
        );
      })}
    </div>
         </div>
       ))}
{/* ... existing code after the map loop ... */}
          {systemsForSelectedSection.length === 0 && (
            <div className="text-gray-400 text-center text-sm">No systems available in this section.</div>
              )}
        </div>
      </div>
    </div>
  );
}

// Ticket List Component - Updated to display all tickets
function ReportsView({ tickets, setSelectedTicket }) {
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to extract numeric ID from system ID
  const extractNumericId = (systemId) => {
    if (!systemId) return 'N/A';
    // Match any sequence of digits in the string
    const match = systemId.match(/\d+/);
    return match ? match[0] : 'N/A';
  };

  // Apply filters, search, and sorting
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(ticket => ticket.status?.toLowerCase() === filter.toLowerCase());
    }

    // Apply search - Make sure search handles cases where properties might be null or undefined
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ticket => {
        const empId = extractNumericId(ticket.deviceId || ticket.systemId)?.toLowerCase() || '';
        const empName = ticket.empName?.toLowerCase() || '';
        const deviceId = ticket.deviceId?.toLowerCase() || '';
        const systemId = ticket.systemId?.toLowerCase() || '';
        const issueType = ticket.issueType?.toLowerCase() || ticket.type?.toLowerCase() || '';
        const issue = ticket.issue?.toLowerCase() || ticket.description?.toLowerCase() || '';
        const handler = ticket.assignedTo?.toLowerCase() || '';
        const remark = ticket.remark?.toLowerCase() || '';

        return (
          empId.includes(query) ||
          empName.includes(query) ||
          deviceId.includes(query) ||
          systemId.includes(query) ||
          issueType.includes(query) ||
          issue.includes(query) ||
          handler.includes(query) ||
          remark.includes(query)
        );
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle potential null/undefined values for comparison
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      // Robust Date comparison
      if (sortField === 'createdAt' || sortField === 'updatedAt' || sortField === 'resolvedAt') {
          const dateA = aValue instanceof Date ? aValue : (aValue ? new Date(aValue) : null);
          const dateB = bValue instanceof Date ? bValue : (bValue ? new Date(bValue) : null);

          const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : (sortDirection === 'asc' ? -Infinity : Infinity);
          const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : (sortDirection === 'asc' ? -Infinity : Infinity);

          if (timeA === timeB) return 0;
          return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // General comparison for other types (numbers, strings)
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0; // Equal
    });

    return result;
  }, [tickets, filter, searchQuery, sortField, sortDirection]);

  // Helper function to toggle sort direction
  const toggleSortDirection = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc'); // Default to ascending when changing field
    }
  };

  // Add this function before the ReportsView component
  const getBuildingFromFloor = (floor) => {
    if (!floor) return 'N/A';
    
    // Map floors to buildings
    if (floor.startsWith('S')) return 'Building 1';
    if (floor.startsWith('F')) return 'Building 2';
    if (floor.startsWith('G')) return 'Building 3';
    
    return 'N/A';
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-700 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md::text-2xl font-bold text-white flex items-center">
          <AlertTriangle size={20} className="text-purple-400 mr-2 md:mr-3" />
          Support Tickets
        </h2>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  {/* Table Headers - Matching the image format */}
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('createdAt')}>
                    No. {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('empId')}>
                     EMP ID {sortField === 'empId' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('empName')}>
                     EMP Name {sortField === 'empName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('floor')}>
                    Floor {sortField === 'floor' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('deviceId')}>
                    Device ID {sortField === 'deviceId' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('type')}>
                    Issue Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('issue')}>
                    Description {sortField === 'issue' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('createdAt')}>
                    Raised On {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('resolvedAt')}>
                    Resolved On {sortField === 'resolvedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('status')}>
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('assignedTo')}>
                    Handler {sortField === 'assignedTo' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                   <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('remark')}>
                    Remark {sortField === 'remark' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                   <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => toggleSortDirection('resolvedByBuilding')}>
                     Resolved by handler on building {sortField === 'resolvedByBuilding' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-3 sm:px-4 py-2 sm:py-3 text-center text-white text-sm">
                      {searchQuery ? 'No tickets match your search criteria.' : 'No tickets available.'}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket, index) => (
                    <tr
                      key={ticket.id}
                      className={`bg-gray-900 ${index % 2 === 0 ? 'bg-opacity-50' : 'bg-opacity-30'} hover:bg-gray-800 cursor-pointer transition-colors duration-150`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      {/* Map ticket data to the columns based on the image format */}
                      {/* Use index + 1 for numbering based on the filtered/sorted list */}
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{index + 1}</td>
                      {/* Ensure data access is safe, use N/A for missing data */}
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">
                        {extractNumericId(ticket.deviceId || ticket.systemId)}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{ticket.empName || 'N/A'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{ticket.floor || 'N/A'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{ticket.deviceId || ticket.systemId || 'N/A'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{ticket.issueType || ticket.type || 'N/A'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white max-w-[200px] truncate">{ticket.issue || ticket.description || 'N/A'}</td>
                      {/* Format dates safely */}
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{ticket.createdAt ? (ticket.createdAt instanceof Date ? ticket.createdAt : new Date(ticket.createdAt))?.toLocaleString() : 'N/A'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">
                        {ticket.resolvedAt ? (
                          new Date(ticket.resolvedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : 'N/A'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-red-500 text-white' :
                          ticket.status === 'in-progress' ? 'bg-yellow-500 text-white' :
                          ticket.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {ticket.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{ticket.assignedTo || 'N/A'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">{ticket.remark || (ticket.status === 'resolved' ? 'Solved' : '-')}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white whitespace-nowrap">
                        {ticket.status === 'resolved' ? getBuildingFromFloor(ticket.floor) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionFilters = [
  { type: 'WORKSTATION', label: 'Workstations', icon: <Monitor size={16} className="text-purple-400" /> },
  { type: 'MEETING_ROOM', label: 'Meeting Rooms', icon: <Users size={16} className="text-purple-400" /> },
  { type: 'MD_CABIN', label: 'MD Cabins', icon: <Award size={16} className="text-orange-400" /> },
  { type: 'TECHNICAL_WS', label: 'Technical WS', icon: <Cpu size={16} className="text-green-400" /> },
  { type: 'CONFERENCE', label: 'Conference', icon: <Phone size={16} className="text-red-400" /> },
  { type: 'TEAM_LEAD', label: 'Team Lead', icon: <Users size={16} className="text-yellow-400" /> }
];

// Function to handle saving the new device ID
const handleSaveNewDeviceId = (systemId, newId) => {
  console.log(`Saving new ID ${newId} for system ${systemId}`);
  // TODO: Implement logic to update the device ID in your data source (e.g., Firestore)
  // This will likely involve finding the system/device by its old ID and updating its ID.
  // You might also need to update related tickets if they reference the old ID.
  // For now, just logging the action.
};
