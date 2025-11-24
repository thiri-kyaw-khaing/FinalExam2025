# Security & PDPA Analysis

## OWASP Top 10 Relevant Threats

### 1. A01:2021 – Broken Access Control

**Relevance to University Appointment Scheduler:**

In our appointment scheduling system, broken access control could allow:

- Students accessing and modifying teacher-only features (creating/deleting slots)
- Users viewing or canceling other users' appointments
- Unauthorized changes to appointment statuses
- Bypassing business rules (e.g., cancellation policies, booking restrictions)

**Why This Matters:**
Without proper access control, students could manipulate teacher schedules, cancel other students' appointments, or create fake slots. Teachers could access student personal information beyond what's necessary. This undermines the entire system's integrity and trust.

**Mitigation Strategies in MVP:**

1. **Role-Based UI Rendering:** Check `currentUser.role` before displaying components
   ```typescript
   if (currentUser.role === "TEACHER") {
     // Show teacher schedule management
   } else {
     // Show student booking dashboard
   }
   ```
2. **Mock API Validation:** Every mock API function validates the requesting user's role and ownership
3. **Operation Authorization:** Bookings can only be created by students for themselves, cancelled by the owner within policy
4. **Server-Side Validation (Future):** When migrating to real backend, implement middleware to verify JWT tokens and enforce role permissions on every endpoint

**Production Implementation Requirements:**

- JWT-based authentication with role claims
- Server-side authorization checks on all API endpoints
- Principle of least privilege for database access
- Audit logging of all access control decisions

---

### 2. A03:2021 – Injection

**Relevance to University Appointment Scheduler:**

Injection vulnerabilities occur when untrusted data is sent to interpreters as part of commands or queries. For our system:

- **SQL Injection (Future Backend):** Malicious input in slot search filters, user login forms
- **Cross-Site Scripting (XSS):** User-provided data (names, location descriptions) rendered without sanitization
- **localStorage Injection:** Manipulated data structure could break application logic

**Why This Matters:**
An attacker could inject malicious code through input fields (e.g., teacher name field, location description) that gets executed when rendered. In a real database scenario, SQL injection could expose all user data or allow unauthorized data modification.

**Mitigation Strategies in MVP:**

1. **React's Built-in XSS Protection:** React escapes content by default when using `{variable}` syntax
2. **Input Validation:** Validate all user inputs with TypeScript types and runtime checks
   ```typescript
   // Example in mockApi.ts
   if (!slotData.teacherId || typeof slotData.teacherId !== "string") {
     throw new Error("Invalid teacher ID");
   }
   ```
3. **Data Sanitization:** Strip HTML tags and scripts from user-provided text fields
4. **Controlled Component Rendering:** Never use `dangerouslySetInnerHTML` unless absolutely necessary with sanitized content

**Production Implementation Requirements:**

- Parameterized queries (prepared statements) for all database operations
- Input validation library (e.g., Joi, Yup) on both client and server
- Content Security Policy (CSP) headers to prevent inline script execution
- Output encoding based on context (HTML, JavaScript, URL)
- ORM/query builder to abstract SQL construction (e.g., Prisma, TypeORM)

---

### 3. A07:2021 – Identification and Authentication Failures

**Relevance to University Appointment Scheduler:**

Authentication failures could allow:

- Unauthorized access to the system
- Account takeover through weak passwords or session hijacking
- Impersonation of other users (students booking as others, teachers accessing student accounts)
- Session fixation attacks

**Why This Matters:**
Our MVP uses a mock authentication system (role selection) which is inherently insecure. In production, weak authentication would allow attackers to access sensitive appointment data, personal information, and manipulate schedules on behalf of legitimate users.

**Mitigation Strategies in MVP:**

1. **Mock Authentication Layer:** Simulates authentication flow to demonstrate where real auth would integrate
   ```typescript
   // LoginSim.tsx - Clear documentation this is NOT secure
   const handleRoleSelect = (user: User) => {
     localStorage.setItem("uas_currentUser", JSON.stringify(user));
     // In production: Exchange credentials for JWT token
   };
   ```
2. **Session Simulation:** Store "current user" in localStorage to maintain session across page reloads
3. **Clear Warnings:** Documentation explicitly states this is NOT production-ready authentication
4. **Logout Functionality:** Implement logout to clear session data

**Production Implementation Requirements:**

- **Multi-Factor Authentication (MFA):** Especially for teacher accounts
- **Password Requirements:** Minimum length, complexity, no common passwords
- **Secure Password Storage:** bcrypt/Argon2 hashing with unique salts (never plain text)
- **JWT Tokens with Short Expiry:** Access tokens (15 min), refresh tokens (7 days)
- **HTTP-Only Secure Cookies:** Prevent XSS-based token theft
- **Account Lockout:** After 5 failed login attempts, lock for 15 minutes
- **Session Management:** Secure session creation, validation, and termination
- **OAuth 2.0 / SAML Integration:** Leverage university's existing identity provider
- **Audit Logging:** Log all authentication attempts (success and failure)

**Example Production Authentication Flow:**

```
1. User submits credentials → Server validates → Generate JWT
2. JWT stored in httpOnly cookie (not accessible to JavaScript)
3. Every API request includes JWT in Authorization header
4. Server middleware validates JWT signature and expiry
5. Extract user ID and role from JWT claims
6. Proceed with authorized operation
```

---

## PDPA (Personal Data Protection Act) Data Flow

### Data Collection

**What Personal Data is Collected:**

- **User Information:**
  - Student ID / Staff ID (identifier)
  - Full Name
  - Email Address
  - Phone Number (optional)
  - Role (Student / Teacher)
- **Appointment Data:**
  - Appointment date and time
  - Student-Teacher pairings
  - Location of meetings
  - Appointment status and history
- **System Metadata:**
  - Account creation timestamp
  - Last login time (if implemented)
  - Booking/cancellation timestamps

**Purpose of Collection:**

- Enable appointment scheduling functionality
- Facilitate communication between students and teachers
- Maintain appointment records for both parties
- Enforce business rules (cancellation policies, conflict prevention)

**Legal Basis (for production system):**

- Legitimate interest: University's educational operations
- User consent: Explicit opt-in during account creation

---

### Data Processing

**How Data is Processed:**

1. **Slot Creation:** Teacher provides time slots → Stored with teacher ID reference
2. **Booking:** Student selects slot → Creates appointment record linking student + slot
3. **Validation:** System checks for conflicts, capacity, policy compliance
4. **Display:** Filtered views based on user role (students see their appointments, teachers see their slots)
5. **Modification:** Status updates (booked → attended, booked → cancelled)
6. **Archival:** Historical data maintained for reference

**Data Retention:**

- **Active Appointments:** Retained until 30 days after appointment date
- **Historical Records:** Retain for 1 academic year for reference
- **Cancelled Appointments:** Retain for audit purposes (90 days)

**Automated Processing:**

- Conflict detection algorithms
- Availability calculations
- Notification triggers (future feature)

---

### Data Storage

**MVP Storage (localStorage):**

- **Location:** Browser's localStorage (client-side only)
- **Encryption:** None (plain JSON) - acceptable for MVP/demo only
- **Access Control:** Anyone with browser access can view localStorage
- **Backup:** None - user responsible for browser data

**Production Storage Requirements:**

- **Database:** Encrypted PostgreSQL/MySQL with TLS connections
- **Encryption at Rest:** AES-256 encryption for sensitive fields
- **Encryption in Transit:** HTTPS/TLS 1.3 for all communications
- **Access Control:** Database credentials limited to application server only
- **Backup:** Daily encrypted backups stored securely for 30 days
- **Geographic Location:** Servers located in same jurisdiction as university (compliance with data residency laws)

**Security Measures:**

- Least privilege database access
- Regular security patches and updates
- Intrusion detection systems
- Database activity monitoring

---

### Data Sharing

**MVP (No Sharing):**

- Data remains in user's browser only
- No external services or third parties involved

**Production Sharing Scenarios:**
| Recipient | Data Shared | Purpose | Legal Basis | Safeguards |
|-----------|-------------|---------|-------------|------------|
| **Email Service (SendGrid/AWS SES)** | Email address, appointment details | Send confirmation and reminder emails | User consent + legitimate interest | Data Processing Agreement (DPA), encryption in transit |
| **Calendar Service (Google/Outlook)** | Appointment time, location, participants | Calendar integration (optional) | User consent | OAuth scopes limited to calendar write, revocable access |
| **University Admin** | Aggregated statistics (no PII) | Usage analytics, resource planning | Legitimate interest | Anonymization, aggregation |
| **Compliance/Audit** | Appointment records if required | Legal obligations | Legal requirement | Access limited to authorized auditors only |

**No Sharing With:**

- Third-party advertisers
- Data brokers
- External marketing companies

**User Rights:**

- Right to access their data (data export feature)
- Right to rectification (edit profile)
- Right to erasure (delete account and all appointments)
- Right to data portability (export to standard format)
- Right to withdraw consent (opt-out of emails, delete account)

---

## Security Checklist

### ✅ Checklist Item 1: Input Validation and Sanitization

**Description:** All user inputs must be validated for type, length, and format before processing or storage.

**Implementation:**

- [x] TypeScript interfaces enforce type safety at compile time
- [x] Runtime validation in mockApi.ts for all data modifications
- [x] React controlled components prevent unexpected input
- [ ] Production: Server-side validation with schema validators (Joi/Yup)
- [ ] Production: Whitelist allowed characters for text fields
- [ ] Production: Validate file uploads (if added) for type and size

**Testing:**

- Try entering extremely long strings (>1000 chars) in name fields
- Submit forms with missing required fields
- Attempt to inject HTML/JavaScript in location descriptions

---

### ✅ Checklist Item 2: Authentication and Authorization

**Description:** Verify user identity and ensure users can only access resources they're authorized for.

**Implementation:**

- [x] Mock role-based access control (RBAC) in UI components
- [x] Role verification before rendering sensitive features
- [x] Ownership checks in mock API (users can only cancel their own bookings)
- [ ] Production: JWT-based authentication with refresh tokens
- [ ] Production: Server-side authorization middleware on all API endpoints
- [ ] Production: Session timeout after 30 minutes of inactivity

**Testing:**

- Attempt to access teacher features as a student
- Try to cancel another user's appointment
- Verify logout clears session completely

---

### ✅ Checklist Item 3: Data Encryption

**Description:** Protect sensitive data both in transit and at rest using encryption.

**Implementation:**

- [x] MVP: Data in localStorage (unencrypted - acceptable for demo)
- [ ] Production: HTTPS/TLS 1.3 for all communications (no HTTP)
- [ ] Production: Database field-level encryption for PII (email, phone)
- [ ] Production: Secure password hashing with bcrypt (cost factor ≥12)
- [ ] Production: Encrypted database backups

**Testing:**

- Verify production site uses HTTPS with valid certificate
- Check that no sensitive data appears in URL query parameters
- Confirm database backup files are encrypted

---

### ✅ Checklist Item 4: Logging and Monitoring

**Description:** Track security-relevant events for audit trails and incident response.

**Implementation:**

- [x] Console logging in mockApi.ts for development visibility
- [x] Timestamp all appointments and modifications
- [ ] Production: Centralized logging service (e.g., ELK stack, Splunk)
- [ ] Production: Log authentication events (login, logout, failures)
- [ ] Production: Log authorization failures (attempted unauthorized access)
- [ ] Production: Log data modifications (create, update, delete appointments)
- [ ] Production: Real-time alerting for suspicious patterns

**What to Log:**

- User ID, action performed, timestamp, IP address, result (success/failure)

**What NOT to Log:**

- Passwords (even hashed)
- Full credit card numbers
- Session tokens

**Testing:**

- Review logs after test operations
- Verify PII is not exposed in logs
- Ensure log retention policy is enforced

---

### ✅ Checklist Item 5: Dependency and Update Management

**Description:** Keep all dependencies up-to-date to patch known vulnerabilities.

**Implementation:**

- [x] package.json specifies dependency versions
- [x] Use npm audit to check for vulnerabilities
- [ ] Production: Automated dependency scanning (Dependabot, Snyk)
- [ ] Production: Regular update schedule (monthly for minor, immediate for security patches)
- [ ] Production: Staging environment for testing updates before production

**Commands:**

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

**Testing:**

- Run `npm audit` before deployment
- Review release notes for breaking changes
- Test application after updates in staging environment

---

## Mapping to Task 2 Rubric

| Rubric Item                      | Coverage in This Document                                                 |
| -------------------------------- | ------------------------------------------------------------------------- |
| **OWASP Top 10 Items (≥3)**      | ✅ Three items: Broken Access Control, Injection, Authentication Failures |
| **Why Each Matters**             | ✅ Detailed explanation for each OWASP item                               |
| **Mitigation Strategies**        | ✅ MVP and production mitigation for each threat                          |
| **PDPA Data Flow**               | ✅ Complete coverage: Collection, Processing, Storage, Sharing            |
| **Security Checklist (5 items)** | ✅ Five items with implementation details and testing guidance            |
| **Compliance Consideration**     | ✅ PDPA user rights, legal basis for data processing                      |

---

## Incident Response Plan (Production)

**In Case of Security Breach:**

1. **Detect:** Monitoring systems alert on suspicious activity
2. **Contain:** Immediately disable affected accounts/services
3. **Investigate:** Review logs to determine scope and cause
4. **Remediate:** Patch vulnerability, rotate credentials
5. **Notify:** Inform affected users within 72 hours (PDPA requirement)
6. **Document:** Create incident report with lessons learned
7. **Improve:** Update security measures to prevent recurrence

---

## Disclaimer

⚠️ **This MVP uses mock authentication and localStorage for demonstration purposes only. DO NOT deploy to production without implementing proper security measures outlined in this document.**
