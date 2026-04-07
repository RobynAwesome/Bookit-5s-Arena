<div align="center">
  <img src="public/images/logo.png" alt="Bookit 5s Arena Logo" width="200"/>
  <h1>⚽ Bookit 5's Arena | Next.js Full-Stack App</h1>
  <p><strong>A professional-grade, custom-built court management system and booking engine designed specifically for the South African 5-a-side football industry.</strong></p>
</div>

---

## 🛠️ **Tech Stack**

<div align="center">

### ⚛️ Frontend
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.36.0-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![React Leaflet](https://img.shields.io/badge/React_Leaflet-5.0.0-199900?style=for-the-badge&logo=leaflet&logoColor=white)

### 🔧 Backend & Services
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-9.3.0-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.13-000000?style=for-the-badge&logo=auth0&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

</div>

---

## 🚀 **Pro-Level Features**

### 🏟️ **Arena Booking & Management**
* **Instant Court Bookings:** Real-time scheduling that automatically prevents double-booking. Choose from 1hr, 2hr, or 3hr slots.
* **Online Payments:** Fully integrated **Stripe Checkout** for fast, secure credit card transactions.
* **Guest Reservation:** Allow guests to hold their slots and pay on arrival (cash or card) directly at the venue.
* **Intelligent AI Integration:** Built-in AI support bot powered by Anthropic's Claude to handle user queries about hours, pricing, and bookings.

### 🏆 **Admin Suite (The Dashboard)**
* **Centralized Command:** Manage all bookings, cancel appointments, and oversee finances from a secure admin dashboard.
* **AI Venue Analytics:** Automatically gain insights into peak hours, user engagement, and revenue trends via AI.
* **Automated Confirmations:** Email confirmations sent via **Nodemailer** instantly upon successful booking.
* **Data-driven CMS:** Add, edit, or remove courts, update pricing dynamically, and manage newsletters.

### 🌟 **User Experience & Rewards**
* **Modern Interface:** Highly interactive UI built with **Framer Motion** and **Tailwind CSS**.
* **Referral System & Loyalty Points:** Dedicated user portal for tracking historical bookings.
* **Secure Authentication:** Integrated **NextAuth.js** supporting Google, Facebook, and local password logins.

---

## ⚙️ **Installation & Setup**

**1. Clone the Repository:**
```bash
git clone https://github.com/RobynAwesome/Bookit-5s-Arena.git
cd Bookit-5s-Arena
```

**2. Install Dependencies:**
```bash
npm install
# or
yarn install
```

**3. Configure Environment Variables:**
Rename `.env.example` to `.env.local` (create one if missing) and provide your keys:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AI Providers
ANTHROPIC_API_KEY=your_anthropic_key
GROQ_API_KEY=your_groq_key

# Email
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_app_password
```

**4. Run the Development Server:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running.

---

## 🤝 **Contributing**

We welcome contributions from the community!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 **Support The Creator**

Built with ❤️ by **Kholofelo Robyn Rababalela**.
If you found this project useful or have any questions:
* [Buy me a coffee on Ko-fi](https://ko-fi.com/robynawesome)
* [Support via PayPal](https://www.paypal.me/osheenviews)

⭐⭐⭐ **Don't forget to star this repository!** ⭐⭐⭐
