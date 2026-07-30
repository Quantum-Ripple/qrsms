<script setup>
const sections = [
  {
    title: '1. Our Commitment',
    body: 'Quantum Ripple LTD is committed to protecting the privacy, confidentiality, integrity, and security of personal information processed through our School Management Platform. We comply with the Kenya Data Protection Act, 2019 and other applicable privacy regulations.'
  },

  {
    title: '2. Our Role',
    body: `Depending on the service being provided, Quantum Ripple may act as:

• Data Processor – when processing student, parent, teacher and school data on behalf of a school.

• Data Controller – for user account creation, billing, customer support, platform security, analytics, legal compliance and business administration.

Schools remain responsible for determining what student information is collected, how long it is retained, and who can access it.`
  },

  {
    title: '3. Information We Collect',
    body: `We may collect:

• School information (registration details, contact information, subscription details)

• Staff information (names, emails, phone numbers, employment role, permissions)

• Student information (admission number, class, attendance, grades, fee balances, guardian information)

• Parent & Guardian information (contacts, addresses, payment history)

• Technical information (IP address, browser, device information, audit logs, login timestamps)

• Financial information (invoice records, payment references, receipts).

We do not store debit card numbers, banking passwords, or mobile money PINs.`
  },

  {
    title: '4. Why We Process Information',
    body: `Your information helps us:

• Deliver our services
• Authenticate users
• Manage school operations
• Generate academic reports
• Process school fee payments
• Improve platform security
• Detect fraud
• Prevent unauthorized access
• Provide customer support
• Meet legal obligations
• Improve platform performance`
  },

  {
    title: '5. Lawful Basis for Processing',
    body: `We process information based on one or more of the following:

• Performance of a contract
• Compliance with legal obligations
• Legitimate interests
• Consent where required
• Protection of vital interests

Schools remain responsible for obtaining parental or guardian consent where required for student information.`
  },

  {
    title: '6. Cookies & Similar Technologies',
    body: `Our platform may use cookies for authentication, user sessions, security, remembering preferences, analytics and performance monitoring.

You may disable cookies in your browser, although some platform features may not function correctly.`
  },

  {
    title: '7. Sharing Your Information',
    body: `We never sell personal information.

Where necessary we may share information with:

• The relevant School
• Authorized school staff
• Payment providers
• Cloud hosting providers
• Security service providers
• Legal authorities where required by law
• Professional advisers
• Auditors

All service providers are required to protect personal information appropriately.`
  },

  {
    title: '8. International Data Transfers',
    body: `Where information is processed outside Kenya through trusted infrastructure providers, we implement safeguards consistent with the Kenya Data Protection Act and applicable regulations.`
  },

  {
    title: '9. Security',
    body: `We use industry-standard security measures including:

• HTTPS & TLS encryption
• Encrypted backups
• Role-Based Access Control (RBAC)
• Password hashing
• Audit logging
• Firewalls
• Secure cloud hosting
• Routine security updates
• Least privilege access
• Regular security assessments

Although no online service is completely secure, we continuously improve our security controls.`
  },

  {
    title: '10. Data Retention',
    body: `Information is retained only for as long as necessary to:

• Provide our services
• Meet legal obligations
• Maintain financial records
• Resolve disputes
• Enforce agreements

Schools may request deletion of institutional data where permitted by law.`
  },

  {
    title: "11. Children's Privacy",
    body: `Our platform is intended for educational institutions.

Student information is uploaded by schools. Schools are responsible for obtaining all legally required parental or guardian permissions before submitting student information to our platform.`
  },

  {
    title: '12. Your Rights',
    body: `Subject to applicable law, you may:

• Request access to your data
• Correct inaccurate information
• Request deletion
• Restrict processing
• Object to processing
• Request data portability
• Withdraw consent where applicable
• Lodge complaints with the Office of the Data Protection Commissioner (ODPC).`
  },

  {
    title: '13. Security Incidents',
    body: `If a personal data breach occurs, Quantum Ripple will investigate the incident promptly and notify affected schools and relevant authorities where required by law.`
  },

  {
    title: '14. Third-Party Services',
    body: `Our platform may integrate with trusted third-party providers including payment processors, cloud hosting providers, email services and SMS gateways. Their processing of information is governed by their respective privacy policies.`
  },

  {
    title: '15. Updates to this Policy',
    body: `We may update this Privacy Policy from time to time.

Where changes are material, we will notify users through the platform or by other appropriate communication channels before the changes take effect where required by law.`
  },

  {
    title: '16. Contact Information',
    body: `Quantum Ripple LTD

Email:
quantumrippleltd@gmail.com

Website:
https://www.quantumripple.co.ke

If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us using the details above.`
  }
]
</script>

<template>
  <div class="min-h-screen bg-slate-100 px-4 py-8 text-slate-800">
    <div class="mx-auto flex max-w-5xl flex-col gap-6">
      <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="space-y-2">
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Privacy Policy
                </p>

                <div class="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span><strong>Effective:</strong> July 30, 2026</span>
                  <span><strong>Last Updated:</strong> July 30, 2026</span>
                </div>
              </div>
            <h1 class="mt-2 text-3xl font-semibold text-slate-900">How Quantum Ripple protects your data</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              This policy explains how we collect, use, store, disclose, and protect personal information shared with our School Management Platform.
            </p>
          </div>
          <router-link
            to="/login"
            class="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            Back to login
          </router-link>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="rounded-2xl bg-slate-50 p-6">
          <p class="text-sm leading-7 text-slate-700">
            Quantum Ripple LTD (“Quantum Ripple”, “we”, “our”, or “us”) respects your privacy. Our platform is designed for schools, teachers, parents, guardians, students, and authorized users. We are committed to complying with the Kenya Data Protection Act, 2019, and other relevant data protection laws.
          </p>
        </div>

        <div class="mt-8 space-y-6">
          <div
            v-for="section in sections"
            :key="section.title"
            class="rounded-2xl border border-slate-200 p-5"
          >
            <h2 class="text-lg font-semibold text-slate-900">{{ section.title }}</h2>
            <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
  {{ section.body }}
</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
