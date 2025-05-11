import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minimize2, Maximize2 } from "lucide-react";

const ChatbotMessage = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-purple-500 text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}>
        {message.text}
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your IT Help Desk assistant. How can I help you today?", isUser: false }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    
    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setMessage("");
    
    // Show bot is typing
    setIsTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      let botResponse;
      
      const userMsg = message.toLowerCase();
      
      if (userMsg.includes("password") && userMsg.includes("reset")) {
        botResponse = "To reset your password, please go to the login page and click on 'Forgot Password'. You'll receive an email with instructions to reset your password.";
      } else if (userMsg.includes("wifi") || userMsg.includes("network") || userMsg.includes("internet")) {
        botResponse = "For network or WiFi issues, try restarting your router first. If the problem persists, please create a new ticket with the IT department.";
      } else if (userMsg.includes("printer") || userMsg.includes("printing")) {
        botResponse = "For printer issues, check if it's properly connected and has paper. If you still face problems, please create a ticket with the details of the error message.";
      } else if (userMsg.includes("software") || userMsg.includes("install")) {
        botResponse = "For software installation requests, please create a new ticket specifying the software name and why you need it. Our IT team will review and assist you.";
      } else if (userMsg.includes("ticket") && userMsg.includes("create")) {
        botResponse = "To create a new ticket, click on the 'Create Ticket' option in the sidebar menu or use the '+' button on the dashboard.";
      } else if (userMsg.includes("status") && userMsg.includes("ticket")) {
        botResponse = "You can check the status of your tickets in the 'Tickets' section accessible from the sidebar menu.";
      } else if (userMsg.includes("hello") || userMsg.includes("hi") || userMsg.includes("hey")) {
        botResponse = "Hello! How can I assist you with your IT needs today?";
      } else if (userMsg.includes("thank")) {
        botResponse = "You're welcome! Feel free to reach out if you need any further assistance.";
      } else {
        botResponse = "I'm not sure I understand your query. Could you please create a ticket with details of your issue so our IT team can assist you better?";
      }
      
      setMessages(prev => [...prev, { text: botResponse, isUser: false }]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        className="fixed bottom-6 right-6 bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 transition-colors duration-300 z-50"
        onClick={toggleChatbot}
      >
        <MessageSquare size={24} />
      </button>
      
      {/* Chatbot Window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 bg-white rounded-lg shadow-xl z-50 transition-all duration-300 w-80 md:w-96 ${
          isMinimized ? 'h-14' : 'h-96'
        }`}>
          {/* Header */}
          <div className="bg-purple-500 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              <h3 className="font-medium">IT Help Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={toggleMinimize} className="hover:bg-purple-600 p-1 rounded">
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={toggleChatbot} className="hover:bg-purple-600 p-1 rounded">
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="p-4 h-64 overflow-y-auto">
                {messages.map((msg, index) => (
                  <ChatbotMessage key={index} message={msg} isUser={msg.isUser} />
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="border-t p-3 flex items-center">
                <input
                  type="text"
                  className="flex-1 border rounded-l-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="bg-purple-500 text-white px-4 py-2 rounded-r-md hover:bg-purple-600"
                  onClick={handleSendMessage}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
