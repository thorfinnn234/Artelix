# Artelix bookings

## Entry points

- Customers: **My bookings** (`/user/bookings`). Start from **Request a service** on an approved artisan's profile.
- Artisans: **Bookings & requests** (`/artisan/jobs`). The dashboard now shows real recent bookings.
- Administrators: **Bookings & disputes** (`/admin/bookings`). Open a disputed booking, inspect its discussion/history and resolve it as completed or cancelled, with a reason.

## Workflow

Requested → quoted → confirmed → in progress → awaiting customer confirmation → completed.

- Artisans propose a price in NGN, scope and appointment. Customers explicitly accept the quote.
- After confirmation, either participant can propose different terms. The original agreement remains until the other participant accepts. Pending changes must be accepted or rejected before work starts or finishes.
- Either participant can cancel before work starts, with a reason. Once work starts, use a dispute for an unresolved problem.
- Completion notes are required. Customers confirm completion or report an issue.
- Requests and unaccepted quotes expire seven days after creation/the latest quote. Expiry is evaluated when booking APIs are read or acted upon; no background scheduler is required.
- Each completed booking accepts one immutable customer review. The existing profile/search rating summary remains compatible and represents the customer's latest rating of that artisan; each booking retains its individual review. The legacy direct-rating endpoint directs clients to review a completed booking instead.
- Work completion and payment are separate. Payment is arranged directly; there is no payment gateway, escrow or payment-verification claim.
- Appointment inputs and displays use Africa/Lagos (WAT, UTC+1); the API stores dates in UTC.

## API

All routes require the existing Bearer token. Controllers reload the account so new suspension decisions do not depend on the authentication middleware's user cache.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/bookings?status=&page=` | Participant-scoped list; administrators can see all. Twenty records per page. |
| POST | `/api/bookings` | Customer request: artisanId, title, description, location, preferredAt, optional budget and photos. |
| GET | `/api/bookings/:id` | Full authorized booking, discussion and history. |
| POST | `/api/bookings/:id/actions/:action` | Quote, confirm, decline, cancel, start, finish, complete, dispute, resolve, propose_change, accept_change or reject_change. |
| POST | `/api/bookings/:id/messages` | Participant message with `body`. |
| POST | `/api/bookings/:id/review` | Completed-booking customer review with rating (1–5) and optional comment. |
| GET | `/api/bookings/:id/photos/:name` | Authorized photo response; never served by the public uploads directory. |

State-changing actions require the current `version` (the booking's `__v`). Stale changes return 409. Quote/change actions also require price, scope and scheduledAt. Decline/cancel/dispute/finish/resolve require a note. Resolve also requires outcome (`completed` or `cancelled`). Multipart forms support up to four PNG/JPEG/WebP attachments of up to 5 MB each for requests and work completion.

Booking history records actor, time, action, status, notes and proposed/accepted terms. Booking actions/messages create in-app notifications for the other participant; admin resolutions notify both. Notification delivery failure is logged without undoing an already saved booking.

Suspended accounts cannot create requests or take new work. A listing and its owner must be active for quoting, confirming, starting, finishing or agreeing to changes. Participants can still resolve existing obligations through cancellation, disputes and customer completion confirmation.

## Deployment and verification

- Uses the existing Express/Mongoose/MongoDB architecture. Mongoose creates the Booking collection and indexes; no dependency installation or destructive migration is required.
- Review submission and rating-summary updates use a MongoDB transaction. Use MongoDB Atlas or another replica-set deployment (standalone MongoDB does not support transactions).
- Private attachments are stored at `server/storage/booking-photos/`, independent of the working directory. Persist and back up that directory alongside the database; multi-instance deployments need shared durable storage.
- Run `npm run test:bookings --prefix server` and `npm run build --prefix client`.
- Automated tests exercise the actual Express router, JWT middleware, multipart processing, private photo responses, controller logic, workflow, ownership checks, notifications, review rules, disputes and stale writes with isolated in-memory database adapters. They do not verify a live MongoDB deployment or transaction behavior on that deployment.
- Before release, smoke-test the flow using customer, artisan and admin accounts against the deployment database and visually check both themes on desktop/mobile.
