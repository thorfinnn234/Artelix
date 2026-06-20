# useEffect Infinite Loop Analysis - Artisan Search Results

**Scan Date:** May 6, 2026
**Directory:** `client/src`
**Total useEffect Hooks Found:** 22

---

## ⚠️ CRITICAL ISSUES (Risk Level: HIGH)

### 1. **Missing Dependency Array Parameter in Custom Hook**
**Severity:** HIGH - Potential Data Staling  
**File:** [hooks/useArtisan.js](client/src/hooks/useArtisan.js#L28-L29)  
**Line:** 28-29

```javascript
useEffect(() => {
  fetchArtisan();
}, []);  // ← Empty dependency array
```

**Problem:** The `fetchArtisan` function uses `params` from the hook parameter via closure. If the hook is called with different `params` on subsequent renders, the effect won't re-run because `params` is not in the dependency array.

**Impact:** Data may become stale if the parent component passes different search parameters but the hook doesn't refetch.

**Fix:** Either:
- Add `params` to dependency array if it's meant to be reactive: `[params]`
- Or document that this hook only works for initial mount fetching
- Better: wrap params in useMemo if passing objects: `useEffect(() => { fetchArtisan(); }, [JSON.stringify(params)])`

---

## ⚠️ MODERATE ISSUES (Risk Level: MEDIUM)

### 2. **Unclear Lifecycle in Search/Filter Pages**
**Severity:** MEDIUM - Potential Multiple API Calls  
**Files:** 
- [pages/admin/Users.jsx](client/src/pages/admin/Users.jsx#L27-L31)  
- [pages/admin/Artisan.jsx](client/src/pages/admin/Artisan.jsx#L36-L40)  
- [pages/user/Home.jsx](client/src/pages/user/Home.jsx#L41-L45)  

**Pattern Example (admin/Users.jsx, lines 14-31):**
```javascript
const fetchUsers = useCallback(async () => {
  setLoading(true);
  try {
    const data = await getAdminUsers({ page, limit: 12, search });
    setUsers(data.items || []);
    setTotal(data.total || 0);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [page, search]);  // ← Recreates on page/search change

useEffect(() => {
  const timer = setTimeout(fetchUsers, 400);
  return () => clearTimeout(timer);
}, [fetchUsers]);  // ← Runs when fetchUsers reference changes
```

**Analysis:** While this pattern is actually CORRECT (it uses useCallback and depends on mutable state), it could be confusing because:
- `fetchUsers` gets recreated when `page` or `search` changes
- This triggers the useEffect to run again
- The 400ms debounce prevents thrashing

**Status:** ✓ This is actually correct behavior, but could be improved by using `useMemo` on the params object to make it more explicit.

---

## ✓ SAFE PATTERNS (No Issues)

### 3. **Correctly Memoized Callbacks in Admin Context**
**Files:**
- [pages/admin/Users.jsx](client/src/pages/admin/Users.jsx)
- [pages/admin/Artisan.jsx](client/src/pages/admin/Artisan.jsx)
- [pages/user/Home.jsx](client/src/pages/user/Home.jsx)

**Status:** ✓ All use `useCallback` with explicit dependencies and no infinite loop risk.

---

### 4. **Event Listener useEffect Hooks**
**Files:**
- [layouts/UserLayout.jsx](client/src/layouts/UserLayout.jsx#L46)
- [layouts/ArtisanLayout.jsx](client/src/layouts/ArtisanLayout.jsx#L65)
- [layouts/AdminLayout.jsx](client/src/layouts/AdminLayout.jsx#L76)
- [components/MessageDropdown.jsx](client/src/components/MessageDropdown.jsx#L47)
- [components/NotificationDropdown.jsx](client/src/components/NotificationDropdown.jsx#L54)

**Pattern:**
```javascript
useEffect(() => {
  const handler = (e) => {
    if (ref.current && !ref.current.contains(e.target)) setOpen(false);
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);  // ← Empty array is correct for event listeners
```

**Status:** ✓ Correctly implemented with empty dependency array since there are no external dependencies.

---

### 5. **Theme Context with Proper Dependencies**
**File:** [context/ThemeContext.jsx](client/src/context/ThemeContext.jsx#L10-L17)

```javascript
useEffect(() => {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    localStorage.setItem("Artisyn-theme", "dark");
  } else {
    root.classList.remove("dark");
    localStorage.setItem("Artisyn-theme", "light");
  }
}, [isDark]);  // ← Correctly depends on state change
```

**Status:** ✓ No infinite loop: `isDark` is a state variable, not modified in the effect.

---

### 6. **Auth Context with Ref Guard**
**File:** [context/AuthContext.jsx](client/src/context/AuthContext.jsx#L21-L42)

```javascript
const hasFetched = useRef(false);

useEffect(() => {
  if (hasFetched.current) return;  // ← Ref prevents multiple fetches
  hasFetched.current = true;

  const token = localStorage.getItem("Artisyn-token");
  if (!token) {
    setLoading(false);
    return;
  }

  api.get("/me")
    .then((res) => setUser(res.data.user))
    .catch(() => localStorage.removeItem("Artisyn-token"))
    .finally(() => setLoading(false));
}, []);  // ← Empty array + ref guard = single execution
```

**Status:** ✓ Excellent pattern: Uses ref to ensure single API call even in development Strict Mode.

---

### 7. **Route Navigation Effects**
**File:** [pages/Onboarding.jsx](client/src/pages/Onboarding.jsx#L422-L430)

```javascript
useEffect(() => {
  if (user) {
    if (user.role === "admin") navigate("/admin/dashboard", { replace: true });
    else if (user.role === "Artisan") navigate("/Artisan/dashboard", { replace: true });
    else navigate("/user/home", { replace: true });
  }
}, [user]);  // ← Correctly depends on user

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 50);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);  // ← Event listener with no deps
```

**Status:** ✓ Both patterns are correct.

---

### 8. **Data Fetching with ID Dependencies**
**File:** [pages/Artisan/Listing.jsx](client/src/pages/Artisan/Listing.jsx#L61)  
**File:** [pages/user/ArtisanDetails.jsx](client/src/pages/user/ArtisanDetails.jsx#L34)

```javascript
useEffect(() => {
  getMyArtisan()
    .then((data) => {
      const v = data.Artisan || data;
      setArtisan(v);
      setForm({...});
    })
    .catch(() => setError("Failed to load listing."))
    .finally(() => setLoading(false));
}, []);  // ← Empty array for single fetch on mount
```

**Status:** ✓ Correct for single fetch patterns.

---

### 9. **Immutable State Updates**
**Files:**
- [components/MessageDropdown.jsx](client/src/components/MessageDropdown.jsx#L56-L61)
- [components/NotificationDropdown.jsx](client/src/components/NotificationDropdown.jsx#L63-L68)

```javascript
const markAllRead = () =>
  setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
```

**Status:** ✓ Uses updater function form of setState - cannot cause infinite loops.

---

## 📊 SUMMARY

| Category | Count | Risk Level |
|----------|-------|-----------|
| Correctly Implemented | 18 | ✓ Low |
| Potential Issues | 1 | ⚠️ Medium |
| Critical Issues | 1 | ⚠️ High |
| Needs Review | 2 | ℹ️ Info |

---

## 🔧 RECOMMENDATIONS

### Priority 1: Fix useArtisan Hook
**File:** [hooks/useArtisan.js](client/src/hooks/useArtisan.js)

**Current:**
```javascript
useEffect(() => {
  fetchArtisan();
}, []);
```

**Recommended:**
```javascript
useEffect(() => {
  fetchArtisan();
}, [params]);  // If params should be reactive
// OR document that this only fetches on initial mount
```

### Priority 2: Document Debounce Patterns
The admin pages use a correct but slightly non-obvious pattern. Consider:
- Adding JSDoc comments explaining the debounce strategy
- Creating a custom hook `useDebouncedFetch` to encapsulate the pattern

### Priority 3: Consider useMemo for Search Objects
In pages like `admin/Users.jsx`, consider memoizing the search params:

```javascript
const fetchParams = useMemo(() => ({
  page,
  limit: 12,
  search,
}), [page, search]);
```

This makes the dependency graph more explicit.

---

## 📋 FILES ANALYZED

✓ All files in `client/src/**/*.{js,jsx}` containing `useEffect`

### No useEffect Issues Found In:
- [pages/Artisan/Dashboard.jsx](client/src/pages/Artisan/Dashboard.jsx#L40)
- [pages/Artisan/Profile.jsx](client/src/pages/Artisan/Profile.jsx#L23)
- [pages/admin/Dashboard.jsx](client/src/pages/admin/Dashboard.jsx#L63)
- [pages/admin/Approvals.jsx](client/src/pages/admin/Approvals.jsx#L24)
- [pages/user/SavedArtisan.jsx](client/src/pages/user/SavedArtisan.jsx#L25)
- [pages/auth/GoogleSuccess.jsx](client/src/pages/auth/GoogleSuccess.jsx#L11)
- [pages/Onboarding.jsx](client/src/pages/Onboarding.jsx#L11-L430)
- [context/ThemeContext.jsx](client/src/context/ThemeContext.jsx#L10)
- [context/AuthContext.jsx](client/src/context/AuthContext.jsx#L21)

---

**Analysis Completed By:** GitHub Copilot  
**Date:** May 6, 2026
