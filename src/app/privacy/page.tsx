import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | SingHUB",
  description: "How SingHUB collects, uses, and protects information when you use the karaoke discovery platform.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "Information you provide",
    body: "When you create an account, complete a host or venue profile, submit an event, contact us, or participate in SingHUB, you may provide your email address, display name, profile information, photos, venue or event details, and messages. Public profile information that you choose to submit may be displayed to other users.",
  },
  {
    title: "Activity and technical information",
    body: "SingHUB may process searches, followed or saved places, check-ins, QR-code visits, and interactions with offers or other site features. We may also receive browser and device details, approximate location derived from technical data, and usage analytics. Precise location is only requested when a feature needs it and your device allows it.",
  },
  {
    title: "How we use information",
    body: "We use information to operate accounts, help people find karaoke and local events, show host and venue listings, support check-ins and offers, respond to inquiries, maintain security, fix problems, and understand which features are useful. We may use aggregated information to report activity to participating venues or partners.",
  },
  {
    title: "Service providers and outside links",
    body: "SingHUB uses third-party services to provide hosting, authentication, email, analytics, image delivery, and, where applicable, payment processing. These providers process information for their services. Links or QR codes may take you to other sites, including hosts' signup pages, social profiles, and tipping services, which have their own privacy practices.",
  },
  {
    title: "Sharing and visibility",
    body: "Information published on public venue, event, or host profiles may be seen by anyone. We may share information with service providers and when required by law or needed to protect users and the service. We do not present private account details or individual check-in histories as public profiles simply because someone checks in.",
  },
  {
    title: "Retention and security",
    body: "We keep information for as long as reasonably needed to operate SingHUB, fulfill legitimate operational or legal requirements, resolve disputes, and maintain the integrity of listings. We use measures intended to protect information, but no online service can guarantee absolute security.",
  },
  {
    title: "Your choices",
    body: "You can choose what public profile information to submit, manage browser and device permissions, and contact us to request access, correction, or deletion of personal information. Some records may need to be kept for security, legal, or operational reasons. California residents may have additional privacy rights under applicable law.",
  },
  {
    title: "Children and updates",
    body: "SingHUB is not intended for children under 13, and we do not knowingly seek their personal information. We may update this notice as the platform changes. The effective date on this page will be updated when material revisions are published.",
  },
];

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#090e19] px-5 py-14 text-white">
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm font-semibold text-cyan-300 hover:underline">← Back to SingHUB</Link>
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Your information</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-400">Effective November 2, 2026</p>
      <p className="mt-6 text-base leading-7 text-slate-200">SingHUB is a karaoke and nightlife discovery platform operated by SingHUB LLC. This notice explains the types of personal information we may process and the choices available to you when using singhub.app.</p>
      <div className="mt-9 space-y-8">{sections.map(section=><section key={section.title}><h2 className="text-xl font-bold">{section.title}</h2><p className="mt-2 leading-7 text-slate-300">{section.body}</p></section>)}</div>
      <section className="mt-10 rounded-xl border border-white/15 bg-white/5 p-5"><h2 className="text-xl font-bold">Contact us</h2><p className="mt-2 leading-7 text-slate-300">For privacy questions, requests, or concerns, email <a className="font-semibold text-cyan-300 underline" href="mailto:hello@singhub.app">hello@singhub.app</a>.</p></section>
      <p className="mt-8 text-sm text-slate-400">This page describes general practices. Feature-specific notices and legally required disclosures may supplement it.</p>
    </div>
  </main>;
}
