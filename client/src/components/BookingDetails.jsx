import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { bookingAction, sendBookingMessage, reviewBooking, bookingDate, bookingMoney, bookingLabel, bookingInputDate, bookingISO } from "../services/bookingService";

function BookingPhoto({ bookingId, name }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true, objectURL;
    api.get(`/bookings/${bookingId}/photos/${name}`, { responseType: "blob" }).then(({ data }) => {
      if (!active) return;
      objectURL = URL.createObjectURL(data); setUrl(objectURL);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (objectURL) URL.revokeObjectURL(objectURL); };
  }, [bookingId, name]);
  return url ? <a href={url} target="_blank" rel="noreferrer"><img className="booking-photo" src={url} alt="Booking attachment"/></a> : <span className="booking-muted">{failed ? "Photo unavailable" : "Loading photo…"}</span>;
}
const actionNames = { quote: "Send quote", confirm: "Accept quote & confirm", decline: "Decline", cancel: "Cancel booking", start: "Start work", finish: "Mark work finished", complete: "Confirm completion", dispute: "Report an issue", resolve: "Resolve dispute", propose_change: "Propose a change", accept_change: "Accept change", reject_change: "Reject change" };

export default function BookingDetails({ booking: b, onUpdated, onBack, onRefresh, refreshing }) {
  const { user } = useAuth();
  const role = user.role === "admin" ? "admin" : user.role === "artisan" ? "artisan" : "customer";
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const active = ["confirmed", "in_progress", "awaiting_confirmation"].includes(b.status);
  const availableActions = [];
  if (role === "artisan" && ["requested", "quoted"].includes(b.status)) availableActions.push("quote", "decline");
  if (role === "customer" && b.status === "quoted") availableActions.push("confirm", "decline");
  if (role !== "admin" && ["requested", "quoted", "confirmed"].includes(b.status)) availableActions.push("cancel");
  if (role === "artisan" && b.status === "confirmed" && !b.pendingChange) availableActions.push("start");
  if (role === "artisan" && b.status === "in_progress" && !b.pendingChange) availableActions.push("finish");
  if (role === "customer" && b.status === "awaiting_confirmation") availableActions.push("complete");
  if (role !== "admin" && active) availableActions.push("dispute");
  if (role !== "admin" && ["confirmed", "in_progress"].includes(b.status)) {
    if (!b.pendingChange) availableActions.push("propose_change");
    else if (String(b.pendingChange.proposedBy) !== String(user._id || user.id)) availableActions.push("accept_change", "reject_change");
  }
  if (role === "admin" && b.status === "disputed") availableActions.push("resolve");
  const termsAction = ["quote", "propose_change"].includes(action);
  const reasonRequired = ["cancel", "decline", "dispute", "finish", "resolve"].includes(action);

  async function submitAction(event) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    form.set("version", String(b.__v));
    if (termsAction) form.set("scheduledAt", bookingISO(form.get("scheduledAt")));
    const photos = form.getAll("photos").filter(file => file.size);
    if (photos.length > 4) return setError("Choose up to four completion photos.");
    form.delete("photos"); photos.forEach(file => form.append("photos", file));
    setBusy(true); setError("");
    try { const data = await bookingAction(b._id, action, form); setAction(""); onUpdated(data.booking); }
    catch (err) { setError(err.response?.data?.message || "Unable to update this booking."); }
    finally { setBusy(false); }
  }
  async function sendMessage(event) {
    event.preventDefault(); if (busy || !draft.trim()) return;
    setBusy(true); setError("");
    try { const data = await sendBookingMessage(b._id, draft); onUpdated(data.booking); setDraft(""); }
    catch (err) { setError(err.response?.data?.message || "Unable to send message."); }
    finally { setBusy(false); }
  }
  async function review(event) {
    event.preventDefault(); if (busy) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError("");
    try { const data = await reviewBooking(b._id, form); onUpdated(data.booking); }
    catch (err) { setError(err.response?.data?.message || "Unable to submit review."); }
    finally { setBusy(false); }
  }
  return <div className="booking-detail">
    <div className="booking-section-heading"><button className="btn-outline" onClick={onBack}>← All bookings</button><button className="btn-ghost" disabled={refreshing || busy} onClick={onRefresh}>{refreshing ? "Refreshing…" : "Refresh booking"}</button></div>
    {error && <p className="booking-error" role="alert">{error} <button onClick={onRefresh} className="underline">Refresh</button></p>}
    <section className="card"><div className="booking-section-heading"><div><span className="site-eyebrow">BOOKING #{b._id.slice(-8).toUpperCase()}</span><h2>{b.title}</h2></div><span className={`booking-status status-${b.status}`}>{bookingLabel(b.status)}</span></div>
      <div className="booking-facts"><div><span>Customer</span><strong>{b.customerId?.fullName || "Customer unavailable"}</strong></div><div><span>Artisan</span><strong>{b.artisanId?.name || b.artisanOwnerId?.fullName || "Artisan unavailable"}</strong></div><div><span>Preferred appointment (WAT)</span><strong>{bookingDate(b.preferredAt)}</strong></div><div><span>Customer's budget</span><strong>{bookingMoney(b.budget)}</strong></div></div>
      <p className="booking-prose">{b.description}</p><p className="booking-muted mt-3">Service address: {b.location}</p>
      {b.photos?.length > 0 && <div className="booking-photos">{b.photos.map(name => <BookingPhoto key={name} bookingId={b._id} name={name}/>)}</div>}
      {b.quote && <div className="booking-terms"><span className="site-eyebrow">{b.status === "quoted" ? "PROPOSED QUOTE" : "BOOKING TERMS"}</span><div className="booking-section-heading"><strong>{bookingMoney(b.quote.price)}</strong><span>{bookingDate(b.quote.scheduledAt)} WAT</span></div><p className="booking-prose">{b.quote.scope}</p></div>}
      {b.pendingChange && <div className="booking-terms"><span className="site-eyebrow">CHANGE AWAITING THE OTHER PARTY'S ACCEPTANCE</span><strong>{bookingMoney(b.pendingChange.price)} · {bookingDate(b.pendingChange.scheduledAt)} WAT</strong><p className="booking-prose mt-2">{b.pendingChange.scope}</p><p className="booking-muted mt-2">Your existing agreement stays in place until this change is accepted.</p></div>}
      {["requested", "quoted"].includes(b.status) && <p className="booking-muted mt-4">This {b.status === "quoted" ? "quote" : "request"} expires {bookingDate(b.expiresAt)} WAT.</p>}
      <p className="booking-muted mt-4">Payment is arranged directly between customer and artisan. Completion does not confirm payment.</p>
      {b.completionNotes && <div className="booking-terms"><h3>Completion notes</h3><p className="booking-prose mt-2">{b.completionNotes}</p><div className="booking-photos">{b.completionPhotos?.map(name => <BookingPhoto key={name} bookingId={b._id} name={name}/>)}</div></div>}
      {availableActions.length > 0 && <div className="booking-actions">{availableActions.map(item => <button type="button" key={item} disabled={busy} className={item === "quote" || item === "confirm" || item === "complete" ? "btn-primary" : "btn-outline"} onClick={() => { setAction(item); setError(""); }}>{actionNames[item]}</button>)}</div>}
      {action && <form key={`${b._id}-${action}`} onSubmit={submitAction} className="booking-form booking-action-form"><h3>{actionNames[action]}</h3>
        {termsAction && <><label>Total price (NGN)<input className="input" name="price" type="number" min="0" max="100000000" step="0.01" required defaultValue={b.quote?.price ?? ""}/></label><label>Scope of work<textarea name="scope" className="input" rows={3} minLength={10} maxLength={4000} required defaultValue={b.quote?.scope || b.description}/></label><label>Appointment date and time (WAT)<input className="input" name="scheduledAt" type="datetime-local" min={bookingInputDate(Date.now() + 60000)} required defaultValue={bookingInputDate(b.quote?.scheduledAt || b.preferredAt)}/></label></>}
        {action === "resolve" && <label>Resolution<select className="input" name="outcome" required><option value="">Choose an outcome</option><option value="completed">Mark completed</option><option value="cancelled">Cancel booking</option></select></label>}
        {reasonRequired && <label>{action === "finish" ? "Completion notes" : "Reason / details"}<textarea className="input" name="note" required minLength={5} maxLength={4000} rows={3}/></label>}
        {action === "finish" && <label>Completion photos (optional, up to 4)<input className="input" type="file" name="photos" multiple accept="image/png,image/jpeg,image/webp"/><span className="booking-muted">Maximum 5 MB per photo.</span></label>}
        {!termsAction && !reasonRequired && <p className="booking-muted">{action === "confirm" ? "Accept the price, scope and appointment shown above to confirm your booking." : action === "complete" ? "Confirm that the agreed work is complete. You can then leave a verified review." : `Confirm: ${actionNames[action].toLowerCase()}?`}</p>}
        <div className="booking-actions"><button disabled={busy} className="btn-primary">{busy ? "Saving…" : actionNames[action]}</button><button type="button" disabled={busy} className="btn-outline" onClick={() => setAction("")}>Back</button></div>
      </form>}
    </section>
    {(b.review || (role === "customer" && b.status === "completed")) && <section className="card"><h3>Verified booking review</h3>{b.review ? <><p className="mt-3">{"★".repeat(b.review.rating)} · {b.review.rating}/5</p><p className="booking-prose mt-2">{b.review.comment}</p></> : <form className="booking-form mt-4" onSubmit={review}><label>Rating<select className="input" name="rating" required><option value="">Choose a rating</option>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}</select></label><label>Your review (optional)<textarea className="input" name="comment" rows={3} maxLength={2000}/></label><button className="btn-primary" disabled={busy}>Submit review</button><p className="booking-muted">One review per completed booking. Reviews cannot be edited after submission.</p></form>}</section>}
    <div className="booking-detail-columns"><section className="card"><h3>Booking conversation</h3><p className="booking-muted mt-2">Keep project discussions and inspection arrangements with this booking.</p><div className="booking-message-list">{b.messages?.length ? b.messages.map(message => <article key={message._id} className="booking-message"><strong>{message.senderName}</strong><time>{bookingDate(message.at)} WAT</time><p className="booking-prose">{message.body}</p></article>) : <p className="booking-muted">No messages yet.</p>}</div>{role !== "admin" && <form className="booking-form" onSubmit={sendMessage}><label>Your message<textarea className="input" value={draft} onChange={event => setDraft(event.target.value)} rows={3} maxLength={2000} required/></label><button className="btn-primary" disabled={busy || !draft.trim()}>Send message</button></form>}</section>
    <section className="card"><h3>Booking history</h3><ol className="booking-history">{[...(b.history || [])].reverse().map(entry => <li key={entry._id}><strong>{bookingLabel(entry.action)}</strong><time>{bookingDate(entry.at)} WAT</time><span className="booking-muted">{entry.actorId ? String(entry.actorId) === String(b.customerId?._id) ? "Customer" : String(entry.actorId) === String(b.artisanOwnerId?._id) ? "Artisan" : "Administrator" : "System"} · {bookingLabel(entry.status)}</span>{entry.note && <p className="booking-prose">{entry.note}</p>}{entry.terms && <p className="booking-muted">{bookingMoney(entry.terms.price)} · {bookingDate(entry.terms.scheduledAt)} WAT<br/>{entry.terms.scope}</p>}</li>)}</ol></section></div>
  </div>;
}
