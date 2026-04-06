interface StatsTableProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  totalRow?: (string | number)[];
}

export function StatsTable({ title, headers, rows, totalRow }: StatsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-brand-900 text-sm">{title}</h2>
      </div>
      <table className="w-full min-w-[400px] text-sm">
        <thead>
          <tr className="bg-brand-50 border-b border-brand-100">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-4 py-2 font-medium text-slate-500 ${i === 0 ? "text-left" : "text-right"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-t border-slate-50 ${ri % 2 === 1 ? "bg-slate-50/40" : ""}`}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-2 ${ci === 0 ? "text-left text-slate-700" : "text-right text-slate-600 tabular-nums"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {totalRow && (
            <tr className="border-t-2 border-brand-200 bg-brand-50 font-semibold">
              {totalRow.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-2 ${ci === 0 ? "text-left text-brand-900" : "text-right text-brand-900 tabular-nums"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
