import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/authStore";


export default function Expenses() {
  const [billItems, setBillItems] = useState({
    rent: 0,
    utilities: 0,
    internet: 0,
    subscriptions: 0,
    insurance: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  // Get month and year from URL or default to current
  const month = parseInt(searchParams.get('month')) || new Date().getMonth();
  const year = parseInt(searchParams.get('year')) || new Date().getFullYear();


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  useEffect(() => {
    fetchBudget();
  }, [month, year]);


  const fetchBudget = async () => {
    try {
      const res = await fetch(`https://ai-money-backend.vercel.app/api/budget?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBillItems(data.billItems || {
          rent: 0,
          utilities: 0,
          internet: 0,
          subscriptions: 0,
          insurance: 0
        });
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field, value) => {
    setBillItems({
      ...billItems,
      [field]: Number(value) || 0
    });
  };


  const totalBills = Object.values(billItems).reduce((sum, val) => sum + Number(val), 0);


  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('https://ai-money-backend.vercel.app/api/budget', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          bills: totalBills,
          billItems: billItems,
          month: month,
          year: year
        })
      });
      
      if (res.ok) {
        alert('Expenses updated successfully!');
        // Navigate back with the same month and year
        navigate(`/dashboard?month=${month}&year=${year}`);
      }
    } catch (err) {
      console.error('Error saving bills:', err);
      alert('Failed to save bills');
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-purple-950">Expenses</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>


        {/* Month/Year Display */}
        <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mb-6 text-center">
          <p className="text-purple-900 font-semibold">
            📅 {months[month]} {year}
          </p>
        </div>


        {/* Bills Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Monthly Expenses</h2>
                <p className="text-gray-500 text-sm">Track your recurring expenses</p>
              </div>
            </div>
          </div>


          <div className="space-y-4">
            {/* Bills Input Fields */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-4">Common Expenses:</h3>
              
              <div className="space-y-3">
                {/* Rent/Mortgage */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-purple-700 flex-shrink-0 w-40">
                    • Rent/Mortgage
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={billItems.rent || ''}
                      onChange={(e) => handleInputChange('rent', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Utilities */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-purple-700 flex-shrink-0 w-40">
                    • Utilities (Electricity, Water)
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={billItems.utilities || ''}
                      onChange={(e) => handleInputChange('utilities', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Internet & Phone */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-purple-700 flex-shrink-0 w-40">
                    • Internet & Phone
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={billItems.internet || ''}
                      onChange={(e) => handleInputChange('internet', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Subscriptions */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-purple-700 flex-shrink-0 w-40">
                    • Subscriptions
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={billItems.subscriptions || ''}
                      onChange={(e) => handleInputChange('subscriptions', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Insurance */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-purple-700 flex-shrink-0 w-40">
                    • Insurance Premiums
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={billItems.insurance || ''}
                      onChange={(e) => handleInputChange('insurance', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>


              {/* Total */}
              <div className="mt-4 pt-4 border-t-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-purple-900">Total Expenses:</span>
                  <span className="text-2xl font-bold text-purple-600">₹{totalBills.toLocaleString()}</span>
                </div>
              </div>
            </div>


            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Expenses'}
              </button>
              <button
                onClick={() => navigate(`/dashboard?month=${month}&year=${year}`)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
