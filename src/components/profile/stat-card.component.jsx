export default function StatCard({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-5 text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}