import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/authStore";


export default function Savings() {
  const [savingsItems, setSavingsItems] = useState({
    emergencyFund: 0,
    retirement: 0,
    investment: 0,
    fixedDeposit: 0,
    goalBased: 0
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
        setSavingsItems(data.savingsItems || {
          emergencyFund: 0,
          retirement: 0,
          investment: 0,
          fixedDeposit: 0,
          goalBased: 0
        });
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field, value) => {
    setSavingsItems({
      ...savingsItems,
      [field]: Number(value) || 0
    });
  };


  const totalSavings = Object.values(savingsItems).reduce((sum, val) => sum + Number(val), 0);


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
          savings: totalSavings,
          savingsItems: savingsItems,
          month: month,
          year: year
        })
      });
      
      if (res.ok) {
        alert('Savings updated successfully!');
        // Navigate back with the same month and year
        navigate(`/dashboard?month=${month}&year=${year}`);
      }
    } catch (err) {
      console.error('Error saving savings:', err);
      alert('Failed to save savings');
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
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-green-950">Savings</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>


        {/* Month/Year Display */}
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-6 text-center">
          <p className="text-green-900 font-semibold">
            📅 {months[month]} {year}
          </p>
        </div>


        {/* Savings Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Total Savings</h2>
                <p className="text-gray-500 text-sm">Build your financial future</p>
              </div>
            </div>
          </div>


          <div className="space-y-4">
            {/* Savings Input Fields */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-4">Savings Goals Include:</h3>
              
              <div className="space-y-3">
                {/* Emergency Fund */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-green-700 flex-shrink-0 w-48">
                    • Emergency Fund
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={savingsItems.emergencyFund || ''}
                      onChange={(e) => handleInputChange('emergencyFund', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Retirement Savings */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-green-700 flex-shrink-0 w-48">
                    • Retirement Savings
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={savingsItems.retirement || ''}
                      onChange={(e) => handleInputChange('retirement', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Investment Accounts */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-green-700 flex-shrink-0 w-48">
                    • Investment Accounts
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={savingsItems.investment || ''}
                      onChange={(e) => handleInputChange('investment', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Fixed Deposits */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-green-700 flex-shrink-0 w-48">
                    • Fixed Deposits
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={savingsItems.fixedDeposit || ''}
                      onChange={(e) => handleInputChange('fixedDeposit', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Goal-based Savings */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-green-700 flex-shrink-0 w-48">
                    • Goal-based Savings
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={savingsItems.goalBased || ''}
                      onChange={(e) => handleInputChange('goalBased', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>


              {/* Total */}
              <div className="mt-4 pt-4 border-t-2 border-green-300">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-green-900">Total Savings:</span>
                  <span className="text-2xl font-bold text-green-600">₹{totalSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>


            {totalSavings > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>🎯 Great job!</strong> You're building your financial security. Keep up the good work!
                </p>
              </div>
            )}


            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Savings'}
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
