export default function FeatureCard({ title, description }) {
  return (
    <div className="w-1/6">
      <h1 className="pt-2 pb-6 font-bold">{title}</h1>
      <p>{description}</p>
    </div>
  );
}