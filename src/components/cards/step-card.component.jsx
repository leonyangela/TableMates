export default function StepCard({
  icon: Icon,
  title,
  description,
  variant = "accent",
}) {
  const styles = {
    accent: { bg: "bg-accent", text: "" },
    primary: { bg: "bg-primary", text: "text-white" },
  };
  const s = styles[variant];

  return (
    <div className={`w-1/4 ${s.bg} rounded-lg relative p-4 mt-4`}>
      <div
        className={`left-0 -top-6 absolute rounded-full flex items-center justify-center w-12 h-12 ${s.bg} border border-white`}
      >
        <Icon className={s.text} />
      </div>
      <h1 className={`${s.text} pt-16 pb-2 font-bold text-left`}>{title}</h1>
      <p className={`${s.text} text-left`}>{description}</p>
    </div>
  );
}
