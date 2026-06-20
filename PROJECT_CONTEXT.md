You are working on the backend of a real-world project called **Artisyn**.

Artisyn is a Artisan listing platform with a monorepo structure:

/Artisyn
  /server   → Node.js + Express backend
  /client   → React frontend (not started yet)

The backend is already implemented and MUST NOT be redesigned or simplified.
You must extend it following the existing architecture and conventions.

========================
TECH STACK
========================
- Node.js (ES Modules)
- Express.js
- MongoDB Atlas
- Mongoose
- JWT authentication
- Role-based access control
- Resend (email service)
- No GraphQL
- No SQL
- No Redux
- REST API only

========================
ROLES
========================
1. USER
   - Browse approved Artisan
   - View Artisan details
   - Save / unsave Artisan (bookmarks)

2. Artisan
   - Signs up with Artisan details
   - Gets a Artisan listing created automatically
   - Artisan listing starts as `pending`
   - Can view & update own Artisan listing
   - Can be approved, rejected, or suspended by admin
   - Can submit an appeal if rejected or suspended

3. ADMIN
   - Approves Artisan
   - Rejects Artisan (with reason)
   - Suspends Artisan (with reason)
   - Unsuspends Artisan
   - Views all Artisan (any status)
   - Reviews Artisan appeals
   - Resolves appeals (accept → auto unsuspend, reject → remain suspended)

========================
AUTH FEATURES (COMPLETED)
========================
- Register (user/Artisan)
- Login
- JWT-based auth
- Role middleware (user/Artisan/admin)
- Secure forgot-password system:
  - 6-digit reset code
  - Reset code is HASHED (never stored raw)
  - Code expires in 10 minutes
  - Cooldown: 60 seconds between requests
  - Max 5 reset attempts
  - Anti-email-enumeration responses
  - Reset code sent via Resend email (HTML + text)
  - Password reset clears reset state after success

========================
EMAIL SYSTEM
========================
- Resend is used for emails
- API key stored in `server/.env`
- `sendEmail()` helper exists
- Email templates are separated (HTML + text)
- Password reset email is branded and user-friendly

========================
Artisan SYSTEM
========================
Artisan model includes:
- name
- category
- phone
- address
- rating
- ownerId
- status: pending | approved | rejected | suspended
- moderationReason

Rules:
- Only approved Artisan appear publicly
- Suspended Artisan are hidden from public
- Artisan can still access their dashboard when suspended
- Artisan can submit an appeal

========================
APPEALS SYSTEM
========================
- Artisan can submit an appeal when rejected/suspended
- Only ONE pending appeal allowed per Artisan
- Admin can:
  - list appeals
  - accept appeal → Artisan becomes approved
  - reject appeal → Artisan remains suspended
- Appeals track:
  - message
  - status
  - admin note
  - timestamps

========================
SAVED Artisan (BOOKMARKS)
========================
- Saved Artisan stored in User document
- Endpoints:
  - GET /api/me/saved
  - POST /api/me/saved/:ArtisanId
  - DELETE /api/me/saved/:ArtisanId
- Only approved Artisan can be saved
- No duplicates allowed

========================
ADMIN ENDPOINTS
========================
- Approve Artisan
- Reject Artisan (with reason)
- Suspend Artisan (with reason)
- Unsuspend Artisan
- View all Artisan (filter, search, pagination)
- Review appeals

========================
PUBLIC ENDPOINTS
========================
- List approved Artisan
- Filter by category
- Search by name
- Pagination & sorting

========================
SECURITY & QUALITY
========================
- Global JSON error handler
- No HTML error pages
- Async error handling
- Environment variables protected
- `.env.example` exists
- MongoDB Atlas used
- Seeding script exists for fake Artisan

========================
IMPORTANT RULES FOR AI
========================
- DO NOT redesign the backend
- DO NOT remove existing features
- DO NOT introduce Redux, SQL, or GraphQL
- Follow existing file structure and patterns
- Extend incrementally and professionally
- Treat this as a production-ready backend

========================
NEXT PHASE
========================
Frontend development using:
- React
- Tailwind CSS
- Dashboard layout (sidebar-based)
- Connect to this backend API
