/** Driver-facing help content shown on the support screen. */
export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: "When do I get my payouts?",
    answer: "Payouts are automatically processed every Monday morning to your linked bank account. Depending on your bank, it may take 1-2 business days to reflect.",
  },
  {
    question: "How do I report an issue with a customer?",
    answer: "If you have issues during delivery, use the 'Live Chat' support below or rate the customer accordingly after the trip. For emergencies, please call the emergency hotline immediately.",
  },
  {
    question: "My location is not updating correctly, what should I do?",
    answer: "Make sure you have set location permissions to 'Always Allow' in your phone's settings. Close other GPS-intensive apps and verify you have a strong mobile internet connection.",
  },
  {
    question: "Can I cancel an accepted delivery manifest?",
    answer: "You can cancel a manifest from the active order screen before picking up the items, but it may affect your acceptance rate. Frequent cancellations can trigger a temporary account suspension.",
  },
  {
    question: "How do I update my vehicle or driving license?",
    answer: "You can upload new documents in the Document Center under Profile personal settings. Our team reviews all document updates within 24 hours.",
  },
];
