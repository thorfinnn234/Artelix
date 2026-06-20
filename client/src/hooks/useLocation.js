import { useState } from "react";

export default function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
        return;
      }

      setLoading(true);
      setError("");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // OpenStreetMap Nominatim — completely free, no API key
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              {
                headers: {
                  // Required by Nominatim usage policy
                  "Accept-Language": "en",
                  "User-Agent": "Artelix/1.0",
                },
              }
            );

            const data = await res.json();

            // Build a clean address
            const addr = data.address;
            const parts = [
              addr.road || addr.neighbourhood || addr.suburb,
              addr.city || addr.town || addr.village || addr.county,
              addr.state,
              addr.country,
            ].filter(Boolean);

            const address = parts.join(", ");

            resolve({
              lat:     latitude,
              lng:     longitude,
              address: address || data.display_name,
            });
          } catch (err) {
            reject("Failed to get address. Please enter manually.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setLoading(false);
          if (err.code === 1) {
            reject("Location access denied. Please allow location access and try again.");
          } else if (err.code === 2) {
            reject("Location unavailable. Please try again.");
          } else {
            reject("Location request timed out. Please try again.");
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  return { detectLocation, loading, error, setError };
}