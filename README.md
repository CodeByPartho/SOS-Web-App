# 🚨 SOS GUARD — Emergency Help App

A fully offline-capable, browser-based emergency SOS app. No installation needed.

---

## 🚀 Quick Start

1. **Open `index.html`** in any modern browser (Chrome, Edge, Firefox, Safari)
2. **Add emergency contacts** via the Contacts tab
3. In an emergency, **hold the SOS button for 2 seconds**

---

## 📱 Features

### Core
| Feature | How it works |
|---|---|
| **SOS Button** | Hold for 2 seconds to trigger full alert sequence |
| **Live GPS** | Auto-acquires location; included in SMS as Google Maps link |
| **SMS to All Contacts** | Opens SMS with pre-filled emergency message |
| **Auto-Call** | Calls primary contact automatically after SOS |
| **Loud Alarm** | Web Audio API generates piercing alarm sound |
| **Low Battery Mode** | Strips animations/effects for minimal resource use |

### Quick Actions (Home Screen)
- **🔊 Sound Alarm** — Toggle alarm on/off independently
- **📤 Share Location** — Share GPS link via device share sheet
- **📞 Emergency Call** — Directly call primary contact
- **💬 Send SMS** — Send SMS without full SOS trigger

---

## ⚙️ Settings

- **Custom SOS Message** — Edit the message sent. Use `{LOCATION}` for the GPS link placeholder.
- **Auto-call toggle** — Enable/disable auto-call on SOS
- **Auto-alarm toggle** — Enable/disable alarm sound on SOS
- **Low Battery Mode** — Minimal UI for battery conservation
- **Test Alert** — Preview exactly what message will be sent

---

## 📋 SMS Message Format

Default:
```
🆘 EMERGENCY! I need help! My current location: https://maps.google.com/?q=LAT,LON
```

---

## 🔧 How to Use on Mobile

1. Open the app in **Chrome for Android** or **Safari for iOS**
2. Tap **Add to Home Screen** (from browser menu) for app-like access
3. Grant **Location** and **Microphone** permissions when prompted

### iOS Note:
- SMS links open the Messages app with the message pre-filled
- You must tap Send manually (iOS security restriction)

### Android Note:
- SMS links open your default SMS app
- Some Android browsers auto-send; others require a tap

---

## 📞 Emergency Contacts

- Add contacts with **name** and **full phone number** (include country code, e.g., `+8801711XXXXXX`)
- Mark one as **Primary** — this contact gets called first
- You can add multiple contacts; all will receive SMS alerts

---

## 🔋 Low Battery Mode

Activates automatically if battery drops below 15%. You can also toggle it manually in Settings. It:
- Disables animated rings around SOS button
- Removes background gradients
- Hides non-essential UI elements
- Keeps core SOS functionality fully intact

---

## 🗂️ File Structure

```
SOS App/
├── index.html     ← Open this file to run the app
├── style.css      ← Styling
├── app.js         ← All logic
└── README.md      ← This file
```

---

## 🌐 Works Offline

All files are local. No internet connection needed (except for Google Maps links in SMS).

---

## ⚠️ Important Notes

- **This is a web app** — it cannot send SMS automatically without user confirmation on most devices (browser security restriction)
- For **fully automatic silent SMS**, a native Android/iOS app would be required
- Always test the app before an emergency
- Keep the app bookmarked or on your home screen for fast access

---

*SOS Guard — Stay safe, stay connected.*
