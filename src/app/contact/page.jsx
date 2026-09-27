import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import Section from "@/components/ui/section.component";
import Button from "@/components/button/button.component";
import { SUPPORT_EMAIL } from "@/lib/constants/contact.constants";

export const metadata = {
  title: "Contact | TableMates",
  description: "Get in touch with the TableMates team.",
};

export default function ContactPage() {
  return (
    <WrapperComponent>
      <PageHeader
        meta={["Company", "Contact"]}
        title="Say"
        muted="hello."
        intro="Questions, feedback or a problem with a booking: email us and a person will reply."
      />

      <div className="space-y-20 px-5 pb-20 md:px-10">
        <Section label="Email">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="break-all font-display text-[clamp(2rem,6vw,5rem)] font-semibold leading-none tracking-[-0.05em] transition hover:text-coffee-bean-300"
          >
            {SUPPORT_EMAIL}
          </a>
          <p className="mt-6 max-w-md text-sm leading-7 text-paper/60">
            For a booking, include the restaurant, date and time so we can
            find it quickly.
          </p>
        </Section>

        <Section label="Before you write">
          <div className="flex flex-wrap gap-4">
            <Button href="/faq" variant="outline">FAQ</Button>
            <Button href="/booking-help" variant="outline">Booking help</Button>
          </div>
        </Section>

        <Section label="Safety" note="If a diner makes you feel unsafe, report them from their profile. Reports go straight to our team.">
          <p className="max-w-xl text-base leading-7 text-paper/70">
            Open their profile from any table, choose Report, and pick a
            reason. You can also block them so you won&apos;t see each
            other&apos;s tables.
          </p>
        </Section>
      </div>
    </WrapperComponent>
  );
}
