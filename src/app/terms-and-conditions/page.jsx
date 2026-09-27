import Link from "next/link";

import LegalDocument from "@/components/ui/legal-document.component";
import { LEGAL } from "@/lib/constants/legal.constants";
import { SUPPORT_EMAIL } from "@/lib/constants/contact.constants";

export const metadata = {
  title: "Terms & Conditions | TableMates",
  description: "The terms for using TableMates to book and share restaurant tables.",
};

const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

const SECTIONS = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <p>
        These terms apply when you use TableMates, run by{" "}
        {LEGAL.companyName} (&ldquo;we&rdquo;). By creating an account or
        using the app you agree to them. If you don&apos;t agree, please
        don&apos;t use TableMates.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <ul>
        <li>You must be at least 18 to create an account.</li>
        <li>Give accurate details, including a phone number and email a restaurant or host can rely on.</li>
        <li>Keep your password to yourself. You&apos;re responsible for what happens on your account.</li>
        <li>One person, one account.</li>
      </ul>
    ),
  },
  {
    id: "bookings",
    title: "Bookings",
    body: (
      <>
        <p>
          TableMates helps you arrange tables at restaurants. We aren&apos;t
          the restaurant: menus, prices, opening hours, availability and the
          meal itself are the restaurant&apos;s responsibility, and the
          information we show may change or be out of date.
        </p>
        <p>
          Only book tables you intend to use. If your plans change, cancel
          as early as you can so the seats can go to someone else. See{" "}
          <Link href="/booking-help">booking help</Link> for how.
        </p>
      </>
    ),
  },
  {
    id: "shared-tables",
    title: "Shared tables",
    body: (
      <>
        <p>
          When you open a table, you choose who can join. When you join
          one, the host decides whether to accept requests that need
          approval. Other diners are members of the public, not people we
          employ or vouch for.
        </p>
        <ul>
          <li>Show up for tables you join, or leave in good time if you can&apos;t.</li>
          <li>Hosts: only cancel when you have to. Guests are notified when you do.</li>
          <li>Split the bill fairly. Payment is between you, the other diners and the restaurant.</li>
        </ul>
      </>
    ),
  },
  {
    id: "conduct",
    title: "How to behave",
    body: (
      <>
        <p>Be respectful. You must not use TableMates to:</p>
        <ul>
          <li>harass, threaten, discriminate against or endanger anyone;</li>
          <li>post content that is false, misleading, offensive or unlawful;</li>
          <li>impersonate someone, or create fake profiles, bookings or reviews;</li>
          <li>collect other diners&apos; details, or contact them for anything unrelated to a table;</li>
          <li>interfere with the app, its security, or other people&apos;s use of it.</li>
        </ul>
        <p>
          If someone breaks these rules, report them from their profile. We
          may remove content, restrict features or close accounts that do.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    body: (
      <p>
        You keep ownership of what you add, such as your profile, notes and
        messages. You let us store and show it inside TableMates so the app
        works (for example, showing your profile to diners at your table).
        Our <Link href="/privacy-policy">privacy policy</Link> explains how
        we handle your information.
      </p>
    ),
  },
  {
    id: "safety",
    title: "Safety",
    body: (
      <p>
        Meeting new people carries some risk. Meet in the restaurant, let
        someone know your plans, and trust your instincts. If you ever feel
        unsafe, leave and contact local emergency services. Report and
        block tools are there to help, but we can&apos;t check everyone in
        advance.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility",
    body: (
      <>
        <p>
          We work to keep TableMates available and accurate, but we provide
          it &ldquo;as is&rdquo; and can&apos;t promise it will always be
          available or error free.
        </p>
        <p>
          To the extent the law allows, we aren&apos;t responsible for the
          actions of restaurants or other diners, or for indirect losses from
          using the app. Nothing in these terms limits rights you have under
          consumer law that can&apos;t be excluded.
        </p>
      </>
    ),
  },
  {
    id: "ending",
    title: "Closing your account",
    body: (
      <p>
        You can stop using TableMates at any time; to delete your account,
        email {mail}. We may suspend or close an account that breaks these
        terms, with notice where it&apos;s reasonable to give it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and governing law",
    body: (
      <p>
        We may update these terms. We&apos;ll change the date at the top, and
        tell you in the app if the change is significant; using TableMates
        after that means you accept the new terms. These terms are governed
        by the laws of {LEGAL.governingLaw}.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: <p>Questions about these terms: {mail}.</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      label="Terms & conditions"
      title="The ground"
      muted="rules."
      intro="What you agree to when you use TableMates, in plain language."
      lastUpdated={LEGAL.lastUpdated}
      sections={SECTIONS}
    />
  );
}
