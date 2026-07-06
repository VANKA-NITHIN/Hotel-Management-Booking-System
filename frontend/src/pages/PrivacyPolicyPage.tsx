import { usePageTitle } from '../hooks/usePageTitle';

export default function PrivacyPolicyPage() {
  usePageTitle('Privacy Policy');

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
            <p className="text-sm text-gray-500 mb-8">Last Updated: October 2024</p>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Name and contact information</li>
                <li>Payment and billing details (processed securely by our partners)</li>
                <li>Booking history and preferences</li>
                <li>Communications with our concierge team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Processing your reservations and payments</li>
                <li>Providing customer support and concierge services</li>
                <li>Sending booking confirmations and updates</li>
                <li>Personalizing your luxury experience</li>
                <li>Improving our platform and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Data Sharing and Security</h2>
              <p>We share necessary information only with our hotel partners to facilitate your stay. We do not sell your personal data to third parties. We employ industry-standard security measures, including encryption and strict access controls, to protect your information.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information. You may also opt-out of marketing communications at any time through your account settings or by contacting our support team.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
