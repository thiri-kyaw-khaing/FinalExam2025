# System Requirements Analysis

## Problem Statement

University scheduling is often fragmented, with students and teachers coordinating appointments through email, phone calls, or in-person discussions, leading to inefficiencies, missed appointments, and scheduling conflicts. Students struggle to find available time slots that fit their schedules, while teachers lack visibility into their appointment calendars and struggle to manage multiple booking requests. There is no centralized system to prevent double-bookings, enforce cancellation policies, or provide a clear overview of upcoming appointments. This manual process wastes time for both parties and creates frustration when appointments are missed or poorly coordinated. A digital appointment scheduler would streamline the booking process, reduce administrative overhead, enforce business rules automatically, and improve the overall experience for both students and teachers.

## Core User Stories

### US-001: Student Views Available Slots

**As a** student  
**I want to** view all available appointment slots from different teachers  
**So that** I can find a convenient time to meet with my instructor

**Acceptance Criteria:**

- Display slots with date, time, teacher name, location, and available seats
- Filter by date range or teacher
- Show only future slots that are not fully booked
- Indicate which slots are available for booking

**Priority:** HIGH  
**Maps to:** Task 1 - Core Functionality Requirement

---

### US-002: Student Books an Appointment

**As a** student  
**I want to** book an available appointment slot  
**So that** I can schedule a meeting with my teacher

**Acceptance Criteria:**

- Click on an available slot to initiate booking
- Confirm booking details before submission
- Receive immediate confirmation of the booking
- Prevent booking if slot conflicts with existing appointments
- Prevent booking less than 1 hour before slot time

**Priority:** HIGH  
**Maps to:** Task 1 - Core Functionality & Business Rules

---

### US-003: Student Cancels Appointment (24h Policy)

**As a** student  
**I want to** cancel my booked appointment at least 24 hours in advance  
**So that** I can free up the slot for others and avoid penalties

**Acceptance Criteria:**

- View list of my booked appointments
- Cancel button available only if >24 hours before appointment
- Show warning if within cancellation window
- Update slot availability immediately after cancellation
- Receive cancellation confirmation

**Priority:** HIGH  
**Maps to:** Task 1 - Business Rules & Policy Enforcement

---

### US-004: Teacher Creates Appointment Slots

**As a** teacher  
**I want to** create appointment slots with specific dates, times, and capacities  
**So that** students can book meetings with me during my available hours

**Acceptance Criteria:**

- Specify start time, end time, location
- Set maximum number of students per slot (default 1)
- Save slots that appear in student booking interface
- Prevent creating overlapping slots
- Edit or delete slots that have no bookings

**Priority:** HIGH  
**Maps to:** Task 1 - Core Functionality for Teachers

---

### US-005: Teacher Views and Manages Bookings

**As a** teacher  
**I want to** view all appointments booked by students  
**So that** I can prepare for meetings and manage my schedule

**Acceptance Criteria:**

- Display list of upcoming appointments with student names
- Show appointment status (booked, attended, cancelled)
- Mark appointments as attended after they occur
- Cancel appointments with notification (emergency scenarios)
- View appointment history

**Priority:** HIGH  
**Maps to:** Task 1 - Teacher Management Features

---

### US-006: System Prevents Double-Booking

**As a** student or teacher  
**I want** the system to prevent double-bookings  
**So that** scheduling conflicts are automatically avoided

**Acceptance Criteria:**

- Check for overlapping appointments before confirming booking
- Show error message if conflict detected
- Validate slot capacity before allowing booking
- Real-time availability updates

**Priority:** CRITICAL  
**Maps to:** Task 1 - Data Integrity & Business Rules

---

### US-007: Role-Based Access Control

**As a** system user  
**I want** to see different interfaces based on my role (student/teacher)  
**So that** I only access features relevant to my responsibilities

**Acceptance Criteria:**

- Students see booking dashboard and their appointments
- Teachers see schedule management and all their slot bookings
- Authentication determines which view is displayed
- Clear indication of current role

**Priority:** MEDIUM  
**Maps to:** Task 1 - User Management & Security

---

## Non-Functional Requirements

### NFR-001: Performance & Responsiveness

**Requirement:** The application must load and respond to user interactions within 2 seconds under normal conditions.  
**Rationale:** Users expect quick feedback when browsing and booking appointments. Delays can lead to frustration and abandoned bookings.  
**Measurement:** Page load time, API response time simulation (300-700ms mock delay)  
**Maps to:** Task 1 - System Quality Attributes

---

### NFR-002: Usability & Accessibility

**Requirement:** The interface must be intuitive, mobile-responsive, and meet WCAG 2.1 Level A accessibility standards.  
**Rationale:** Students and teachers will access the system from various devices. Accessibility ensures inclusivity for users with disabilities.  
**Implementation:**

- Responsive Tailwind CSS design (mobile-first)
- ARIA labels on interactive elements
- Keyboard navigation support
- Clear form labels and error messages
- High contrast colors for readability

**Maps to:** Task 1 & 4 - UX/UI Requirements

---

### NFR-003: Data Persistence & Reliability

**Requirement:** All bookings, slots, and user data must persist across browser sessions using localStorage.  
**Rationale:** Users need their data to remain available even after closing the browser. Data loss would undermine trust in the system.  
**Implementation:**

- localStorage for persistent storage (MVP approach)
- Data validation before save
- Graceful error handling for storage failures
- Seeding mechanism for initial data

**Maps to:** Task 1 - Data Management

---

### NFR-004: Maintainability & Code Quality

**Requirement:** Code must follow TypeScript best practices, be well-documented, and use modular component architecture.  
**Rationale:** Future developers need to understand and extend the system easily. Clear code structure reduces maintenance costs.  
**Implementation:**

- TypeScript for type safety
- Component-based React architecture
- Inline comments explaining integration points
- Separation of concerns (components, utils, types, mock API)

**Maps to:** Task 1 - Software Engineering Best Practices

---

## Key Risks & Threats

### Risk 1: Data Loss (localStorage Limitations)

**Description:** Browser localStorage can be cleared by users or have size limitations (typically 5-10MB), potentially leading to data loss.  
**Impact:** HIGH - Users could lose all appointment data  
**Likelihood:** MEDIUM - Users may clear browser data or switch devices  
**Mitigation:**

- Clear warnings in README about MVP limitations
- Export/import functionality for backup (future enhancement)
- Migration path documented for real backend integration
- Regular reminders for users to not clear browser data

**Maps to:** Task 1 - Risk Management

---

### Risk 2: No Real-Time Synchronization

**Description:** Multiple users viewing the same slot may attempt to book simultaneously, with no server-side coordination to prevent race conditions.  
**Impact:** MEDIUM - Could lead to overbooking in multi-user scenarios  
**Likelihood:** LOW - MVP is single-browser simulation  
**Mitigation:**

- Client-side validation checks slot capacity
- Mock API simulates network delays realistically
- Documentation clearly states this is a single-user MVP
- Real backend integration plan includes pessimistic locking

**Maps to:** Task 1 - Technical Limitations

---

### Risk 3: Security Vulnerabilities (No Real Authentication)

**Description:** Mock authentication doesn't provide real security, making the system vulnerable if deployed publicly.  
**Impact:** CRITICAL if deployed; LOW for local MVP  
**Likelihood:** N/A for local use; HIGH if deployed without backend  
**Mitigation:**

- Clear warnings: "DO NOT DEPLOY TO PRODUCTION"
- Documentation includes authentication upgrade path
- README emphasizes educational/demonstration purpose
- Security best practices documented for future implementation

**Maps to:** Task 1 & 2 - Security Considerations

---

## Mapping to Task 1 Rubric

| Rubric Item                           | Coverage in This Document                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| **Problem Statement (4-6 sentences)** | ✅ Provided in Problem Statement section                                        |
| **Core User Stories (≥5)**            | ✅ Seven detailed user stories with acceptance criteria                         |
| **Non-Functional Requirements (≥3)**  | ✅ Four NFRs covering performance, usability, data persistence, maintainability |
| **Key Risks & Threats (3 items)**     | ✅ Three risks with impact, likelihood, and mitigation                          |
| **Clarity and Organization**          | ✅ Structured sections with clear headers                                       |
| **Technical Feasibility**             | ✅ All requirements implementable with chosen tech stack                        |

---

## Future Enhancements (Out of MVP Scope)

- Email/SMS notifications for appointment reminders
- Calendar integration (Google Calendar, Outlook)
- Admin dashboard for system-wide management
- Analytics and reporting features
- Video conferencing integration
- Recurring appointment slots
- Wait-list functionality for fully booked slots
