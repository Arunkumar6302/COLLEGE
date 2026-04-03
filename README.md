# UniTrack | Smart College Bus Tracking System (SaaS)

UniTrack is a state-of-the-art, premium SaaS-based transit management platform for educational institutions. It leverages real-time IoT integration, Geolocation, and AI to provide a seamless commuting experience for students, faculty, and administrators.

## 🚀 Key Features
- **Real-time GPS Tracking**: Live bus locations on high-fidelity Leaflet maps.
- **Multi-Tenant SaaS**: Data isolation for multiple colleges and organizations.
- **Mission Control Dashboards**: Tailored experiences for Admins, Drivers, and Students.
- **AI-Powered Assistance**: Context-aware chatbot using Groq (LLM) for routing queries.
- **Safety Alerts**: Geo-fencing notifications via Firebase Cloud Messaging.
- **IoT-Ready**: Integrated ThingSpeak API support for hardware-based GPS units.

## 🧱 Technology Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion, Leaflet.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **AI & Integrations**: Groq Cloud API, Firebase Admin SDK, ThingSpeak.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas / Local Instance
- Firebase Project (for notifications)
- Groq Cloud API Key

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` with your Mongo URI and API keys.
4. `npm start` (Runs on port 5000)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on http://localhost:5173)

## 🎨 Design Aesthetics
Built with **Glassmorphism**, **Dynamic Gradients**, and a **Mobile-First Responsive Layout**. The UI is designed to feel premium, futuristic, and highly interactive.
