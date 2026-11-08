import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { CONTACT_EMAIL } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Terms of Service | ABUUR Digital",
  description: "The terms for using ABUUR Digital as a business owner, staff member or shopper.",
};

const SECTIONS = [
  {
    title: "1. Agreement to These Terms",
    paragraphs: [
      "These Terms of Service (“Terms”) govern your use of the ABUUR Digital website, dashboards, storefronts and related services (the “Platform”), operated by ABUUR Digital (“ABUUR”, “we”, “us”).",
      "By creating an account, opening a store or placing an order through a store on the Platform, you agree to these Terms and our Privacy Policy.",
    ],
  },
  {
    title: "2. Accounts",
    paragraphs: [
      "You must give accurate information when you register and keep your login details private. You are responsible for everything done under your account.",
      `Tell us straight away at ${CONTACT_EMAIL} if you think someone else has accessed your account.`,
    ],
  },
  {
    title: "3. Businesses and Stores",
    paragraphs: ["Every store on ABUUR belongs to a business. As a business owner you agree that:"],
    list: [
      "You have the right to sell the products you list, and your listings, prices and photos are accurate.",
      "You will not sell illegal, counterfeit, stolen or dangerous goods.",
      "New businesses are reviewed by ABUUR and may be approved, rejected or suspended.",
      "You are responsible for the staff you invite and the roles you give them.",
    ],
  },
  {
    title: "4. Orders and Payments Between Businesses and Shoppers",
    paragraphs: [
      "Shoppers send orders to a business through WhatsApp. ABUUR does not process shopper payments. Payment method, delivery and returns are agreed directly between the business and the shopper.",
      "ABUUR is not a party to the sale and is not responsible for the quality, delivery or payment of goods. Disputes about an order are between the business and the shopper, although we may help where we can.",
    ],
  },
  {
    title: "5. Plans and Fees",
    paragraphs: [
      "Businesses pay ABUUR for a subscription plan. Plan prices and features are shown on our Pricing page. We confirm your plan and payment arrangements with you before it starts.",
      "We may change plan prices with reasonable notice. Changes do not affect a period you have already paid for.",
    ],
  },
  {
    title: "6. Acceptable Use",
    paragraphs: ["You must not:"],
    list: [
      "Send spam or unwanted marketing through WhatsApp or other channels using data from the Platform.",
      "Try to access another business's data or bypass security controls.",
      "Upload malware or interfere with the Platform's operation.",
      "Misrepresent your identity or your business.",
    ],
  },
  {
    title: "7. Your Content",
    paragraphs: [
      "You keep ownership of the content you upload (such as product photos and descriptions). You give ABUUR permission to host and display it so your store works.",
    ],
  },
  {
    title: "8. Suspension and Termination",
    paragraphs: [
      "We may suspend or close accounts or stores that break these Terms or put shoppers or the Platform at risk. You can close your account at any time by contacting us.",
    ],
  },
  {
    title: "9. Liability",
    paragraphs: [
      "The Platform is provided “as is”. To the extent allowed by law, ABUUR is not liable for indirect losses, lost profits or losses caused by transactions between businesses and shoppers.",
    ],
  },
  {
    title: "10. Changes and Governing Law",
    paragraphs: [
      "We may update these Terms. When we make important changes we will update the date below. These Terms are governed by the laws of the Federal Republic of Somalia.",
    ],
  },
  {
    title: "11. Contact",
    paragraphs: [`Questions about these Terms? Email ${CONTACT_EMAIL}.`],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      label="Legal"
      title="Terms of Service"
      subtitle="Please read these terms before using ABUUR Digital."
      lastUpdated="November 8, 2026"
      sections={SECTIONS}
    />
  );
}
