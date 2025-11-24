# University Appointment Scheduler (MVP)

A modern, responsive web application that enables students to book appointments with teachers and allows teachers to manage their schedules. This is an educational MVP demonstrating full-stack development skills using React, TypeScript, and localStorage as a mock backend.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## ✨ Features

### For Students

- ✅ Browse available appointment slots from all teachers
- ✅ Filter slots by availability
- ✅ Book appointments with optional notes
- ✅ View upcoming and past appointments
- ✅ Cancel appointments (with 24-hour policy enforcement)
- ✅ Conflict detection (prevents double-booking)
- ✅ Booking restrictions (cannot book <1 hour before slot)

### For Teachers

- ✅ Create appointment time slots with location and capacity
- ✅ Edit and delete slots (if no bookings exist)
- ✅ View all booked appointments with student details
- ✅ Mark appointments as attended
- ✅ Cancel appointments (emergency override)
- ✅ Manage multiple slots per day

### System Features

- ✅ **Firebase Authentication** (fake implementation for demo)
- ✅ Sign up with email and password
- ✅ Sign in with existing account
- ✅ Password reset functionality (simulated)
- ✅ Role-based access control (Student/Teacher views)
- ✅ Session persistence across page refreshes
- ✅ Real-time validation and error handling
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility compliant (WCAG 2.1 Level A)
- ✅ Toast notifications for user feedback
- ✅ Data persistence via localStorage
- ✅ Simulated network delays (realistic UX)

---

## 🛠 Tech Stack

| Category               | Technology                | Purpose                                                 |
| ---------------------- | ------------------------- | ------------------------------------------------------- |
| **Frontend Framework** | React 18                  | Component-based UI architecture                         |
| **Language**           | TypeScript 5.3            | Type safety and better developer experience             |
| **Build Tool**         | Vite 5                    | Fast development server and optimized production builds |
| **Styling**            | Tailwind CSS 3            | Utility-first CSS framework for rapid UI development    |
| **Authentication**     | Fake Firebase Auth        | Email/password sign up and sign in (educational demo)   |
| **State Management**   | React Hooks               | useState, useEffect for local component state           |
| **Mock Backend**       | localStorage + Custom API | Simulates REST API with persistent storage              |
| **Type Checking**      | TypeScript                | Compile-time type safety                                |
| **Package Manager**    | npm                       | Dependency management                                   |

---

## 📁 Project Structure

```
FinalExam2025/
├── docs/                          # Complete project documentation
│   ├── SYSTEM_REQUIREMENTS.md     # Task 1: Requirements analysis
│   ├── SECURITY_PDPA.md           # Task 2: Security & compliance
│   ├── AI_PROMPTS.md              # Task 3: AI-assisted development
│   ├── ARCHITECTURE.md            # Task 4: System architecture
│   └── WIREFRAMES.md              # Task 4: UI/UX wireframes
├── public/
│   └── favicon.svg                # App icon
├── src/
│   ├── components/                # Reusable React components
│   │   ├── AppointmentList.tsx    # Display appointments
│   │   ├── BookModal.tsx          # Booking confirmation modal
│   │   ├── Header.tsx             # Navigation header
│   │   ├── SlotList.tsx           # Display time slots
│   │   ├── SlotModal.tsx          # Slot creation/editing modal
│   │   └── Toast.tsx              # Notification toasts
│   ├── lib/                       # Business logic & data
│   │   ├── fakeFirebase.ts        # Simulated Firebase Authentication
│   │   ├── mockApi.ts             # Simulated REST API
│   │   └── seed.ts                # Initial data population
│   ├── pages/                     # Page-level components
│   │   ├── AuthPage.tsx           # Sign up / Sign in page
│   │   ├── Dashboard.tsx          # Student dashboard
│   │   └── TeacherSchedule.tsx    # Teacher schedule management
│   ├── types/                     # TypeScript type definitions
│   │   └── index.ts               # User, Slot, Appointment types
│   ├── utils/                     # Helper functions
│   │   └── helpers.ts             # Date formatting, validation
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles (Tailwind)
├── .gitignore                     # Git ignore rules
├── index.html                     # HTML template
├── package.json                   # Dependencies & scripts
├── postcss.config.cjs             # PostCSS configuration
├── README.md                      # This file
├── tailwind.config.cjs            # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json             # TypeScript config for Node
└── vite.config.ts                 # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd /Users/thirikyawkhaing/Desktop/FinalExam2025
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

The app will automatically open in your default browser. If not, navigate to the URL shown in the terminal.

### First Run

On first launch, the app automatically:

- Seeds demo Firebase Authentication accounts
- Seeds sample users (3 students, 2 teachers)
- Creates appointment slots for the next 2 weeks
- Creates a few sample bookings

**Demo Firebase Auth Accounts:**

| Email            | Password    | Role    |
| ---------------- | ----------- | ------- |
| student@demo.com | password123 | Student |
| teacher@demo.com | password123 | Teacher |

You can also **create your own account** using the sign-up form!

**Legacy Sample Accounts** (from mock data seeding):

**Students:**

- Alice Johnson (alice.johnson@university.edu)
- Bob Martinez (bob.martinez@university.edu)
- Carol Wang (carol.wang@university.edu)

**Teachers:**

- Dr. Robert Smith (robert.smith@university.edu)
- Prof. Emily Chen (emily.chen@university.edu)

---

## 📖 Usage Guide

### Getting Started

1. **First Time:**

   - Option 1: Sign up with your email and password
   - Option 2: Use demo accounts (student@demo.com / teacher@demo.com, password: password123)
   - Choose your role (Student or Teacher) during sign-up

2. **Returning Users:**
   - Sign in with your email and password
   - Your session persists across page refreshes

### As a Student

1. **After Login:**

   - View available appointment slots on the dashboard
   - See teacher name, date, time, location, and availability

2. **Browse Slots:**

   - Scroll through available slots
   - Filter by availability

3. **Book Appointment:**

   - Click "Book Appointment" on any available slot
   - Add optional notes (what you want to discuss)
   - Confirm booking

4. **Manage Appointments:**
   - View your upcoming appointments below the slots
   - Cancel appointments (if >24 hours before)
   - See appointment status and details

### As a Teacher

1. **After Login:**

   - View your schedule dashboard
   - See all your slots and bookings

2. **Create Slots:**

   - Click "Create New Slot"
   - Fill in date, start/end time, location, max students
   - Submit to create

3. **Manage Slots:**

   - View all your slots
   - Edit slots (if no bookings)
   - Delete slots (if no bookings)

4. **Manage Bookings:**
   - View all appointments booked by students
   - See student names, emails, and notes
   - Mark appointments as attended
   - Cancel appointments (if necessary)

### Business Rules

- ⏰ **Booking Window:** Cannot book less than 1 hour before slot start
- 📅 **Cancellation Policy:** Must cancel >24 hours before appointment
- 🚫 **Conflict Prevention:** System prevents overlapping appointments
- 👥 **Capacity Management:** Slots support 1-10 students (configurable)

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

### Task 1: System Requirements (`docs/SYSTEM_REQUIREMENTS.md`)

- Problem statement
- 7 detailed user stories with acceptance criteria
- 4 non-functional requirements (performance, usability, reliability, maintainability)
- 3 key risks with mitigation strategies

### Task 2: Security & PDPA (`docs/SECURITY_PDPA.md`)

- OWASP Top 10 analysis (3 threats with mitigation)
- PDPA data flow (collection, processing, storage, sharing)
- Security checklist (5 items with implementation details)

### Task 3: AI-Assisted Development (`docs/AI_PROMPTS.md`)

- Exact prompts used with AI assistants
- AI-generated tech stack recommendations
- Database schema design (5 tables)
- REST API endpoint specifications (3 key endpoints)
- Adaptation notes for MVP implementation

### Task 4: Architecture & Design (`docs/ARCHITECTURE.md`)

- High-level architecture diagram (Mermaid)
- Component architecture breakdown
- Data flow diagrams
- Security architecture
- Scalability considerations
- Production deployment strategy

### Task 4: UI/UX Wireframes (`docs/WIREFRAMES.md`)

- Student dashboard wireframe
- Teacher schedule wireframe
- Login/role selection wireframe
- UX design decisions with rationale
- Accessibility features (WCAG 2.1 Level A)
- Responsive design strategy

---

## 🏗 Architecture

### High-Level Overview

```
┌─────────────────────────────────────────┐
│           React Frontend                │
│  ┌─────────────────────────────────┐   │
│  │  Pages (Login, Dashboard, etc)  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Components (Header, Modals)    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Mock API Layer (mockApi.ts)    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         localStorage (Database)         │
│  • uas_users                            │
│  • uas_slots                            │
│  • uas_appointments                     │
│  • uas_currentUser (session)            │
└─────────────────────────────────────────┘
```

### Mock API Design

The `mockApi.ts` file simulates a REST API:

- **Network Delay:** 300-700ms random delay per request
- **Console Logging:** All requests logged (e.g., `POST /api/appointments`)
- **Error Handling:** Throws errors for validation failures
- **Data Persistence:** Uses localStorage as database

**Example Migration to Real Backend:**

```typescript
// MVP (Current)
const slots = await getSlots({ available: true });

// Production (Future)
const response = await fetch("/api/slots?available=true", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await response.json();
const slots = data.slots;
```

---

## 💻 Development

### Available Scripts

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check (without building)
npx tsc --noEmit
```

### Development Workflow

1. **Make changes** to source files in `src/`
2. **See changes instantly** via Vite hot module replacement
3. **Check console** for mock API logs
4. **Test across devices** using responsive mode in browser DevTools

### Adding New Features

1. **Define types** in `src/types/index.ts`
2. **Add API functions** in `src/lib/mockApi.ts`
3. **Create components** in `src/components/`
4. **Build pages** in `src/pages/`
5. **Style with Tailwind** utility classes

### localStorage Data Management

**View Data:**

```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem("uas_users")));
console.log(JSON.parse(localStorage.getItem("uas_slots")));
console.log(JSON.parse(localStorage.getItem("uas_appointments")));
console.log(JSON.parse(localStorage.getItem("firebase_auth_users"))); // Auth accounts
console.log(JSON.parse(localStorage.getItem("firebase_current_user"))); // Current session
```

**Reset Data:**

```javascript
// In browser console
localStorage.clear();
// Then refresh page to re-seed
```

**Export Data:**

```javascript
// In browser console
import { exportData } from "./src/lib/seed";
console.log(exportData());
```

### Firebase Authentication Notes

The fake Firebase implementation simulates:

- `signUpWithEmailAndPassword()` - Creates new accounts
- `signInWithEmailAndPassword()` - Authenticates users
- `signOut()` - Logs out current user
- `sendPasswordResetEmail()` - Simulates password reset
- Session persistence via localStorage
- Token-based authentication (fake JWT)

**Security Note:** This is for educational purposes only. Real Firebase uses server-side authentication, bcrypt/scrypt password hashing, and secure token validation.

---

## 🌐 Production Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deployment Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 2: Netlify

1. Go to [Netlify](https://www.netlify.com/)
2. Drag `dist/` folder to deploy
3. Or connect GitHub repo for CI/CD

#### Option 3: GitHub Pages

```bash
npm install gh-pages --save-dev

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

npm run build
npm run deploy
```

### ⚠️ Important: Production Warnings

**DO NOT DEPLOY THIS MVP TO PRODUCTION AS-IS!**

This application uses:

- ❌ Fake Firebase authentication (client-side only, no real security)
- ❌ localStorage (data lost on browser clear)
- ❌ No backend (all logic client-side)
- ❌ Fake password hashing (reversible, insecure)

For production, implement:

- ✅ Real Firebase Authentication or custom auth server
- ✅ Real backend (Node.js + Express + PostgreSQL)
- ✅ JWT authentication with bcrypt password hashing
- ✅ HTTPS/TLS encryption
- ✅ Server-side validation
- ✅ Rate limiting
- ✅ Database backups
- ✅ Monitoring and logging

See `docs/ARCHITECTURE.md` for full production migration plan.

---

## ⚠️ Known Limitations

### MVP Constraints

1. **Fake Firebase Authentication**

   - Client-side only implementation (not real Firebase)
   - Fake password hashing (reversible, educational purposes only)
   - No server-side validation
   - Session tokens stored in localStorage (not secure)
   - **Use Case:** Educational demonstration of Firebase-like authentication flow
   - **Production:** Use real Firebase SDK or implement proper auth server

2. **localStorage Storage**

   - Data cleared if user clears browser cache
   - Limited to ~5-10MB storage
   - No synchronization across devices/browsers
   - **Mitigation:** Export/import functionality (future)

3. **No Real-Time Updates**

   - Changes don't sync across tabs
   - Multiple users can't coordinate bookings
   - **Mitigation:** Page refresh, or implement WebSockets in production

4. **Single-User Simulation**

   - Designed for one user at a time per browser
   - Race conditions possible if multiple tabs open
   - **Production:** Backend with database transactions resolves this

5. **No Email Notifications**

   - Users don't receive booking confirmations or password reset emails
   - Password reset is simulated only
   - **Future:** Integrate SendGrid/AWS SES with real Firebase

6. **Limited Error Recovery**

   - If localStorage gets corrupted, must clear and re-seed
   - **Future:** Implement data migration and recovery tools

7. **Password Security**
   - Fake hashing is reversible (educational only)
   - Real Firebase uses secure server-side bcrypt/scrypt
   - **Never use this pattern in production**

---

## 🚀 Future Enhancements

### Phase 1: Backend Integration (Weeks 1-2)

- [ ] Set up Node.js + Express + PostgreSQL
- [ ] Migrate mockApi functions to real API endpoints
- [ ] Implement JWT authentication
- [ ] Deploy backend to Railway/Render

### Phase 2: Production Features (Week 3-4)

- [ ] Email notifications (booking confirmations, reminders)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Admin dashboard for system management
- [ ] Analytics and reporting

### Phase 3: Advanced Features (Month 2+)

- [ ] Recurring appointment slots (office hours templates)
- [ ] Wait-list functionality for fully booked slots
- [ ] Video conferencing integration (Zoom, Teams)
- [ ] Mobile apps (React Native)
- [ ] Multi-language support (i18n)

---

## 📸 Screenshots

### Student Dashboard

![Student Dashboard - Browse and book appointments]
_To capture: Open app as student, screenshot the dashboard with available slots_

### Teacher Schedule

![Teacher Schedule - Manage slots and view bookings]
_To capture: Open app as teacher, screenshot the schedule management page_

### Booking Modal

![Booking Confirmation - Student booking an appointment]
_To capture: Click "Book Appointment" button, screenshot the modal_

---

## 🧪 Testing

### Manual Testing Checklist

### Manual Testing Checklist

**Authentication Flow:**

- [ ] Can sign up with new email and password
- [ ] Cannot sign up with existing email
- [ ] Password must be at least 6 characters
- [ ] Can sign in with demo accounts (student@demo.com / teacher@demo.com)
- [ ] Cannot sign in with wrong password
- [ ] Session persists after page refresh
- [ ] Can sign out and return to auth page
- [ ] Password reset sends success message

**Student Flow:**

- [ ] Can sign in as student
- [ ] Can view available slots
- [ ] Can book an available slot
- [ ] Cannot book slot <1 hour before start
- [ ] Cannot book overlapping appointments
- [ ] Can cancel appointment >24 hours before
- [ ] Cannot cancel appointment <24 hours before
- [ ] Can view appointment details

**Teacher Flow:**

- [ ] Can sign in as teacher
- [ ] Can create new time slot
- [ ] Cannot create overlapping slots
- [ ] Can edit slot with no bookings
- [ ] Cannot edit slot with bookings
- [ ] Can delete slot with no bookings
- [ ] Cannot delete slot with bookings
- [ ] Can view student booking details
- [ ] Can mark appointment as attended
- [ ] Can cancel appointment (emergency)

**UI/UX:**

- [ ] Responsive design works on mobile
- [ ] Keyboard navigation functional
- [ ] Screen reader compatibility
- [ ] Toast notifications appear/disappear correctly
- [ ] Loading states display
- [ ] Error messages are clear

---

## 🤝 Contributing

This is an educational project. If extending for learning:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - Feel free to use for educational purposes.

---

## 👨‍💻 Author

**Thiri Kyaw Khaing**

- University Project - Final Exam 2025
- Demonstrates: React, TypeScript, Tailwind CSS, Software Architecture, Security Analysis

---

## 📞 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Clear localStorage** (might be corrupted):
   ```javascript
   localStorage.clear();
   // Then refresh page
   ```
3. **Verify Node.js version** (should be v18+):
   ```bash
   node --version
   ```
4. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 🎓 Learning Objectives Achieved

This project demonstrates proficiency in:

✅ **Frontend Development**

- React functional components with hooks
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Accessibility best practices

✅ **Software Architecture**

- Component-based architecture
- Separation of concerns (UI, logic, data)
- Mock API design patterns
- State management

✅ **System Design**

- Requirements analysis
- Security considerations (OWASP, PDPA)
- Scalability planning
- Documentation practices

✅ **Project Management**

- Structured documentation (Tasks 1-4)
- AI-assisted development workflow
- Version control
- Deployment strategy

---

## 🌟 Key Takeaways

1. **Mock Backend Pattern:** localStorage + Promise-based API wrapper creates realistic dev experience
2. **TypeScript Benefits:** Catch errors at compile time, better IDE support
3. **Tailwind CSS:** Rapid UI development without writing CSS files
4. **Documentation First:** Clear docs make project maintainable
5. **Security Awareness:** Even MVPs should consider production security path

---

**🎉 Thank you for reviewing this project!**

For detailed technical documentation, see the `docs/` folder.
