import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../layouts/UserLayout";
import ArtisanLayout from "../../layouts/ArtisanLayout";
import AdminLayout from "../../layouts/AdminLayout";
import { PageIntro } from "../../components/SiteDesign";
import BookingRequest from "../../components/BookingRequest";
import BookingDetails from "../../components/BookingDetails";
import { listBookings, getBooking, bookingStatuses, bookingLabel, bookingDate, bookingMoney } from "../../services/bookingService";

export default function Bookings() {
  const { user } = useAuth();
  const role = user.role;
  const Layout = role === "artisan" ? ArtisanLayout : role === "admin" ? AdminLayout : UserLayout;
  const [params, setParams] = useSearchParams();
  const bookingId = params.get("booking");
  const artisanId = role === "user" ? params.get("artisan") : null;
  const [filter, setFilter] = useState(() => bookingStatuses.includes(params.get("status")) ? params.get("status") : "");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ bookings: [], total: 0, pages: 0 });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    if (artisanId) { setLoading(false); return; }
    let active = true;
    setLoading(true); setError("");
    const request = bookingId ? getBooking(bookingId) : listBookings({ status: filter || undefined, page });
    request.then(result => { if (active) { if (bookingId) setBooking(result.booking); else setData(result); } })
      .catch(err => { if (active) setError(err.response?.data?.message || "Unable to load bookings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookingId, artisanId, filter, page, revision]);
  return <Layout><PageIntro eyebrow={role === "admin" ? "SUPPORT EVERY CONNECTION" : "FROM FIRST IDEA TO FINISHED WORK"} title={role === "artisan" ? "Your next great job." : role === "admin" ? "Bookings & disputes." : "Your projects, in good hands."} description={role === "admin" ? "Review booking history and resolve reported issues with a recorded decision." : "Keep requests, agreed quotes, messages and project milestones in one place."}><CalendarDays size={52} strokeWidth={1.2} className="text-green-500"/></PageIntro>
    {error && <p role="alert" className="booking-error">{error} <button className="underline" onClick={refresh}>Try again</button></p>}
    {artisanId ? <BookingRequest artisanId={artisanId} onCreated={created => { setBooking(created); setParams({ booking: created._id }); }} onCancel={() => setParams({})}/> : bookingId ? <>{loading && !booking && <p role="status">Loading booking…</p>}{booking && booking._id === bookingId && <BookingDetails key={booking._id} booking={booking} onUpdated={setBooking} onBack={() => { setBooking(null); setParams({}); }} onRefresh={refresh} refreshing={loading}/>}</> : <>
      <div className="booking-section-heading"><label className="booking-filter">Filter by status<select className="input" value={filter} onChange={event => { setFilter(event.target.value); setPage(1); }}><option value="">All bookings</option>{bookingStatuses.map(status => <option key={status} value={status}>{bookingLabel(status)}</option>)}</select></label><div className="booking-actions">{role === "user" && <Link to="/user/home" className="btn-primary">Find an artisan <ArrowUpRight size={16}/></Link>}<button className="btn-outline" disabled={loading} onClick={refresh}>{loading ? "Loading…" : "Refresh"}</button></div></div>
      {loading ? <div className="card" role="status">Loading bookings…</div> : !error && data.bookings.length === 0 ? <section className="card booking-empty"><CalendarDays size={40}/><h2>{filter ? `No ${bookingLabel(filter)} bookings` : "Your next project starts here."}</h2><p className="booking-muted">{role === "user" ? "Visit an artisan's profile and choose Request a service to get started." : "Booking requests and their updates will appear here."}</p></section> : <div className="booking-list">{data.bookings.map(item => <button className="card booking-list-item" key={item._id} onClick={() => { setBooking(null); setParams({ booking: item._id }); }}><div><span className={`booking-status status-${item.status}`}>{bookingLabel(item.status)}</span><h2>{item.title}</h2><p>{role === "artisan" ? item.customerId?.fullName : item.artisanId?.name || "Artisan unavailable"}</p><span className="booking-muted">{bookingDate(item.quote?.scheduledAt || item.preferredAt)} WAT</span></div><div className="booking-list-side"><strong>{item.quote ? bookingMoney(item.quote.price) : "Awaiting quote"}</strong><span>View booking <ArrowUpRight size={16}/></span></div></button>)}</div>}
      {!loading && data.pages > 1 && <div className="booking-pagination"><button className="btn-outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {data.pages} · {data.total} bookings</span><button className="btn-outline" disabled={page >= data.pages} onClick={() => setPage(value => value + 1)}>Next</button></div>}
    </>}
  </Layout>;
}
