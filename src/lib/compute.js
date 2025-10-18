export function computeSummary({ totalAmount=0, bills=0, debt=0, savings=0 }) {
  const planned = bills + debt + savings;
  const left = Math.max(totalAmount - planned, 0);
  const safeTotal = Math.max(totalAmount, 1);
  const pct = (v) => Math.round((v / safeTotal) * 100);
  return {
    left,
    parts: [
      { name: "Bills", value: bills, pct: pct(bills) },
      { name: "Debt", value: debt, pct: pct(debt) },
      { name: "Savings", value: savings, pct: pct(savings) },
      { name: "Left", value: left, pct: pct(left) },
    ],
  };
}
