import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import Section from "@/components/ui/section.component";
import FaqList from "@/components/ui/faq-list.component";
import Button from "@/components/button/button.component";
import { REPEAT_OCCURRENCES } from "@/lib/constants/social.constants";

export const metadata = {
  title: "Booking help | TableMates",
  description: "How to book a table, open it to other diners, and change or cancel it on TableMates.",
};

const STEPS = [
  "Find a restaurant on the restaurants page and open it.",
  "Choose Book a table (you'll be asked to log in first if you aren't).",
  "Pick a date, a time the restaurant is open, and how many seats you need.",
  "Choose who can join: private, open with approval, or open to everyone.",
  "Check your name, phone and email (filled in from your profile) and confirm.",
];

const QUESTIONS = [
  {
    question: "Where do I see my bookings?",
    answer: "In your dining journey. Every table you host or join is listed there, with its status and details.",
  },
  {
    question: "Can I change a booking?",
    answer: "Hosts can manage an upcoming table from the dining journey or community dining. The date and time can't be changed once booked; to move it, cancel and book again.",
  },
  {
    question: "Can I make a private table open later?",
    answer: "Yes, you can open it up to others. It only works one way: once a table is open it can't go back to private.",
  },
  {
    question: "How do I cancel?",
    answer: "Hosts can cancel an upcoming table from the dining journey; everyone who joined or requested is notified. Guests can leave a table instead, and their seats go back to the host.",
  },
  {
    question: "Can I book the same table every week?",
    answer: `Yes. When booking, set it to repeat every week, every two weeks or every month, for ${REPEAT_OCCURRENCES.min} to ${REPEAT_OCCURRENCES.max} dates.`,
  },
  {
    question: "Can guests change how many seats they have?",
    answer: "Yes. A guest can ask for more or fewer seats from the table's details; the host approves the change.",
  },
];

export default function BookingHelpPage() {
  return (
    <WrapperComponent>
      <PageHeader
        meta={["Support", "Booking help"]}
        title="Booking,"
        muted="step by step."
        intro="Everything about making, sharing and changing a booking."
      />

      <div className="space-y-20 px-5 pb-20 md:px-10">
        <Section label="Book a table">
          <ol className="max-w-2xl">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-6 border-t border-paper/10 py-5 first:border-t-0 first:pt-0">
                <span className="font-display text-3xl font-semibold leading-none tracking-[-0.05em] text-coffee-bean-400">
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-7 text-paper/80">{step}</p>
              </li>
            ))}
          </ol>
          <Button href="/restaurants" arrow className="mt-8">
            Find a restaurant
          </Button>
        </Section>

        <Section label="Changes and cancellations">
          <FaqList items={QUESTIONS} />
        </Section>

        <Section label="Still stuck?">
          <p className="max-w-xl text-base leading-7 text-paper/70">
            Check the FAQ, or get in touch and we&apos;ll help.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button href="/faq" variant="outline">FAQ</Button>
            <Button href="/contact" variant="link">Contact us</Button>
          </div>
        </Section>
      </div>
    </WrapperComponent>
  );
}
