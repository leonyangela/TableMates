import Logo from "@/components/logo/logo.component";
import FooterColumn from "./footer-columns.component";
import { FOOTER_LINKS } from "@/components/footer/footer.constants";

export default function Footer() {
  return (
    <div className="bg-primary text-white flex flex-row gap-20 p-10">
      <div className="w-1/5 flex flex-col justify-between gap-20">
        <Logo />
        <h1 className="pt-2 text-sm">
          &#169; 2026 All rights reserved. Helping you find and book great
          dining experiences, effortlessly.
        </h1>
      </div>

      <div className="w-4/5 flex flex-row justify-between">
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <FooterColumn key={links} title={title} links={links} />
        ))}
      </div>
    </div>
  );
}
