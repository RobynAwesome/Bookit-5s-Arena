export const metadata = {
  title: 'Security',
  description: 'Security practices at Bookit 5s Arena.',
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
          Security
        </h1>
        <p className="text-gray-400 text-sm mb-10">Keeping your data and payments safe</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Payments</h2>
            <p>All bookings are <strong className="text-white">cash-only</strong> — payments are made in person at the venue. We do not process, store, or transmit any card details online.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Authentication</h2>
            <p>Passwords are hashed with <strong className="text-white">bcrypt</strong>. Sessions use signed JWT tokens via NextAuth. OAuth logins (Google) do not expose your password to us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Data Transmission</h2>
            <p>All traffic is served over <strong className="text-white">HTTPS</strong> with HSTS preloading. HTTP Strict Transport Security is enforced for 2 years.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Report a Vulnerability</h2>
            <p>If you discover a security issue, please contact us responsibly at <a href="mailto:fivearena@gmail.com" className="text-green-400 hover:underline">fivearena@gmail.com</a> before disclosing publicly.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
