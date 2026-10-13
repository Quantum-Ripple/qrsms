export const levelClass = (level) =>
  ({
    EE: 'bg-emerald-100 text-emerald-800',
    ME: 'bg-blue-100 text-blue-800',
    AE: 'bg-amber-100 text-amber-800',
    BE: 'bg-red-100 text-red-800',
  }[level?.slice(0, 2)] ?? 'bg-slate-100 text-slate-600')