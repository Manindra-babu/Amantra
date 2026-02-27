# Amantra

**Financial Trust for the Digital Age**

Amantra is a Progressive Web App (PWA) for creating, managing, and tracking financial bonds and agreements between parties. From small lending circles to formal contracts, Amantra brings trust to digital finance with real-time updates and a transparent change-request workflow.

## Features

- **Bond Management** — Create, view, and track financial bonds with terms, amounts, and due dates
- **Real-Time Updates** — All data syncs automatically via Firestore real-time listeners
- **Change Request Workflow** — Request, review, approve, or decline changes to bond terms
- **Dual Perspectives** — Separate views for lenders (creators) and recipients (counterparties)
- **Bond History** — Full history of all created and received bonds
- **Calendar View** — Visual overview of upcoming bond due dates
- **User Profiles** — Profile page with bond statistics and reputation scoring
- **QR Code Sharing** — Share bond details via a Digital Bond QR code
- **Audit Logging** — All actions are recorded for transparency
- **Dark / Light Mode** — Theme support via Tailwind CSS
- **PWA Support** — Installable on mobile and desktop with offline capabilities

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, JavaScript (ES6 Modules) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Icons | [Material Symbols](https://fonts.google.com/icons) |
| Font | [Manrope](https://fonts.google.com/specimen/Manrope) (Google Fonts) |
| Backend | [Firebase](https://firebase.google.com/) (Authentication, Firestore) |
| Hosting | Firebase Hosting |

## Project Structure

```
Amantra/
├── public/                     # Hosted application root
│   ├── index.html              # Entry point
│   ├── landing.html            # Marketing / landing page
│   ├── signin.html             # Sign in
│   ├── signup.html             # Sign up
│   ├── dashboard.html          # Main dashboard
│   ├── newbond.html            # Create a new bond
│   ├── lenderbondview.html     # Bond detail view (lender)
│   ├── recipientbondview.html  # Bond detail view (recipient)
│   ├── bondhistory.html        # Bond history table
│   ├── allrequests.html        # All change requests
│   ├── requestchange.html      # Submit a change request
│   ├── reviewrequestchange.html# Review a change request
│   ├── calendar.html           # Calendar view
│   ├── profile.html            # User profile & stats
│   ├── manifest.json           # PWA manifest
│   ├── service-worker.js       # Service worker for offline support
│   ├── assets/                 # Images and icons
│   └── js/
│       ├── firebase-config.js  # Firebase SDK initialisation
│       ├── auth_check.js       # Auth guard
│       ├── dashboard.js        # Dashboard logic (real-time)
│       ├── allrequests.js      # Requests list (real-time)
│       ├── bondhistory.js      # Bond history (real-time)
│       ├── lenderbondview.js   # Lender bond view (real-time)
│       ├── recipientbondview.js# Recipient bond view (real-time)
│       ├── profile.js          # Profile & stats (real-time)
│       ├── newbond.js          # New bond form
│       ├── signin.js           # Sign-in logic
│       ├── signup.js           # Sign-up logic
│       └── ...
├── firebase.json               # Firebase Hosting config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
└── .firebaserc                 # Firebase project alias
```

## Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles (read/write restricted to owner) |
| `contracts` | Financial bonds/agreements between parties |
| `requests` | Change requests on existing contracts |
| `auditLogs` | Audit trail for all actions |

## Getting Started

### Prerequisites

- A [Firebase](https://firebase.google.com/) project with **Authentication** and **Firestore** enabled
- [Firebase CLI](https://firebase.google.com/docs/cli) installed (`npm install -g firebase-tools`)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Himanth-reddy/Amantra.git
   cd Amantra
   ```

2. **Configure Firebase**
   Update `public/js/firebase-config.js` with your own Firebase project credentials.

3. **Deploy Firestore rules and indexes**
   ```bash
   firebase deploy --only firestore
   ```

4. **Run locally**
   ```bash
   firebase serve
   ```
   The app will be available at `http://localhost:5000`.

5. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy
   ```

## CI/CD — Automatic Deployment

Every push to the `main` branch triggers a GitHub Actions workflow that deploys the site to Firebase Hosting automatically.

### One-time setup

1. In the Firebase console, go to **Project Settings → Service accounts** and click **Generate new private key** to download a JSON key file.
2. In your GitHub repository, go to **Settings → Secrets and variables → Actions** and create a secret named `FIREBASE_SERVICE_ACCOUNT` with the contents of the JSON key file.

After this, any commit merged into `main` will be deployed to Firebase Hosting without manual intervention.

## License

This project is provided as-is for educational and personal use.


