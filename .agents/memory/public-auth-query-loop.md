---
name: Public pages auth-query loop
description: How duplicate auth queries in public pages can cause request loops under the Replit artifact router.
---

When making a page accessible without authentication, avoid calling `useGetMe()` in both the layout and the page component. Multiple active observers of the same query key can interact with the artifact router in a way that produces a tight request loop, leading to 504 gateway timeouts and blank screens in the preview.

**Why:** The public layout and the page both need to know whether the user is authenticated, but each independent `useGetMe()` call registers as an active query observer. Under the Replit iframe/proxy, rapid alternating fetches can overwhelm the artifact router before the first response settles, especially when the request returns 401.

**How to apply:**
- Centralize auth state in the top-level layout for the route.
- Pass the resolved user (or `null` for anonymous) down to the sidebar and page components as props.
- Let page components use the backend-provided `isOwner` flag instead of deriving ownership from `useGetMe()`.
