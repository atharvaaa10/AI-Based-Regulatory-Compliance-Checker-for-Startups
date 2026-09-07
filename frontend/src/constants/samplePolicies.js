/**
 * samplePolicies.js
 * Pre-configured privacy policy text benchmarks and cached ground-truth evaluation
 * results for rapid testing and live demonstration.
 */

export const SAMPLE_POLICY_QUICKCART = `PRIVACY POLICY — QuickCart Technologies Pvt. Ltd.

Last updated: January 2026

QuickCart Technologies ("we", "us", "our") operates the QuickCart mobile
application and website. This policy explains how we handle your
information when you use our services.

Information We Collect:
When you sign up, we collect your name, email address, phone number,
and delivery address. We also collect your order history and payment
information to process transactions. Our app may access your device's
location to show nearby delivery options.

How We Use Your Information:
We use your information to process orders, send order updates, and
occasionally share offers and promotions via email or SMS. We may also
use your data to improve our services and personalize your shopping
experience.

Sharing of Information:
We may share your information with delivery partners and payment
processors to complete your orders. We do not sell your personal
information to third parties for marketing purposes.

Data Security:
We use industry-standard security measures to protect your data,
including encryption for payment information.

Children's Privacy:
Our services are not intended for children under 18.

Contact Us:
If you have questions about this policy, contact us at
support@quickcart.example.com.`;

export const SAMPLE_POLICY_FINPULSE = `PRIVACY POLICY — FinPulse Technologies Pvt. Ltd.
Last updated: February 2026

FinPulse Technologies ("FinPulse", "we", "us") provides digital expense management and payment solutions. We respect your privacy and process personal data in compliance with the Digital Personal Data Protection Act, 2023.

1. Information We Collect:
We collect personal data you provide when opening an account: full name, business email address, mobile number, PAN, and transaction logs. We also collect IP addresses and app telemetry to maintain system performance.

2. Purpose and Lawful Grounds:
Your personal data is collected solely for specified lawful purposes:
(a) To set up your account and process authorized payment disbursements.
(b) To verify user identities pursuant to applicable financial regulations.
(c) To deliver transactional notices, security alerts, and customer support.
Processing is based on your explicit consent granted at registration or as required to fulfill statutory duties.

3. Consent & Withdrawal:
We obtain affirmative consent through an explicit opt-in mechanism prior to account activation. You may withdraw your consent at any time by emailing privacy@finpulse.example.com. Withdrawal does not impact processing undertaken prior to the withdrawal request.

4. Data Retention and Deletion:
We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, or for a mandatory period of 5 years following account closure to comply with legal record-keeping obligations. Thereafter, data is permanently erased or anonymized.

5. Third-Party Service Providers:
We share personal data strictly with vetted third-party payment gateways and cloud infrastructure providers under legally binding data processing agreements. We do not sell personal data to advertisers.

6. Information Security:
We maintain administrative, technical, and physical safeguards designed to protect personal data from unauthorized access, loss, or alteration. All financial transactions are protected using TLS 1.3 encryption.

7. Grievance Redressal & Contact:
If you have concerns or wish to file a grievance regarding our data processing practices, contact our designated Grievance Officer:
Name: Ananya Roy
Designation: Grievance Officer
Email: grievance@finpulse.example.com
Address: FinPulse Tech Park, Koramangala, Bangalore 560034.
We endeavor to review and resolve all written grievances within 30 days of receipt.

8. Cross-Border Data Transfers:
All customer personal data is hosted and stored on secure servers located within India. We do not transfer personal data outside the territory of India.`;

export const CHECKLIST_METADATA = {
  purpose_specification: {
    category: "Consent & Lawful Basis",
    sections: ["Section 4", "Section 5", "Section 6"]
  },
  consent_mechanism: {
    category: "Consent & Lawful Basis",
    sections: ["Section 6"]
  },
  notice_before_collection: {
    category: "Consent & Lawful Basis",
    sections: ["Section 5"]
  },
  consent_withdrawal: {
    category: "Data Principal Rights",
    sections: ["Section 6"]
  },
  lawful_basis: {
    category: "Consent & Lawful Basis",
    sections: ["Section 4", "Section 7"]
  },
  data_minimisation: {
    category: "Governance & Quality",
    sections: ["Section 6"]
  },
  data_retention_deletion: {
    category: "Governance & Quality",
    sections: ["Section 8"]
  },
  security_safeguards: {
    category: "Security & Breach Management",
    sections: ["Section 8"]
  },
  breach_notification: {
    category: "Security & Breach Management",
    sections: ["Section 8"]
  },
  right_to_access: {
    category: "Data Principal Rights",
    sections: ["Section 11"]
  },
  right_to_correction_erasure: {
    category: "Data Principal Rights",
    sections: ["Section 12"]
  },
  grievance_redressal: {
    category: "Accountability & Redressal",
    sections: ["Section 13", "Section 8"]
  },
  children_data_processing: {
    category: "Children & Vulnerable Data",
    sections: ["Section 9"]
  },
  third_party_data_sharing: {
    category: "Cross-Border & Third Parties",
    sections: ["Section 8", "Section 11"]
  },
  cross_border_transfer: {
    category: "Cross-Border & Third Parties",
    sections: ["Section 16"]
  }
};
