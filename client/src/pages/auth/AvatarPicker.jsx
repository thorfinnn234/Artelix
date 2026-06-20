import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const AVATAR_SEEDS = [
  "Felix",
  "Aneka",
  "Destiny",
  "Bubba",
  "Gizmo",
  "Smokey",
  "Midnight",
  "Luna",
  "Cleo",
  "Jasper",
  "Milo",
  "Bella",
  "Oscar",
  "Daisy",
  "Rocky",
  "Molly",
  "Max",
  "Sadie",
  "Charlie",
  "Lola",
  "Buddy",
  "Stella",
  "Cooper",
  "Zoey",
  "Bear",
  "Lily",
  "Duke",
  "Penny",
  "Tucker",
  "Maggie",
];

const STYLES = [
  { id: "adventurer", label: "Adventurer" },
  { id: "avataaars", label: "Cartoon" },
  { id: "big-ears", label: "Big Ears" },
  { id: "fun-emoji", label: "Emoji" },
  { id: "croodles", label: "Doodle" },
  { id: "lorelei", label: "Minimal" },
];

export default function AvatarPicker() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [selected, setSelected] = useState(null);
  const [style, setStyle] = useState("adventurer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAvatarUrl = (seed, avatarStyle = style) =>
    `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}`;

  const handleSave = async () => {
    if (!selected) return setError("Please pick an avatar first!");
    setLoading(true);
    setError("");
    try {
      const avatarUrl = getAvatarUrl(selected);

      // Get token directly from localStorage
      const token = localStorage.getItem("Artelix-token");
      console.log("Token:", token ? "✅ Found" : "❌ Missing"); // debug

      const res = await api.patch(
        "/me",
        { avatar: avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }, // ← pass explicitly
      );

      login(res.data.user, token);

      if (res.data.user.role === "Artisan") navigate("/artisan/dashboard");
      else navigate("/user/home");
    } catch (err) {
      console.error("Avatar error:", err.response?.data); // debug
      setError("Failed to save avatar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (user?.role === "Artisan") navigate("/artisan/dashboard");
    else navigate("/user/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div
        className="bg-white dark:bg-dark-surface border-b 
                      border-gray-100 dark:border-dark-border px-4 py-4 
                      flex items-center justify-between sticky top-0 z-10"
      >
        <h1 className="font-heading text-lg font-bold text-green-500">
          Artelix
        </h1>
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 hover:text-gray-600 
                           dark:hover:text-gray-300 font-medium"
        >
          Skip for now
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 
                          flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-3xl">🎨</span>
          </div>
          <h2
            className="font-heading text-2xl font-bold text-gray-900 
                         dark:text-gray-100 mb-2"
          >
            Pick your avatar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Choose an avatar that represents you on Artelix
          </p>
        </div>

        {/* Selected Preview */}
        {selected && (
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={getAvatarUrl(selected)}
                alt="Selected avatar"
                className="w-24 h-24 rounded-full border-4 border-green-500 
                           bg-white"
              />
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 
                              rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-500 font-semibold mt-3">
              Looking good! 🎉
            </p>
          </div>
        )}

        {/* Style Tabs */}
        <div className="mb-6">
          <p
            className="text-xs font-semibold text-gray-400 uppercase 
                        tracking-wider mb-3"
          >
            Avatar Style
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setStyle(s.id);
                  setSelected(null);
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold 
                            transition-all duration-200
                            ${
                              style === s.id
                                ? "bg-green-500 text-white"
                                : "bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:border-green-500 hover:text-green-500"
                            }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="mb-6">
          <p
            className="text-xs font-semibold text-gray-400 uppercase 
                        tracking-wider mb-3"
          >
            Choose your look
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
            {AVATAR_SEEDS.map((seed) => (
              <button
                key={seed}
                onClick={() => setSelected(seed)}
                className={`relative aspect-square rounded-2xl overflow-hidden 
                            border-2 transition-all duration-200 bg-white 
                            dark:bg-dark-card
                            ${
                              selected === seed
                                ? "border-green-500"
                                : "border-gray-100 dark:border-dark-border hover:border-green-300"
                            }`}
              >
                <img
                  src={getAvatarUrl(seed)}
                  alt={seed}
                  className="w-full h-full object-cover p-1"
                  loading="lazy"
                />
                {selected === seed && (
                  <div
                    className="absolute inset-0 bg-green-500/10 flex 
                                  items-center justify-center"
                  >
                    <div
                      className="w-5 h-5 bg-green-500 rounded-full 
                                    flex items-center justify-center"
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="bg-red-50 dark:bg-red-500/10 text-red-600 
                          dark:text-red-400 text-sm px-4 py-3 rounded-md mb-4"
          >
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSave}
          disabled={loading || !selected}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-60 
                     disabled:cursor-not-allowed"
        >
          {loading
            ? "Saving..."
            : selected
              ? "Use This Avatar "
              : "Select an avatar first"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          You can change this anytime in your profile settings
        </p>
      </div>
    </div>
  );
}
