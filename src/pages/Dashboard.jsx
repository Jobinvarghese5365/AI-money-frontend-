import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../store/authStore";
import BudgetOverviewCard from "../components/BudgetOverviewCard";
import AIBudgetAssistant from '../components/AIBudgetAssistant';

export default function Dashboard() {
  const [budget, setBudget] = useState({
    totalAmount: 0,
    bills: 0,
    debt: 0,
    savings: 0
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [searchParams] = useSearchParams();

  // Get month and year from URL
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const monthParam = searchParams.get('month');
    return monthParam !== null ? parseInt(monthParam) : new Date().getMonth();
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    const yearParam = searchParams.get('year');
    return yearParam !== null ? parseInt(yearParam) : new Date().getFullYear();
  });

  // Fetch budget whenever month/year changes
  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, selectedYear]);

  // Sync URL params with state
  useEffect(() => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    
    if (monthParam !== null) {
      setSelectedMonth(parseInt(monthParam));
    }
    if (yearParam !== null) {
      setSelectedYear(parseInt(yearParam));
    }
  }, [searchParams]);

  const fetchBudget = async () => {
    try {
      const res = await fetch(
        `https://ai-money-backend.vercel.app/api/budget?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setBudget(data);
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <BudgetOverviewCard 
        budget={budget}
        setBudget={setBudget}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        loading={loading}
      />
      
      {/* Only render AI Assistant when budget is loaded */}
      {!loading && budget && (
        <AIBudgetAssistant budget={budget} />
      )}
    </div>
  );
}
