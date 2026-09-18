export default function FeatureCard({ Icon, title, description }) {
  return (
    <div className="w-1/6">
      {Icon && <Icon className="w-6 h-6 text-gray-700" />}
      <h1 className="pt-2 pb-6 font-bold">{title}</h1>
      <p>{description}</p>
    </div>
  );
}
