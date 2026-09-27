import FooterLink from "./footer-link.component";
import MetaLabel from "@/components/ui/meta-label.component";

const FooterColumn = ({ title, links }) => {
  return (
    <div>
      <MetaLabel as="h2" className="pb-5">
        {title}
      </MetaLabel>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterColumn;
