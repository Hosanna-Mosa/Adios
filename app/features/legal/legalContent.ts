// Terms of Service and Privacy Policy shown on app/legal.tsx.
//
// Kept in English: legal text is not machine-translated. Have it reviewed by
// counsel before release, and add the registered company name, address and the
// Grievance Officer's contact details where noted.

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDocument {
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_UPDATED = "17 October 2026";

export const TERMS: LegalDocument = {
  updated: LEGAL_UPDATED,
  intro:
    "These Terms of Service (\"Terms\") govern your use of the Adios app and its services. By creating an account or using the app, you agree to these Terms. If you do not agree, please do not use the app.",
  sections: [
    {
      heading: "1. Our services",
      body: [
        "Adios is a platform that connects you with independent partners: restaurants and meat centres (\"Outlets\") for food and meat orders, and delivery partners, riders and helpers (\"Partners\") for deliveries, bike and auto rides, package delivery and helper tasks.",
        "Outlets prepare and sell the products you order and are responsible for their quality, quantity, hygiene and labelling. Partners provide the delivery, ride and helper services. Adios facilitates these services but does not itself cook food or drive vehicles.",
      ],
    },
    {
      heading: "2. Your account",
      body: [
        "You must be at least 18 years old to create an account. You agree to give accurate details (name, phone number and email) and to keep them up to date.",
        "You are responsible for keeping your password confidential and for all activity on your account. Tell us through Help & Support straight away if you believe your account has been used without permission.",
        "We may suspend or block an account that breaks these Terms, misuses the platform, or puts Partners, Outlets or other users at risk.",
      ],
    },
    {
      heading: "3. Orders, rides and tasks",
      body: [
        "Prices, delivery fees, fares, taxes and any applicable charges are shown before you confirm. Fares for rides and package deliveries are estimates based on distance and time and can change if the route, stops or waiting time change.",
        "A food order is confirmed only after the restaurant accepts it. Outlets may decline an order, for example when an item is unavailable or the outlet is closed. Items marked sold out cannot be ordered.",
        "Ride and delivery Partners are assigned based on availability. We cannot guarantee that a Partner will be available at every time or location.",
        "For rides and package deliveries that use a start or completion code, share it only with the assigned Partner when the service begins or ends.",
      ],
    },
    {
      heading: "4. Payments",
      body: [
        "You can pay online through our payment provider or, where offered, in cash to the Partner. Online payments are processed by a third-party payment gateway; Adios does not store your full card or bank details.",
        "Delivery tips go entirely to the delivery Partner.",
        "Coupons and offers are subject to their own conditions, may be withdrawn at any time and cannot be exchanged for cash.",
      ],
    },
    {
      heading: "5. Cancellations and refunds",
      body: [
        "You can cancel an order, ride or task from the app while the option is shown. If a cancellation charge applies, it is shown before you confirm the cancellation.",
        "If an online-paid order is cancelled by the Outlet, by a Partner or by Adios, or cannot be fulfilled, the amount paid is refunded to the original payment method. The time for the money to reach you depends on your bank and the payment provider.",
        "For problems with an order (missing or wrong items, quality issues, overcharging), contact us through Help & Support in the app as soon as possible so we can look into it.",
      ],
    },
    {
      heading: "6. Your conduct",
      body: [
        "Please treat Partners and Outlet staff with respect. Do not harass, threaten or abuse anyone, give false addresses or information, place fraudulent orders, or misuse coupons, referrals or refunds.",
        "Do not send prohibited, illegal, hazardous or dangerous items through package delivery, and do not ask a helper to do anything unlawful or unsafe.",
        "Do not copy, reverse-engineer, disrupt or misuse the app or its systems.",
      ],
    },
    {
      heading: "7. Liability",
      body: [
        "The app is provided \"as is\". To the extent permitted by law, Adios is not liable for indirect or consequential losses, or for the acts or omissions of Outlets and Partners, who are independent of Adios.",
        "Nothing in these Terms limits any rights you have under applicable consumer protection law.",
      ],
    },
    {
      heading: "8. Deleting your account",
      body: [
        "You can delete your account at any time from Profile > Delete account. See the Privacy Policy for what happens to your data.",
      ],
    },
    {
      heading: "9. Changes to these Terms",
      body: [
        "We may update these Terms from time to time. When we make significant changes we will tell you in the app. Continuing to use the app after a change means you accept the updated Terms.",
      ],
    },
    {
      heading: "10. Governing law and contact",
      body: [
        "These Terms are governed by the laws of India, and courts in India have jurisdiction over any dispute.",
        "For any question or complaint, contact us through Help & Support in the app.",
      ],
    },
  ],
};

export const PRIVACY: LegalDocument = {
  updated: LEGAL_UPDATED,
  intro:
    "This Privacy Policy explains what personal data Adios collects, why we collect it, who we share it with and the choices you have. It applies to the Adios customer app.",
  sections: [
    {
      heading: "1. Data we collect",
      body: [
        "Account details: your name, phone number, email address, username, profile photo and password (stored only in encrypted, hashed form).",
        "Addresses and location: the delivery and pickup addresses you save, and your device location while you use the app to find nearby services, set pickup points and show live tracking.",
        "Orders and payments: what you order or book, from whom, amounts, coupons, tips, ratings and reviews. Online payments are handled by our payment provider; we receive the payment status and reference, not your full card or bank details.",
        "Communications: messages you exchange with Partners in order chat, and support tickets and conversations with our support team.",
        "Device and usage data: push notification tokens, app version, and how you use the app (for example which screens you open), used to fix problems and improve the service.",
      ],
    },
    {
      heading: "2. How we use your data",
      body: [
        "To create and run your account, and to sign you in securely.",
        "To place, prepare, deliver and track your orders, rides, package deliveries and helper tasks, and to calculate prices and fares.",
        "To process payments and refunds, and to prevent fraud and misuse.",
        "To send order updates and service notifications, and to provide customer support.",
        "To understand how the app is used so we can fix bugs and improve our services.",
        "To meet legal, tax and regulatory obligations.",
      ],
    },
    {
      heading: "3. Who we share it with",
      body: [
        "Outlets receive your order details and the name and delivery details needed to fulfil it.",
        "The assigned Partner receives your name, phone number, pickup and drop locations and order details for the duration of the service, so they can reach you and complete it.",
        "Service providers that help us run the app, such as our payment gateway, mapping and location services, cloud hosting and image storage, and messaging and email providers. They may use the data only to provide their services to us.",
        "Authorities, where we are required to by law or to protect the safety of our users, Partners or the public.",
        "We do not sell your personal data.",
      ],
    },
    {
      heading: "4. How long we keep it",
      body: [
        "We keep your account data while your account is active.",
        "Order, payment and invoice records are kept for as long as tax and accounting laws require, even after you delete your account.",
        "App usage events are deleted automatically after 90 days.",
      ],
    },
    {
      heading: "5. Deleting your account",
      body: [
        "You can delete your account from Profile > Delete account. When you do, we remove your name, email, phone number, photo, saved addresses, favourites, cart and notifications from your profile, and sign you out on every device.",
        "For safety, fraud-prevention and legal reasons, we keep a secure, restricted copy of your account data at the time of deletion, together with your order and payment records. This copy is not used for marketing and is accessed only when needed for these purposes.",
      ],
    },
    {
      heading: "6. Security",
      body: [
        "We use reasonable technical and organisational measures to protect your data, including encrypted connections and hashed passwords. No system is completely secure, so please keep your password private.",
      ],
    },
    {
      heading: "7. Your rights and choices",
      body: [
        "You can view and update your profile details and saved addresses in the app at any time.",
        "You can turn off location access or notifications in your phone's settings; some features, such as live tracking, may not work without them.",
        "Subject to applicable law, including the Digital Personal Data Protection Act, 2023, you may ask to access, correct or erase your personal data, or raise a grievance, by contacting us through Help & Support.",
      ],
    },
    {
      heading: "8. Children",
      body: [
        "The app is meant for people aged 18 and over. We do not knowingly collect data from children.",
      ],
    },
    {
      heading: "9. Changes and contact",
      body: [
        "We may update this Privacy Policy from time to time and will tell you in the app about significant changes.",
        "For any privacy question or request, contact us through Help & Support in the app.",
      ],
    },
  ],
};
