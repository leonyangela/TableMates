export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="w-1/6">
      <Icon size={28} className="mt-8" />
      <h1 className="pt-2 pb-6 font-bold">{title}</h1>
      <p>{description}</p>
    </div>
  );
}