import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyArtisan } from "../services/artisanService";
import api from "../services/api";

export default function ArtisanSuspensionAlert() {
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [accountSuspended, setAccountSuspended] = useState(Boolean(user?.isSuspended));

  useEffect(() => {
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (refreshing || document.visibilityState === "hidden") return;
      refreshing = true;
      const [listingResult, accountResult] = await Promise.allSettled([
        getMyArtisan(),
        api.get("/me"),
      ]);
      refreshing = false;
      if (!active) return;
      if (listingResult.status === "fulfilled") {
        const data = listingResult.value;
        setListing(data.artisan || data.Artisan || data);
      } else if (listingResult.reason?.response?.status === 404) {
        setListing(null);
      }
      if (accountResult.status === "fulfilled") {
        setAccountSuspended(Boolean(accountResult.value.data.user?.isSuspended));
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user?._id, user?.isSuspended]);

  if (!accountSuspended && listing?.status !== "suspended") return null;

  return (
    <section role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
      <AlertTriangle size={22} className="mt-0.5 shrink-0" aria-hidden="true"/>
      <div className="min-w-0">
        <h2 className="text-sm font-bold">{accountSuspended ? "Your account has been suspended." : "Your artisan listing has been suspended."}</h2>
        <p className="mt-1 text-sm leading-relaxed">{accountSuspended ? "Please contact the Artelix support team for help with your account." : "Your listing is no longer visible to customers. Please contact the Artelix support team to resolve the suspension."}</p>
        {listing?.status === "suspended" && listing.moderationReason && <p className="mt-2 break-words text-sm leading-relaxed"><strong>Reason: </strong>{listing.moderationReason}</p>}
      </div>
    </section>
  );
}
