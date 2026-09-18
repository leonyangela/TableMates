export default function StepCard({
  icon: Icon,
  title,
  description,
  variant = "primary",
}) {
  const styles = {
    accent: {
      bg: "bg-accent",
      text: "text-black",
      border: "border border-olive-500",
    },
    primary: {
      bg: "bg-primary",
      text: "text-white",
      border: "border border-white",
    },
  };

  const s = styles[variant];

  return (
    <div className={`w-full ${s.bg} rounded-lg relative p-4 flex gap-2 `}>
      <div
        className={`rounded-full flex items-center justify-center w-8 h-8 ${s.bg} ${s.border} `}
      >
        <Icon size={20} className={s.text} />
      </div>
      <div className="w-[calc(100%-2rem)]">
        <h1 className={`${s.text} text-base font-bold text-left`}>{title}</h1>
        <p className={`${s.text} text-sm text-left`}>{description}</p>
      </div>
    </div>
  );
}
