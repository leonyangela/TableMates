import { META } from "./styles";

/** Small uppercase metadata label. `tone` dims it (default) or not. */
export default function MetaLabel({ as: Tag = "p", tone = "muted", className = "", children, ...props }) {
  const color = tone === "accent" ? "text-coffee-bean-300" : tone === "strong" ? "text-paper" : "text-paper/55";
  return (
    <Tag className={`${META} ${color} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
