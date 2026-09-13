export default function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}