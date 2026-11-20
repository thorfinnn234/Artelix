import { useEffect, useState } from "react";
import { getArtisanById } from "../services/artisanService";
import { createBooking, bookingISO, bookingInputDate } from "../services/bookingService";

export default function BookingRequest({ artisanId, onCreated, onCancel }) {
  const [artisan, setArtisan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setArtisan(null);
    getArtisanById(artisanId).then(data => { if (active) setArtisan(data.artisan || data.Artisan || data); })
      .catch(err => { if (active) setError(err.response?.data?.message || "Unable to load this artisan."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [artisanId]);
  async function submit(event) {
    event.preventDefault(); if (saving) return;
    const form = new FormData(event.currentTarget);
    if (form.getAll("photos").filter(file => file.size).length > 4) return setError("Choose up to four photos.");
    form.set("artisanId", artisanId);
    form.set("preferredAt", bookingISO(form.get("preferredAt")));
    // Empty file inputs are omitted so multipart parsers see only real attachments.
    const photos = form.getAll("photos").filter(file => file.size);
    form.delete("photos"); photos.forEach(file => form.append("photos", file));
    setSaving(true); setError("");
    try { const data = await createBooking(form); onCreated(data.booking); }
    catch (err) { setError(err.response?.data?.message || "Unable to send your request."); }
    finally { setSaving(false); }
  }
  return <section className="card booking-request"><div className="booking-section-heading"><div><span className="site-eyebrow">LET'S MAKE IT HAPPEN</span><h2>Request a service{artisan ? ` from ${artisan.name}` : ""}</h2></div><button type="button" className="btn-outline" onClick={onCancel}>Back to bookings</button></div>
    {error && <p role="alert" className="booking-error">{error}</p>}
    {loading ? <p role="status">Loading artisan…</p> : artisan?.status !== "approved" ? <p>This artisan is currently unavailable for bookings.</p> : <form onSubmit={submit} className="booking-form">
      <label>What do you need?<input className="input" name="title" required minLength={3} maxLength={120} placeholder="e.g. Repair a leaking kitchen pipe"/></label>
      <label>Project details<textarea className="input" name="description" rows={4} required minLength={10} maxLength={4000} placeholder="Tell the artisan what needs doing, including any access or inspection details."/></label>
      <label>Service address<input className="input" name="location" required minLength={5} maxLength={500} placeholder="Street, area, city and state"/></label>
      <div className="booking-form-row"><label>Preferred date and time (WAT)<input className="input" name="preferredAt" type="datetime-local" min={bookingInputDate(Date.now() + 60000)} required/></label><label>Budget in NGN (optional)<input className="input" name="budget" type="number" min="0" max="100000000" step="0.01" placeholder="Your estimated budget"/></label></div>
      <label>Project photos (optional, up to 4)<input className="input" name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple/><span className="booking-muted">PNG, JPEG or WebP. Maximum 5 MB per photo. Only booking participants and administrators can view them.</span></label>
      <p className="booking-muted">This sends a request. Your booking is confirmed after you accept the artisan's quote and schedule. Payment is arranged directly with the artisan; Artelix does not collect payment.</p>
      <button disabled={saving} className="btn-primary">{saving ? "Sending request…" : "Send service request"}</button>
    </form>}
  </section>;
}
