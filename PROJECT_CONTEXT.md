You are working on the backend of a real-world project called **Vendorly**.

Vendorly is a vendor listing platform with a monorepo structure:

/Vendorly
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
   - Browse approved vendors
   - View vendor details
   - Save / unsave vendors (bookmarks)

2. VENDOR
   - Signs up with vendor details
   - Gets a vendor listing created automatically
   - Vendor listing starts as `pending`
   - Can view & update own vendor listing
   - Can be approved, rejected, or suspended by admin
   - Can submit an appeal if rejected or suspended

3. ADMIN
   - Approves vendors
   - Rejects vendors (with reason)
   - Suspends vendors (with reason)
   - Unsuspends vendors
   - Views all vendors (any status)
   - Reviews vendor appeals
   - Resolves appeals (accept → auto unsuspend, reject → remain suspended)

========================
AUTH FEATURES (COMPLETED)
========================
- Register (user/vendor)
- Login
- JWT-based auth
- Role middleware (user/vendor/admin)
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
VENDOR SYSTEM
========================
Vendor model includes:
- name
- category
- phone
- address
- rating
- ownerId
- status: pending | approved | rejected | suspended
- moderationReason

Rules:
- Only approved vendors appear publicly
- Suspended vendors are hidden from public
- Vendors can still access their dashboard when suspended
- Vendor can submit an appeal

========================
APPEALS SYSTEM
========================
- Vendors can submit an appeal when rejected/suspended
- Only ONE pending appeal allowed per vendor
- Admin can:
  - list appeals
  - accept appeal → vendor becomes approved
  - reject appeal → vendor remains suspended
- Appeals track:
  - message
  - status
  - admin note
  - timestamps

========================
SAVED VENDORS (BOOKMARKS)
========================
- Saved vendors stored in User document
- Endpoints:
  - GET /api/me/saved
  - POST /api/me/saved/:vendorId
  - DELETE /api/me/saved/:vendorId
- Only approved vendors can be saved
- No duplicates allowed

========================
ADMIN ENDPOINTS
========================
- Approve vendor
- Reject vendor (with reason)
- Suspend vendor (with reason)
- Unsuspend vendor
- View all vendors (filter, search, pagination)
- Review appeals

========================
PUBLIC ENDPOINTS
========================
- List approved vendors
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
- Seeding script exists for fake vendors

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
