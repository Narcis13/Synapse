import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Synapse",
  description: "Learn how Synapse protects your privacy and handles your data",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            At Synapse, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our AI-powered learning platform.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
          <h3 className="text-xl font-medium mb-3">Information We Collect</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> Email address, name, and profile information you provide
            </li>
            <li>
              <strong>Learning Content:</strong> Documents, files, and materials you upload for learning
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you interact with our platform, including:
              <ul className="list-disc pl-6 mt-2">
                <li>Learning sessions and progress</li>
                <li>Quiz and flashcard performance</li>
                <li>Feature usage patterns</li>
                <li>Device and browser information</li>
              </ul>
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">AI Usage Disclosure</h2>
          <p className="mb-4">
            Synapse uses artificial intelligence to enhance your learning experience:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We use OpenAI's GPT models to generate summaries, quizzes, and provide chat assistance</li>
            <li>Deepgram is used for audio transcription services</li>
            <li>ElevenLabs provides text-to-speech functionality</li>
            <li>Your content is processed by these services but is not used to train their models</li>
            <li>We implement content filtering to ensure appropriate educational use</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="mb-4">We integrate with the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Convex:</strong> Database and file storage</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>OpenAI:</strong> AI text generation</li>
            <li><strong>Deepgram:</strong> Audio transcription</li>
            <li><strong>ElevenLabs:</strong> Voice synthesis</li>
            <li><strong>Vercel:</strong> Hosting and analytics</li>
          </ul>
          <p className="mt-4">
            Each service has its own privacy policy, and we recommend reviewing them for complete information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Rights (GDPR/CCPA)</h2>
          <p className="mb-4">You have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Update or correct your information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong>Portability:</strong> Export your learning data in a machine-readable format</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Objection:</strong> Opt-out of certain data processing activities</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information below.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Encryption in transit and at rest</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure data centers with physical security</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide services. 
            Upon account deletion, we will remove your personal data within 30 days, except where legally 
            required to retain it.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p>
            Synapse is not intended for children under 13. We do not knowingly collect personal 
            information from children under 13. If we discover such data, we will promptly delete it.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy or your data, please contact us:
          </p>
          <div className="bg-muted p-6 rounded-lg">
            <p><strong>Email:</strong> privacy@synapse.com</p>
            <p><strong>Address:</strong> Synapse, Inc.<br />123 AI Learning Lane<br />San Francisco, CA 94105</p>
            <p className="mt-4">
              <strong>Data Protection Officer:</strong> dpo@synapse.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}