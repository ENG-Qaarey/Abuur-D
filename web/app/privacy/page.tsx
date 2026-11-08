import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { CONTACT_EMAIL } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Privacy Policy | ABUUR Digital",
  description: "How ABUUR Digital collects, uses and protects information about businesses and shoppers.",
};

const SECTIONS = [
  {
    title: "1. Who We Are",
    paragraphs: [
      "ABUUR Digital (“ABUUR”, “we”) runs a platform that lets businesses create online stores and receive orders through WhatsApp. This policy explains what information we handle and why.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: ["Depending on how you use ABUUR, we may collect:"],
    list: [
      "Account details: name, email address, phone number and password (stored only as a secure hash).",
      "Business details: business name, store link, address, WhatsApp number, products and prices.",
      "Order details: the items, customer name and phone number included in orders sent to a business.",
      "Contact form messages: your name, contact details, business name and message.",
      "Technical data: IP address and browser information, used for security and rate limiting.",
    ],
  },
  {
    title: "3. How We Use Information",
    paragraphs: [],
    list: [
      "To run your account, your store and your order dashboard.",
      "To review and approve new businesses.",
      "To reply to your messages and provide support.",
      "To protect the Platform from abuse, fraud and attacks.",
      "To improve ABUUR. We do not sell personal information.",
    ],
  },
  {
    title: "4. Businesses and Shoppers",
    paragraphs: [
      "When a shopper sends an order, the business receives the shopper's order details and contact information so it can confirm and deliver the order. Each business is responsible for using that information lawfully and only for the order and related customer service.",
      "Payments are agreed between the business and the shopper outside ABUUR, so we do not receive card or mobile-money details for shopper orders.",
    ],
  },
  {
    title: "5. Sharing",
    paragraphs: [
      "We share information only with service providers that help us run the Platform (such as hosting, database and messaging providers), when the law requires it, or with your permission.",
    ],
  },
  {
    title: "6. Security and Retention",
    paragraphs: [
      "Each business's data is kept separate. Sessions use secure, httpOnly cookies, and important changes are recorded in an audit log. We keep information for as long as your account is active, or as needed for legal and security purposes.",
    ],
  },
  {
    title: "7. Your Choices",
    paragraphs: [
      `You can update your account details, or ask us to access, correct or delete your information, by emailing ${CONTACT_EMAIL}.`,
    ],
  },
  {
    title: "8. Changes",
    paragraphs: ["We may update this policy. When we do, we will change the date below."],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      label="Legal"
      title="Privacy Policy"
      subtitle="How ABUUR Digital handles information about businesses and shoppers."
      lastUpdated="November 8, 2026"
      sections={SECTIONS}
    />
  );
}
