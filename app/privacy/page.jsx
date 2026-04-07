export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Bookit 5s Arena.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
          Privacy Policy
        </h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: March 2026 · Bookit 5s Arena, Milnerton, Cape Town</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide when registering an account, booking a court, or signing up for our tournament. This includes your name, email address, and phone number. All payments are cash-only at the venue — we do not collect or store card details.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to manage bookings, send booking confirmations, communicate tournament updates via your preferred channel (SMS, email, or WhatsApp), and improve our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Storage</h2>
            <p>Your data is stored securely using MongoDB with industry-standard encryption. Passwords are hashed using bcrypt and never stored in plain text.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p>We use Google for authentication (OAuth) and Resend/Nodemailer for email delivery. These services have their own privacy policies. No third-party payment processors are used — all payments are cash-only at the venue.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:fivearena@gmail.com" className="text-green-400 hover:underline">fivearena@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contact</h2>
            <p>For any privacy concerns, contact us at <a href="mailto:fivearena@gmail.com" className="text-green-400 hover:underline">fivearena@gmail.com</a> or WhatsApp <a href="https://wa.me/27637820245" className="text-green-400 hover:underline">+27 63 782 0245</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
