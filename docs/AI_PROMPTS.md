# AI-Assisted Development Prompts & Outputs

## Overview

This document contains the exact prompts used with AI assistants (ChatGPT/Claude) to generate technical recommendations, database schemas, and API designs for the University Appointment Scheduler project. The outputs have been adapted for our MVP implementation using mock backends and localStorage.

---

## Prompt 1: Tech Stack Recommendation

### Exact Prompt Used:

```
I'm building a University Appointment Scheduler where students can book appointments
with teachers. The requirements are:
- Students need to view available time slots and book appointments
- Teachers need to create time slots and manage bookings
- Must prevent double-booking and enforce a 24-hour cancellation policy
- Should be quick to develop as an MVP
- Need role-based access (student vs teacher views)
- Should have a modern, responsive UI
- Educational project to demonstrate full-stack skills

What technology stack would you recommend for frontend, backend, database, and any
supporting tools? Please consider ease of development, learning curve, and industry
relevance.
```

### AI-Generated Output:

**Recommended Technology Stack:**

**Frontend:**

- **React + TypeScript:** Component-based architecture with type safety, excellent for role-based UI
- **Vite:** Fast build tool with hot module replacement, much faster than Create React App
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development without writing custom CSS
- **React Router:** Client-side routing for navigation between student and teacher views
- **Axios or Fetch API:** HTTP client for backend communication

**Backend:**

- **Node.js + Express:** JavaScript/TypeScript throughout the stack, minimal learning curve
- **TypeScript:** Type safety reduces bugs and improves code maintainability
- **JWT (jsonwebtoken):** Stateless authentication with role claims
- **bcrypt:** Secure password hashing
- **Express Validator:** Input validation middleware

**Database:**

- **PostgreSQL:** Robust relational database with excellent support for constraints and transactions
- **Prisma ORM:** Type-safe database client that auto-generates TypeScript types from schema
- **Alternative:** MongoDB if you prefer NoSQL, but relational structure fits scheduling well

**Supporting Tools:**

- **Docker:** Containerization for consistent dev/prod environments
- **ESLint + Prettier:** Code quality and formatting
- **Jest + React Testing Library:** Unit and integration testing
- **Git + GitHub:** Version control and collaboration
- **Postman:** API testing during development

**Why This Stack:**

1. **Full TypeScript:** Type safety across frontend and backend reduces runtime errors
2. **React Ecosystem:** Largest community, abundant resources, highly marketable skill
3. **Prisma + PostgreSQL:** Type-safe database queries prevent SQL injection, migrations built-in
4. **Fast Development:** Vite + Tailwind enable rapid prototyping
5. **Industry Standard:** This stack is used by many startups and enterprises

**Deployment Options:**

- Frontend: Vercel, Netlify (free tiers available)
- Backend: Railway, Render, Heroku
- Database: Railway, Supabase, ElephantSQL (PostgreSQL hosting)

---

## Prompt 2: Database Schema Design

### Exact Prompt Used:

```
For the University Appointment Scheduler system, I need a database schema that supports:
- User management (students and teachers with authentication)
- Teachers creating appointment time slots with capacity
- Students booking appointments
- Preventing double-booking
- Tracking appointment status (booked, cancelled, attended)
- Enforcing 24-hour cancellation policy

Please design 3-5 database tables with:
- Table names
- Column names with data types
- Primary keys and foreign keys
- Indexes for performance
- Constraints to enforce business rules

Use PostgreSQL/SQL syntax.
```

### AI-Generated Output:

**Database Schema Design:**

#### Table 1: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Purpose:** Store user accounts with role-based access control. Password hash uses bcrypt. UUID primary key prevents enumeration attacks.

---

#### Table 2: appointment_slots

```sql
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  max_capacity INTEGER DEFAULT 1 CHECK (max_capacity > 0),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Business rule: end time must be after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time),

  -- Prevent overlapping slots for same teacher (handled in application logic or trigger)
  CONSTRAINT no_overlap EXCLUDE USING GIST (
    teacher_id WITH =,
    tsrange(start_time, end_time) WITH &&
  )
);

-- Indexes
CREATE INDEX idx_slots_teacher ON appointment_slots(teacher_id);
CREATE INDEX idx_slots_start_time ON appointment_slots(start_time);
CREATE INDEX idx_slots_available ON appointment_slots(is_available);
```

**Purpose:** Store time slots created by teachers. EXCLUDE constraint prevents overlapping slots. Supports group bookings via max_capacity.

---

#### Table 3: appointments

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES appointment_slots(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'BOOKED'
    CHECK (status IN ('BOOKED', 'CANCELLED', 'ATTENDED', 'NO_SHOW')),
  booking_notes TEXT,
  cancellation_reason TEXT,
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP,
  attended_at TIMESTAMP,

  -- Prevent student booking same slot twice
  UNIQUE(slot_id, student_id)
);

-- Indexes
CREATE INDEX idx_appointments_slot ON appointments(slot_id);
CREATE INDEX idx_appointments_student ON appointments(student_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```

**Purpose:** Track individual bookings. Unique constraint prevents duplicate bookings. Status field tracks appointment lifecycle.

---

#### Table 4: notifications (Optional - Future Enhancement)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

**Purpose:** Store in-app notifications for appointment confirmations, reminders, and cancellations.

---

#### Table 5: audit_log (Optional - Compliance)

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
```

**Purpose:** Audit trail for compliance (PDPA). Tracks all CRUD operations on sensitive data.

---

### Business Logic Implementation Notes:

**Preventing Double-Booking:**

```sql
-- Query to check capacity before booking
SELECT
  (a_slots.max_capacity - COUNT(a.id)) AS available_seats
FROM appointment_slots a_slots
LEFT JOIN appointments a ON a.slot_id = a_slots.id
  AND a.status = 'BOOKED'
WHERE a_slots.id = $slot_id
GROUP BY a_slots.id, a_slots.max_capacity;

-- Only allow booking if available_seats > 0
```

**Enforcing 24-Hour Cancellation Policy:**

```sql
-- Check if cancellation is allowed
SELECT
  CASE
    WHEN a_slots.start_time - INTERVAL '24 hours' > CURRENT_TIMESTAMP
    THEN true
    ELSE false
  END AS can_cancel
FROM appointments a
JOIN appointment_slots a_slots ON a.slot_id = a_slots.id
WHERE a.id = $appointment_id;
```

**Preventing Student Overlapping Appointments:**

```sql
-- Check for conflicts before booking
SELECT COUNT(*) FROM appointments a
JOIN appointment_slots a_slots ON a.slot_id = a_slots.id
WHERE a.student_id = $student_id
  AND a.status = 'BOOKED'
  AND tsrange($new_start, $new_end) && tsrange(a_slots.start_time, a_slots.end_time);

-- If count > 0, booking conflicts with existing appointment
```

---

## Prompt 3: REST API Endpoints Design

### Exact Prompt Used:

```
For the University Appointment Scheduler backend API, design 3 key REST endpoints that
would be most critical for the MVP. For each endpoint provide:
- HTTP method and path
- Request body/parameters
- Response format
- Status codes
- Authentication requirements
- Example request and response

Focus on the most important operations: authentication, viewing slots, and booking appointments.
```

### AI-Generated Output:

**API Endpoint Specifications:**

---

### Endpoint 1: POST /api/auth/login

**Purpose:** Authenticate user and receive JWT token

**Request:**

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePass123!"
}
```

**Response (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT"
    }
  }
}
```

**Response (Error - 401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

**Status Codes:**

- 200: Successful authentication
- 401: Invalid credentials
- 400: Validation error (missing fields)
- 429: Too many login attempts (rate limiting)

**Authentication:** None (this IS the auth endpoint)

**Security Notes:**

- Rate limit: 5 attempts per 15 minutes per IP
- Return generic error message (don't reveal if email exists)
- JWT expires in 15 minutes (use refresh token for longer sessions)

---

### Endpoint 2: GET /api/slots

**Purpose:** Retrieve available appointment slots (with filters)

**Request:**

```http
GET /api/slots?teacherId=550e8400-e29b-41d4-a716-446655440000&startDate=2025-11-25&endDate=2025-11-30&available=true HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**

- `teacherId` (optional): Filter by specific teacher
- `startDate` (optional): ISO date, default: today
- `endDate` (optional): ISO date, default: +7 days
- `available` (optional): boolean, filter only bookable slots

**Response (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "teacher": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "Dr. Jane",
          "lastName": "Smith"
        },
        "startTime": "2025-11-25T10:00:00Z",
        "endTime": "2025-11-25T11:00:00Z",
        "location": "Room 301, Engineering Building",
        "maxCapacity": 1,
        "availableSeats": 1,
        "isAvailable": true
      },
      {
        "id": "650e8400-e29b-41d4-a716-446655440002",
        "teacher": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "Dr. Jane",
          "lastName": "Smith"
        },
        "startTime": "2025-11-25T14:00:00Z",
        "endTime": "2025-11-25T15:00:00Z",
        "location": "Room 301, Engineering Building",
        "maxCapacity": 3,
        "availableSeats": 2,
        "isAvailable": true
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pageSize": 20
    }
  }
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized (invalid/missing token)
- 400: Invalid query parameters
- 500: Server error

**Authentication:** Required (JWT token in Authorization header)

**Authorization:** Students and Teachers can view slots

---

### Endpoint 3: POST /api/appointments

**Purpose:** Book an appointment slot

**Request:**

```http
POST /api/appointments HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "slotId": "650e8400-e29b-41d4-a716-446655440001",
  "notes": "I'd like to discuss my final project proposal"
}
```

**Response (Success - 201 Created):**

```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "750e8400-e29b-41d4-a716-446655440005",
      "slot": {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "startTime": "2025-11-25T10:00:00Z",
        "endTime": "2025-11-25T11:00:00Z",
        "location": "Room 301, Engineering Building"
      },
      "student": {
        "id": "850e8400-e29b-41d4-a716-446655440010",
        "firstName": "John",
        "lastName": "Doe"
      },
      "status": "BOOKED",
      "notes": "I'd like to discuss my final project proposal",
      "bookedAt": "2025-11-24T15:30:00Z"
    }
  },
  "message": "Appointment booked successfully. Confirmation email sent."
}
```

**Response (Error - 409 Conflict):**

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "This slot is no longer available or fully booked"
  }
}
```

**Response (Error - 422 Unprocessable Entity):**

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "You have an overlapping appointment at this time",
    "conflictingAppointment": {
      "id": "750e8400-e29b-41d4-a716-446655440003",
      "startTime": "2025-11-25T09:30:00Z",
      "endTime": "2025-11-25T10:30:00Z"
    }
  }
}
```

**Status Codes:**

- 201: Appointment created successfully
- 400: Invalid request body
- 401: Unauthorized (not logged in)
- 403: Forbidden (teachers can't book appointments)
- 409: Slot unavailable (race condition)
- 422: Business rule violation (overlap, too close to start time)
- 500: Server error

**Authentication:** Required (JWT token)

**Authorization:** Only STUDENT role can book appointments

**Business Rules Enforced:**

1. Check slot has available capacity
2. Prevent booking if slot starts in less than 1 hour
3. Prevent double-booking (student already has appointment in that time range)
4. Transaction: Decrement availableSeats atomically
5. Send confirmation email/notification (async job)

---

## How These AI Outputs Were Adapted for MVP

### Adaptation Strategy:

1. **Tech Stack (Adopted):**

   - ✅ React + TypeScript + Vite (as recommended)
   - ✅ Tailwind CSS (as recommended)
   - ❌ Backend/Database (replaced with localStorage mock)
   - ✅ TypeScript interfaces mirror the database schema

2. **Database Schema (Simulated):**

   - Tables converted to TypeScript interfaces in `src/types/index.ts`
   - localStorage keys: `uas_users`, `uas_slots`, `uas_appointments`
   - Business logic constraints implemented in `mockApi.ts`
   - UUIDs replaced with simple string IDs (`uid()` function)

3. **API Endpoints (Mocked):**

   - Created `mockApi.ts` with functions mirroring REST endpoints:
     - `mockApi.login(email)` → simulates POST /api/auth/login
     - `mockApi.getSlots(filters)` → simulates GET /api/slots
     - `mockApi.bookAppointment(slotId, studentId)` → simulates POST /api/appointments
   - Each function returns Promise with setTimeout (300-700ms delay)
   - Console logs simulate network traffic for demonstration
   - Response format matches AI-suggested structure

4. **Migration Path:**
   - All mock API functions have comments showing equivalent fetch() call
   - Example: `// In production: fetch('/api/slots', { method: 'GET', ... })`
   - Easy to swap mockApi with real API client when backend is ready

### Example Code Adaptation:

**From AI Database Schema → TypeScript Interface:**

```typescript
// docs/AI_PROMPTS.md database schema
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL,
  start_time TIMESTAMP NOT NULL,
  ...
);

// src/types/index.ts
export interface Slot {
  id: string;
  teacherId: string;
  startISO: string;
  endISO: string;
  location: string;
  maxSeats: number;
  availableSeats: number;
}
```

**From AI REST API → Mock Function:**

```typescript
// docs/AI_PROMPTS.md API specification
POST /api/appointments
Body: { slotId, notes }
Response: { success, data: { appointment } }

// src/lib/mockApi.ts
export async function bookAppointment(
  slotId: string,
  studentId: string,
  notes?: string
): Promise<Appointment> {
  console.log(`📡 POST /api/appointments - Booking slot ${slotId}`);
  await simulateNetworkDelay();

  // Business logic validation...
  const appointment = { id: uid(), slotId, studentId, status: 'BOOKED', ... };

  // Save to localStorage
  return appointment;
}
```

---

## Mapping to Task 3 Rubric

| Rubric Item                                   | Coverage in This Document                           |
| --------------------------------------------- | --------------------------------------------------- |
| **Exact AI Prompts**                          | ✅ Three prompts provided verbatim in code blocks   |
| **AI-Generated Tech Stack**                   | ✅ Complete stack recommendation with justification |
| **AI-Generated Database Schema (3-5 tables)** | ✅ Five tables with SQL, constraints, indexes       |
| **AI-Generated API Endpoints (≥3)**           | ✅ Three detailed endpoints with req/res examples   |
| **Explanation of Adaptation (3-5 sentences)** | ✅ Detailed adaptation strategy and code examples   |
| **Demonstrates AI Utilization**               | ✅ Clear workflow: prompt → output → adaptation     |

---

## Additional AI Interactions (Optional Context)

Throughout development, AI assistance was used for:

- **TypeScript type definitions:** Refining interface structures
- **React component patterns:** Best practices for hooks and state management
- **Tailwind CSS classes:** Generating responsive utility combinations
- **Business logic validation:** Edge case handling for booking rules
- **Documentation structure:** Organizing markdown files for clarity

This demonstrates responsible AI usage: using AI for accelerating development while maintaining understanding and control over the final implementation.
