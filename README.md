<div align="center">

  <h1>🚨 SOS Guard</h1>

  <p><b>Browser-Based Emergency Distress & Rapid Alert System</b></p>

  <p>
    A standalone, zero-installation mobile and desktop web application that delivers instant emergency response: one-touch GPS distress SMS dispatch, automated siren alarm synthesis, and primary contact speed dialing.
  </p>

  <p>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/HTML"><img src="https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" /></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/CSS"><img src="https://img.shields.io/badge/CSS3-Responsive-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" /></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API"><img src="https://img.shields.io/badge/Web_Audio-API-FF5722?style=for-the-badge" alt="Web Audio API" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>
  </p>

</div>

---

## 📖 Overview

**SOS Guard** is designed for critical moments when dialing numbers or manually sharing coordinates takes too long. Running entirely client-side with zero third-party tracking or mandatory signups, it leverages native web APIs (Geolocation, Web Audio API, Web Share, and Battery Status) to turn any smartphone or computer browser into a dedicated safety beacon.

Holding the central SOS button triggers an automated 2-second fail-safe sequence: locking GPS coordinates into a Google Maps link, staging an emergency SMS to all saved contacts, synthesizing an acoustic siren, and placing an immediate phone call.

---

## 🚀 Key Features

- 🛑 **Fail-Safe SOS Trigger** — 2-second press-and-hold activation with haptic/visual countdown prevents accidental triggers while remaining effortless under duress.
- 📍 **Real-Time GPS Geolocation** — Automatically acquires high-accuracy latitude and longitude coordinates, appending a direct Google Maps link to outbound emergency messages.
- 📱 **Multi-Contact SMS Dispatch** — Opens the native mobile SMS messenger pre-populated with emergency text, coordinates, and contact recipients.
- 🔊 **Web Audio Siren Synthesizer** — Uses the browser's native oscillator to produce an alternating high-decibel siren alarm without downloading external sound files.
- 📞 **Direct Speed Dialing** — Immediately prompts a direct telephone call (`tel:`) to your designated primary emergency contact.
- 🔋 **Battery-Aware Conservation** — Detects low battery thresholds via the Battery API and automatically strips non-essential animations to preserve power.
- 🔒 **100% On-Device Privacy** — All emergency contacts and preferences are saved strictly in browser `localStorage`. No data ever touches a remote server.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Logic & State** | Vanilla JavaScript (ES6+) | Event orchestration, countdown timers & local storage persistence |
| **Acoustic Engine** | [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Client-side dual-tone audio oscillator for siren generation |
| **Location Services** | [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) | Accurate device GPS coordinate acquisition |
| **Styling & Motion** | Pure CSS3 (Flexbox/Grid) | Glassmorphic mobile-first design with high-contrast emergency theme |
| **System Integration** | Web Share & Battery APIs | Native OS share sheet and power conservation detection |

---

## 💻 Getting Started

### Usage (No Build Required)

Because **SOS Guard** is built with native web technologies, no build tools or package managers are required.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/CodeByPartho/SOS-Web-App.git
   cd SOS-Web-App
   ```

2. **Run locally**:
   - Simply double-click `index.html` to open it in Chrome, Safari, Edge, or Firefox.
   - Alternatively, serve via any lightweight static server:
     ```bash
     npx serve .
     # or
     python -m http.server 8000
     ```

3. **Configure Contacts**:
   - Open the **Contacts** tab in the bottom navigation.
   - Enter your primary emergency contact's name and phone number.
   - You can add multiple secondary contacts to be notified via SMS.

---

## 📄 License

This project is licensed under the **[MIT License](LICENSE)**.

---

<p align="center">Made with ❤️ by Partho</p>
