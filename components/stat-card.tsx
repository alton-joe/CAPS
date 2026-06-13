type Props = {
  label: string;
  value: string;
  subtext: string;
};

export function StatCard({ label, value, subtext }: Props) {
  return (
    <article className="panel p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{subtext}</p>
    </article>
  );
}
