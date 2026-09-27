import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import Section from "@/components/ui/section.component";
import Button from "@/components/button/button.component";
import { TABLE_VISIBILITY_OPTIONS } from "@/lib/constants/booking.constants";

export const metadata = {
  title: "How it works | TableMates",
  description:
    "Find a restaurant, book a table, and open the spare seats to other diners, or join theirs.",
};

const STEPS = [
  {
    title: "Discover",
    text: "Browse restaurants on the map or the list. Search by name or cuisine, and filter by price, trending or top rated.",
  },
  {
    title: "Book",
    text: "Open a restaurant, choose Book a table, then pick a date, time and how many seats you need. Your name, email and phone come from your profile.",
  },
  {
    title: "Share",
    text: "Keep the table private, or open the spare seats. Other diners can join straight away or ask you first, depending on how you set it up.",
  },
  {
    title: "Remember",
    text: "Every table you host or join lands in your dining journey. Afterwards, rate the people you shared it with.",
  },
];

export default function HowItWorksPage() {
  return (
    <WrapperComponent>
      <PageHeader
        meta={["How it works"]}
        title="Book a table."
        muted="Share the rest."
        intro="TableMates is a restaurant booking app with one difference: the seats you don't need can go to other diners."
      />

      <div className="space-y-20 px-5 pb-20 md:px-10">
        <Section label="Four steps">
          <ol>
            {STEPS.map(({ title, text }, index) => (
              <li
                key={title}
                className="grid gap-3 border-t border-paper/10 py-8 first:border-t-0 first:pt-0 md:grid-cols-[4rem_1fr_1.2fr] md:gap-8"
              >
                <span className="font-meta text-[11px] text-paper/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.045em] md:text-5xl">
                  {title}
                </h2>
                <p className="max-w-md text-sm leading-7 text-paper/70">{text}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          label="Who can sit with you"
          note="You choose when you book. An open table can't be made private again later."
        >
          <dl>
            {TABLE_VISIBILITY_OPTIONS.map(({ key, label, description }) => (
              <div key={key} className="grid gap-2 border-t border-paper/10 py-5 first:border-t-0 first:pt-0 md:grid-cols-2 md:gap-8">
                <dt className="font-display text-2xl tracking-[-0.03em]">{label}</dt>
                <dd className="text-sm leading-7 text-paper/70">{description}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section label="Joining a table">
          <p className="max-w-2xl font-display text-2xl leading-snug tracking-[-0.02em] text-paper/85 md:text-3xl">
            Community dining lists the open tables other diners are hosting.
            Public ones you can join right away; for the rest, send a short
            note and the host decides.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/restaurants" arrow>
              Find a table
            </Button>
            <Button href="/booking-help" variant="outline">
              Booking help
            </Button>
          </div>
        </Section>
      </div>
    </WrapperComponent>
  );
}
