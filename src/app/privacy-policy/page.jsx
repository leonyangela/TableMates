import Link from "next/link";

import LegalDocument from "@/components/ui/legal-document.component";
import { LEGAL } from "@/lib/constants/legal.constants";
import { SUPPORT_EMAIL } from "@/lib/constants/contact.constants";

export const metadata = {
  title: "Privacy Policy | TableMates",
  description: "What TableMates collects, who can see it, and how to access or delete it.",
};

const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <p>
        This policy explains what {LEGAL.companyName} (&ldquo;we&rdquo;)
        collects when you use TableMates, why, and who can see it. We only
        collect what the app needs to let you book tables and share them
        with other diners. We don&apos;t sell your information and we
        don&apos;t use advertising or analytics trackers.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <ul>
          <li><strong>Account:</strong> your name, email address and phone number. Your password is handled by our sign-in provider; we never see it.</li>
          <li><strong>Profile (optional):</strong> a photo link, a short &ldquo;about you&rdquo;, interests and dietary preferences.</li>
          <li><strong>Bookings:</strong> the restaurant, date, time, number of seats, occasion, special requests, the contact details you enter, and whether the table is private or open.</li>
          <li><strong>Shared tables:</strong> requests to join (with any note you write), who joined which table, and seat changes.</li>
          <li><strong>After a table:</strong> ratings you give other diners (whether they showed up, whether it was good company, whether you&apos;d dine together again) and any private note to our team.</li>
          <li><strong>Safety:</strong> people you block, and reports you make, including the reason and details.</li>
          <li><strong>Notifications</strong> we create for you, such as a request being accepted.</li>
        </ul>
        <p>
          Dietary preferences can say something about your health or
          beliefs. They&apos;re optional and shown on your public profile, so
          only add what you&apos;re comfortable sharing.
        </p>
      </>
    ),
  },
  {
    id: "who-can-see-it",
    title: "Who can see it",
    body: (
      <ul>
        <li><strong>Other signed-in diners</strong> can see your public profile: name, photo, about, interests, dietary preferences, when you joined, and an overall rating. Individual ratings are never shown.</li>
        <li><strong>A host</strong> can see the names of the guests at their table and the notes in requests sent to them.</li>
        <li><strong>Your phone number and email</strong> are never shown to other diners.</li>
        <li><strong>Our team</strong> can see reports and private feedback notes, and uses them to keep the community safe.</li>
      </ul>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: (
      <ul>
        <li>To run your account and keep you signed in.</li>
        <li>To make, show and manage your bookings and shared tables.</li>
        <li>To send you notifications and account emails, such as email verification and password resets.</li>
        <li>To work out ratings, and to act on blocks and reports.</li>
      </ul>
    ),
  },
  {
    id: "service-providers",
    title: "Service providers",
    body: (
      <>
        <p>We use a small number of providers to run TableMates:</p>
        <ul>
          <li><strong>Google Firebase</strong> for sign-in and to store the information above.</li>
          <li><strong>Mapbox</strong> to show the restaurant map. Your browser loads map tiles directly from Mapbox, which receives your IP address and the area of the map you view.</li>
          <li><strong>Our hosting provider</strong> to serve the website.</li>
        </ul>
        <p>
          These providers may store data outside your country. They process
          it to provide their service to us, not for their own marketing.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and storage",
    body: (
      <p>
        We use your browser&apos;s storage only to keep you signed in. There
        are no advertising or analytics cookies.
      </p>
    ),
  },
  {
    id: "your-choices",
    title: "Access, changes and deletion",
    body: (
      <>
        <p>
          You can view and change your details on your{" "}
          <Link href="/profile">profile</Link> at any time.
        </p>
        <p>
          To get a copy of your information, or to delete your account and
          the information linked to it, email {mail}. We may keep some
          records where the law requires, or where needed to deal with a
          safety report.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Access to your information is limited by database rules: your
        private details are readable only by you, and other diners only
        see your public profile. No system is perfectly secure, so please
        use a strong password that you don&apos;t use elsewhere.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change this policy we&apos;ll update the date at the top, and
        tell you in the app if the change is significant.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: <p>Questions about privacy: {mail}.</p>,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      label="Privacy policy"
      title="Your data,"
      muted="plainly."
      intro="What we collect, who can see it, and how to change or delete it."
      lastUpdated={LEGAL.lastUpdated}
      sections={SECTIONS}
    />
  );
}
