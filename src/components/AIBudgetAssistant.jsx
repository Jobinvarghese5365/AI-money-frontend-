import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/authStore';

export default function AIBudgetAssistant({ budget }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: '👋 Hello! I\'m your AI Budget Assistant powered by Groq. I can help you with:\n\n• Budget planning and advice\n• Expense management tips\n• Savings strategies\n• Debt management\n\nWhat would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Validate budget prop
  const getBudgetData = () => {
    return {
      totalAmount: budget?.totalAmount || 0,
      bills: budget?.bills || 0,
      debt: budget?.debt || 0,
      savings: budget?.savings || 0
    };
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    if (!input || !budget) {
      setError('Message and budget data are required');
      return;
    }

    const userMessage = input.trim();
    const userMsg = { role: 'user', content: userMessage };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      console.log('Sending request with budget:', getBudgetData());

      const response = await fetch('https://ai-money-backend.vercel.app/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          budgetData: getBudgetData()
        })
      });

      const data = await response.json();
      console.log('AI Response:', data);

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: data.response
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat Error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick questions
  const quickQuestions = [
    'How can I save more money?',
    'Is my budget healthy?',
    'Where should I reduce spending?',
    'Tips for managing debt?',
    'What\'s the 50/30/20 rule?'
  ];

  // Clear chat
  const clearChat = async () => {
    try {
      await fetch('http://localhost:5000/api/ai/chat/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessages([{
        role: 'ai',
        content: '🔄 Chat cleared! How can I help you with your budget today?'
      }]);
    } catch (err) {
      console.error('Clear chat error:', err);
    }
  };

  // Show warning if budget data is missing
  if (!budget) {
    return (
      <div className="fixed bottom-6 right-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg z-50">
        <p className="text-yellow-800 text-sm">
          ⚠️ Loading budget data...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Floating Chat Button - Responsive positioning */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl sm:text-3xl z-50 transition-all hover:scale-110 animate-bounce"
          style={{ animationDuration: '2s' }}
          title="AI Budget Assistant"
        >
          🤖
        </button>
      )}

      {/* Chat Widget - Fully Responsive */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full h-full sm:w-[420px] sm:h-[650px] md:w-[480px] md:h-[700px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 sm:border-2 sm:border-emerald-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white p-3 sm:p-4 sm:rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl sm:text-2xl animate-pulse">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">AI Budget Assistant</h3>
                <p className="text-xs text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  Powered by Groq
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-white hover:text-gray-200 text-lg sm:text-xl p-1"
                title="Clear Chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-2xl sm:text-3xl p-1"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Budget Summary - Responsive grid */}
          <div className="bg-emerald-50 border-b-2 border-emerald-200 p-2 sm:p-3 text-xs">
            <p className="text-emerald-800 font-semibold mb-1">Your Current Budget:</p>
            <div className="grid grid-cols-2 gap-1 sm:gap-2 text-emerald-700">
              <span className="truncate">Income: ₹{getBudgetData().totalAmount.toLocaleString()}</span>
              <span className="truncate">Expenses: ₹{getBudgetData().bills.toLocaleString()}</span>
              <span className="truncate">Debt: ₹{getBudgetData().debt.toLocaleString()}</span>
              <span className="truncate">Savings: ₹{getBudgetData().savings.toLocaleString()}</span>
            </div>
          </div>

          {/* Messages Container - Responsive spacing */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-600 to-green-600 text-white rounded-br-sm'
                      : 'bg-white border-2 border-emerald-200 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Animation */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-emerald-200 p-3 sm:p-4 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - Responsive layout */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 sm:px-4 pb-2 border-t-2 border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">💡 Quick questions:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {quickQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Responsive */}
          <div className="p-3 sm:p-4 border-t-2 border-gray-200 bg-gray-50 safe-area-bottom">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your budget..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 outline-none text-xs sm:text-sm resize-none"
                rows="2"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg sm:text-xl transition-all hover:scale-105 self-end flex-shrink-0"
                title="Send Message"
              >
                ➤
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Free AI powered by Groq • {messages.length} messages
            </p>
          </div>
        </div>
      )}
    </>
  );
}
