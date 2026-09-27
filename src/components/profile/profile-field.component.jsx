import MetaLabel from "@/components/ui/meta-label.component";

/** One read-only profile detail: small label, value in the display face. */
export default function ProfileField({ label, value, wide = false }) {
  return (
    <div className={`border-t border-paper/10 py-5 ${wide ? "md:col-span-2" : ""}`}>
      <MetaLabel as="dt">{label}</MetaLabel>
      <dd className={`mt-2 font-display text-xl tracking-[-0.02em] ${value ? "text-paper" : "text-paper/35"}`}>
        {value || "Not added yet"}
      </dd>
    </div>
  );
}
