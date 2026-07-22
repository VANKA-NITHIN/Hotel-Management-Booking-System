import { usePageTitle } from '../hooks/usePageTitle';

export default function TermsPage() {
  usePageTitle('Terms of Service');

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
            <p className="text-sm text-gray-500 mb-8">Last Updated: October 2024</p>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
              <p>By accessing or using LuxuryStay's services, website, or mobile application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Booking and Reservations</h2>
              <ul className="list-disc ps-5 space-y-2">
                <li>All bookings are subject to availability and acceptance.</li>
                <li>You must be at least 18 years of age to make a reservation.</li>
                <li>Valid payment information is required to secure a reservation.</li>
                <li>Rates are subject to change without notice prior to booking confirmation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Cancellation and Refunds</h2>
              <p>Cancellation policies vary by hotel and rate type. Standard policy allows free cancellation up to 48 hours before check-in. Non-refundable rates are clearly marked during the booking process.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Guest Responsibilities</h2>
              <p>Guests are expected to conduct themselves appropriately at all times. Any damage to hotel property will be charged to the payment method on file. Hotels reserve the right to refuse service to anyone demonstrating disruptive behavior.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Loyalty Program</h2>
              <p>LuxuryStay Loyalty points have no cash value and cannot be transferred. Points expire after 24 months of account inactivity. We reserve the right to modify or terminate the loyalty program at any time with 30 days notice.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
