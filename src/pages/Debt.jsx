import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/authStore";


export default function Debt() {
  const [debtItems, setDebtItems] = useState({
    creditCard: 0,
    personalLoan: 0,
    carLoan: 0,
    studentLoan: 0,
    homeLoan: 0
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
      const res = await fetch(`http://localhost:5000/api/budget?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDebtItems(data.debtItems || {
          creditCard: 0,
          personalLoan: 0,
          carLoan: 0,
          studentLoan: 0,
          homeLoan: 0
        });
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field, value) => {
    setDebtItems({
      ...debtItems,
      [field]: Number(value) || 0
    });
  };


  const totalDebt = Object.values(debtItems).reduce((sum, val) => sum + Number(val), 0);


  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/budget', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          debt: totalDebt,
          debtItems: debtItems,
          month: month,
          year: year
        })
      });
      
      if (res.ok) {
        alert('Debt updated successfully!');
        // Navigate back with the same month and year
        navigate(`/dashboard?month=${month}&year=${year}`);
      }
    } catch (err) {
      console.error('Error saving debt:', err);
      alert('Failed to save debt');
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
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-red-950">Debt</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>


        {/* Month/Year Display */}
        <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-6 text-center">
          <p className="text-red-900 font-semibold">
            📅 {months[month]} {year}
          </p>
        </div>


        {/* Debt Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Total Debt</h2>
                <p className="text-gray-500 text-sm">Manage your outstanding debts</p>
              </div>
            </div>
          </div>


          <div className="space-y-4">
            {/* Debt Input Fields */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-4">Common Debts Include:</h3>
              
              <div className="space-y-3">
                {/* Credit Card Debt */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-red-700 flex-shrink-0 w-40">
                    • Credit Card Debt
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={debtItems.creditCard || ''}
                      onChange={(e) => handleInputChange('creditCard', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Personal Loans */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-red-700 flex-shrink-0 w-40">
                    • Personal Loans
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={debtItems.personalLoan || ''}
                      onChange={(e) => handleInputChange('personalLoan', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Car Loans */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-red-700 flex-shrink-0 w-40">
                    • Car Loans
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={debtItems.carLoan || ''}
                      onChange={(e) => handleInputChange('carLoan', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Student Loans */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-red-700 flex-shrink-0 w-40">
                    • Student Loans
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={debtItems.studentLoan || ''}
                      onChange={(e) => handleInputChange('studentLoan', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* Home Loans/Mortgage */}
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-red-700 flex-shrink-0 w-40">
                    • Home Loans/Mortgage
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={debtItems.homeLoan || ''}
                      onChange={(e) => handleInputChange('homeLoan', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>


              {/* Total */}
              <div className="mt-4 pt-4 border-t-2 border-red-300">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-red-900">Total Debt:</span>
                  <span className="text-2xl font-bold text-red-600">₹{totalDebt.toLocaleString()}</span>
                </div>
              </div>
            </div>


            {totalDebt > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> Focus on paying off high-interest debts first to save money on interest payments.
                </p>
              </div>
            )}


            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Debt'}
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
