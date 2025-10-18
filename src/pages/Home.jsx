import BudgetOverviewCard from "../components/BudgetOverviewCard";

export default function Home() {
  return (
    <div style={{maxWidth: 1100, margin: "0 auto", padding: 16, display:"grid", gap:16}}>
      <BudgetOverviewCard />
    </div>
  );
}
