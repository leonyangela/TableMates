import FooterLink from "./footer-link.component";

const FooterColumn = ({ title, links }) => {
  return (
    <div className="w-1/4">
      <h2 className="pb-6 text-xl font-bold">{title}</h2>

      {links.map((link) => (
        <FooterLink key={link.href} {...link} />
      ))}
    </div>
  );
};

export default FooterColumn;
