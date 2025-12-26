import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/authStore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function BudgetOverviewCard({
  budget,
  setBudget,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  loading,
}) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  // Update URL when month or year changes
  useEffect(() => {
    const currentMonth = searchParams.get("month");
    const currentYear = searchParams.get("year");

    if (
      currentMonth !== String(selectedMonth) ||
      currentYear !== String(selectedYear)
    ) {
      setSearchParams(
        { month: String(selectedMonth), year: String(selectedYear) },
        { replace: true }
      );
    }
  }, [selectedMonth, selectedYear, searchParams, setSearchParams]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const remaining =
    budget.totalAmount - budget.bills - budget.debt - budget.savings;

  // Chart data with custom colors matching the image
  const chartData = [
    {
      name: "Expenses",
      value: budget.bills,
      color: "#a855f7",
      percentage: ((budget.bills / budget.totalAmount) * 100).toFixed(0),
    },
    {
      name: "Debt",
      value: budget.debt,
      color: "#ef4444",
      percentage: ((budget.debt / budget.totalAmount) * 100).toFixed(0),
    },
    {
      name: "Savings",
      value: budget.savings,
      color: "#10b981",
      percentage: ((budget.savings / budget.totalAmount) * 100).toFixed(0),
    },
    {
      name: "Remaining",
      value: Math.max(0, remaining),
      color: "#3b82f6",
      percentage: ((remaining / budget.totalAmount) * 100).toFixed(0),
    },
  ].filter((item) => item.value > 0);

  // Custom label for pie chart center
  const renderCustomLabel = ({ cx, cy }) => {
    return (
      <>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="14"
          fontWeight="500"
        >
          Total
        </text>
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fill="#111827"
          fontSize="24"
          fontWeight="700"
        >
          ₹{budget.totalAmount.toLocaleString()}
        </text>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* Header with Month/Year Selection */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Left: Title and Welcome */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Budget Dashboard
            </h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
          </div>

          {/* Center: Month and Year Selection */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 text-sm"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Total Budget Card - Editable */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Total Budget</p>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-900 text-3xl sm:text-4xl font-bold">
                ₹
              </span>
              <input
                type="number"
                value={budget.totalAmount || ""}
                onChange={(e) =>
                  setBudget({
                    ...budget,
                    totalAmount: Number(e.target.value) || 0,
                  })
                }
                onBlur={async () => {
                  try {
                    await fetch("http://localhost:5000/api/budget", {
                      method: "PUT",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        totalAmount: Number(budget.totalAmount) || 0,
                        month: selectedMonth,
                        year: selectedYear,
                      }),
                    });
                  } catch (err) {
                    console.error("Error saving total budget:", err);
                  }
                }}
                className="w-full pl-8 sm:pl-10 pr-4 py-2 text-3xl sm:text-5xl font-bold text-gray-900 bg-transparent border-none focus:outline-none"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500 italic mt-2">
              Click on the amount to edit your total budget
            </p>
          </div>
          <button className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Cards Grid - Matching reference image */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expenses Card */}
        <div
          onClick={() =>
            navigate(`/expenses?month=${selectedMonth}&year=${selectedYear}`)
          }
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-700">Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{budget.bills.toLocaleString()}
          </p>
        </div>

        {/* Debt Card */}
        <div
          onClick={() =>
            navigate(`/debt?month=${selectedMonth}&year=${selectedYear}`)
          }
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-700">Debt</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{budget.debt.toLocaleString()}
          </p>
        </div>

        {/* Savings Card - Plain white like others */}
        <div
          onClick={() =>
            navigate(`/savings?month=${selectedMonth}&year=${selectedYear}`)
          }
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-700">Savings</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{budget.savings.toLocaleString()}
          </p>
        </div>

        {/* Remaining Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                remaining >= 0 ? "bg-blue-100" : "bg-orange-100"
              }`}
            >
              <svg
                className={`w-6 h-6 ${
                  remaining >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-700">Remaining</h3>
          </div>
          <p
            className={`text-2xl font-bold ${
              remaining >= 0 ? "text-gray-900" : "text-orange-600"
            }`}
          >
            ₹{Math.abs(remaining).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Allocation Summary Chart - Donut style like reference */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Allocation Summary
        </h3>

        {chartData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Donut Chart */}
            <div className="w-full lg:w-1/2 max-w-md">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <text>{renderCustomLabel({ cx: 150, cy: 150 })}</text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Matching reference style */}
            <div className="w-full lg:w-1/2 space-y-3">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}: ₹{item.value.toLocaleString()} (
                      {item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center">
            <p className="text-gray-400 text-center px-4">
              No budget data to display. Start by adding your budget amounts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
