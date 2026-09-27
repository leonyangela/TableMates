export default function StatCard({ label, value }) {
  return (
    <div className="border border-paper/15 p-5 text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-paper/60 mt-1">{label}</p>
    </div>
  );
}