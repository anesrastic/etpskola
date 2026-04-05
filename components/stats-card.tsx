interface StatsCardProps {
  label: string;
  value: string | number;
  color?: "green" | "red" | "default";
}

export function StatsCard({ label, value, color = "default" }: StatsCardProps) {
  const borderColor = {
    green: "border-l-green-500",
    red: "border-l-red-500",
    default: "border-l-brand-600",
  }[color];

  const valueColor = {
    green: "text-green-600",
    red: "text-red-500",
    default: "text-brand-900",
  }[color];

  return (
    <div className={`bg-white rounded-xl p-4 border-l-4 ${borderColor} shadow-sm`}>
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}
