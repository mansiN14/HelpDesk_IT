import React, { useState } from 'react';
import { Menu, Clock, Users } from 'lucide-react';

// Header Component
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

// Individual Number Box Component
function NumberBox({ number, isSelected, onClick }) {
  return (
    <div 
      className={`
        w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl
        border-2 transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 scale-105' 
          : 'bg-gray-700 border-blue-500 hover:bg-gray-600 hover:scale-102'
        }
      `}
      onClick={onClick}
    >
      {number}
    </div>
  );
}

// Pair Display Component
function PairDisplay({ leftNumber, rightNumber, selectedNumbers, onNumberClick, pairId }) {
  return (
    <div className="flex items-center justify-center">
      {/* Left Box */}
      <NumberBox
        number={leftNumber}
        isSelected={selectedNumbers.includes(`${pairId}-left`)}
        onClick={() => onNumberClick(`${pairId}-left`, leftNumber)}
      />
      
      {/* Connection Line */}
      <div className="flex items-center mx-2">
        <div className="h-0.5 w-6 bg-blue-500"></div>
        <div className="text-blue-400 font-bold mx-1">H</div>
        <div className="h-0.5 w-6 bg-blue-500"></div>
      </div>
      
      {/* Right Box */}
      <NumberBox
        number={rightNumber}
        isSelected={selectedNumbers.includes(`${pairId}-right`)}
        onClick={() => onNumberClick(`${pairId}-right`, rightNumber)}
      />
    </div>
  );
}

// Main Floor View Component
function FloorMap() {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sample data - 4 rows x 7 columns of connection pairs
  const connectionPairs = [
    // Row 1
    [
      { left: 35, right: 36 }, { left: 21, right: 22 }, { left: 45, right: 46 },
      { left: 51, right: 52 }, { left: 61, right: 62 }, { left: 71, right: 72 },
      { left: 81, right: 82 }
    ],
    // Row 2
    [
      { left: 33, right: 34 }, { left: 20, right: 18 }, { left: 43, right: 44 },
      { left: 49, right: 50 }, { left: 59, right: 60 }, { left: 69, right: 70 },
      { left: 79, right: 80 }
    ],
    // Row 3
    [
      { left: 31, right: 32 }, { left: 19, right: 16 }, { left: 41, right: 42 },
      { left: 47, right: 48 }, { left: 57, right: 58 }, { left: 67, right: 68 },
      { left: 77, right: 78 }
    ],
    // Row 4
    [
      { left: 37, right: 38 }, { left: 13, right: 11 }, { left: 39, right: 40 },
      { left: 45, right: 46 }, { left: 55, right: 56 }, { left: 65, right: 66 },
      { left: 75, right: 76 }
    ]
  ];

  const user = { email: "admin@company.com" };
  
  const handleNumberClick = (numberId, number) => {
    setSelectedNumbers(prev => 
      prev.includes(numberId) 
        ? prev.filter(id => id !== numberId)
        : [...prev, numberId]
    );
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header 
        user={user} 
        onLogout={() => console.log('Logout clicked')}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Network Floor Plan</h2>
            <p className="text-gray-400">Click on connection pairs to view details</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-8">
            {connectionPairs.map((row, rowIndex) => (
              row.map((pair, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="flex justify-center">
                  <PairDisplay
                    leftNumber={pair.left}
                    rightNumber={pair.right}
                    selectedNumbers={selectedNumbers}
                    onNumberClick={handleNumberClick}
                    pairId={`${rowIndex}-${colIndex}`}
                  />
                </div>
              ))
            ))}
          </div>
          
          {/* Selected Numbers Info */}
          {selectedNumbers.length > 0 && (
            <div className="mt-8 p-6 bg-blue-900/30 border border-blue-500/30 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Selected Numbers</h3>
              <p className="text-gray-300 mb-4">
                Selected: {selectedNumbers.map(id => {
                  const [pairId, position] = id.split('-');
                  const [rowIndex, colIndex] = pairId.split('-');
                  const pair = connectionPairs[parseInt(rowIndex)][parseInt(colIndex)];
                  return position === 'left' ? pair.left : pair.right;
                }).join(', ')}
              </p>
              <div className="mt-4 flex space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Test Selected
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  View Details
                </button>
                <button 
                  onClick={() => setSelectedNumbers([])}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FloorMap; 
