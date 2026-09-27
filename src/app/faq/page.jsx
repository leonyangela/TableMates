import Link from "next/link";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import Section from "@/components/ui/section.component";
import FaqList from "@/components/ui/faq-list.component";

export const metadata = {
  title: "FAQ | TableMates",
  description: "Answers to common questions about accounts, open tables, privacy and safety on TableMates.",
};

const inlineLink = "text-paper underline decoration-coffee-bean-400 underline-offset-4 hover:text-coffee-bean-300";

const GROUPS = [
  {
    label: "Your account",
    items: [
      {
        question: "Do I need an account to browse?",
        answer: "No. Anyone can browse restaurants and the map. You need an account to book a table, join one, or see community dining.",
      },
      {
        question: "I didn't get the verification email.",
        answer: "We send a verification link when you sign up. If it didn't arrive, you can resend it from your profile page.",
      },
      {
        question: "Can I change my details later?",
        answer: (
          <>
            Yes. Your name, phone, photo, about, interests and dietary
            preferences can all be edited on your{" "}
            <Link href="/profile" className={inlineLink}>profile</Link>.
          </>
        ),
      },
    ],
  },
  {
    label: "Open tables",
    items: [
      {
        question: "What is an open table?",
        answer: "A booking where the host has opened the seats they don't need to other diners. Public tables can be joined instantly; approval tables need the host to accept you first.",
      },
      {
        question: "Can I bring a friend when I join?",
        answer: "Yes. Choose how many seats you need when you join or request, up to the seats that are left.",
      },
      {
        question: "What happens after I send a request?",
        answer: "The host sees it with your note and can accept or decline. You get a notification either way, and until they answer you can edit or withdraw it.",
      },
    ],
  },
  {
    label: "Privacy and safety",
    items: [
      {
        question: "What do other diners see about me?",
        answer: "Your name, photo, about, interests, dietary preferences and an overall rating from people you've dined with. Your phone and email are never shown to other diners.",
      },
      {
        question: "How do ratings work?",
        answer: "After a table, everyone who was there can rate each other: whether they showed up, whether it was good company, and whether they'd dine together again. Answers are private; people only see an overall score.",
      },
      {
        question: "How do I report or block someone?",
        answer: "Open their profile from any table and choose Report or Block. Blocking means neither of you can join the other's tables, and they aren't notified.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <WrapperComponent>
      <PageHeader
        meta={["Support", "FAQ"]}
        title="Questions,"
        muted="answered."
        intro={
          <>
            Short answers to what people ask most. For bookings, see{" "}
            <Link href="/booking-help" className={inlineLink}>booking help</Link>.
          </>
        }
      />

      <div className="space-y-16 px-5 pb-20 md:px-10">
        {GROUPS.map(({ label, items }) => (
          <Section key={label} label={label}>
            <FaqList items={items} />
          </Section>
        ))}
      </div>
    </WrapperComponent>
  );
}
