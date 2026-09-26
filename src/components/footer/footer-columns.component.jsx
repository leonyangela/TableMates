import FooterLink from "./footer-link.component";

const FooterColumn = ({ title, links }) => {
  return (
    <div>
      <h2 className="pb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {title}
      </h2>

      <ul className="space-y-2.5">
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
