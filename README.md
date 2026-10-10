# #VanLife

A van rental marketplace where hosts list their vans and travelers book them.

The goal of this project was to explore React Router's Data API (loaders, actions and deferred data) and to see how much better it is than the usual useEffect + useState approach to fetching and mutating data. The app is the testbed: it grew from a mock-data demo into a full-stack app with real authentication, a real database, image uploads, bookings and reviews, so the Data API was tested against realistic problems rather than a toy example.
**Live site:** https://vans-life-fc8ca.web.app/

## Try it out

You can register your own account, or use the demo accounts below.

| Role | Email | Password |
|---|---|---|
| Host (has vans, bookings and reviews) | john@example.com | john123 |
| Traveler (has trips) | maya@example.com |  |

Log in as the host to explore the Dashboard, Income and Reviews pages.
Log in as the traveler to book a van and review a finished trip.

These are shared demo accounts, so data may be reset from time to time.
Please don't use a real password on this site.

The project started from the Scrimba #vanlife course, which used MirageJS for fake data. I replaced the mock backend with Firebase and built everything beyond the original scope myself.

---

## What the app does

**For travelers**
- Browse all available vans and filter them by category (Simple, Rugged, Luxury). The filter lives in the URL, so it survives refreshes and can be shared.
- Open a van to see its details, price and reviews.
- Book a van by choosing dates, with a live price preview.
- See their bookings on a **Trips** page and review a van once the trip has ended.

**For hosts**
- Register and log in with email and password.
- **Dashboard** with total vans, average price, total booked and recently added vans.
- Add, edit and delete their own vans, including photo upload.
- **Income** page with total booked, this month's total, a six-month bar chart and a list of bookings.
- **Reviews** page with the average rating, a star breakdown and every review across their vans.
- Their own vans are hidden from the public Vans pages, and they can't rent their own van.

---

## Tech stack

| Area | Tool |
|---|---|
| UI | React 19, Vite |
| Routing and data | React Router (Data API) |
| Authentication | Firebase Authentication (email and password) |
| Database | Cloud Firestore |
| Image uploads | Cloudinary (unsigned upload preset) |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |
| Styling | Plain CSS |

---.

Why the Data API beats useEffect for data fetching

The common pattern is to fetch inside a component:

jsx
// The useEffect way
function HostVans() {
  const [vans, setVans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getHostVans()
      .then(data => { if (!cancelled) setVans(data) })
      .catch(err => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <h2>Loading...</h2>
  if (error) return <h2>{error.message}</h2>
  return <VansList vans={vans} />
}

With the Data API, the same page is a loader plus a component that only renders:

jsx
// The Data API way
export async function loader({ request }) {
  await requireAuth({ request })
  return { hostVans: getHostVans() }
}

function HostVans() {
  const { hostVans } = useLoaderData()
  return (
    <Suspense fallback={<h2>Loading vans...</h2>}>
      <VansList vansPromise={hostVans} />
    </Suspense>
  )
}

What this fixed in practice:

Problem with useEffect	How the Data API handled it
Fetch-on-render waterfalls. Nothing loads until the component mounts, and a child's fetch waits for its parent to render.	Loaders start when navigation begins and run in parallel across nested routes.
Boilerplate on every page. Three pieces of state (data, loading, error) plus a cleanup flag.	The router owns the lifecycle. Components just read the data.
Race and stale-update bugs. Fast navigation can let an old request overwrite a newer one, hence the cancelled flag.	The router cancels and ignores superseded navigations for you.
Auth checks that flash protected content. A component renders first and redirects afterwards.	A loader throws redirect() before the page renders, so protected UI never appears for logged-out users.
Manual refetching after writes. After adding or deleting a van, you have to remember to reload the list.	After an action completes, the router revalidates the active loaders, so lists and stats update on their own.
Scattered error handling. Every component invents its own error UI.	Throw from a loader or action and a single errorElement handles it.
Hand-rolled form state. Controlled inputs, onSubmit, preventDefault and a submitting flag.	<Form>, useActionData and useNavigation cover it with plain HTML forms.

Honest caveats. useEffect isn't wrong. It's the right tool for synchronizing with things outside React, such as subscriptions, timers or the Firebase auth listener in AuthContext, which I still use. And loaders aren't a cache: there's no stale-while-revalidate, request deduplication or background refetching like TanStack Query provides. For an app of this size, though, the Data API removed nearly all of the data-fetching code from my components.

## What I learned about React Router's Data API

This was the main goal of the project, so here is what I took away from it.

### 1. Loaders move data fetching out of components
With `createBrowserRouter` and `createRoutesFromElements`, each route can declare a `loader`. Data starts loading as soon as navigation begins, instead of after the component mounts and an effect fires. That removed the usual `useEffect` + `useState` + loading-flag boilerplate from every page.

### 2. Actions turn forms into plain HTML flows
`<Form method="post">` plus an `action` handles login, registration, adding a van, booking and reviewing. The action reads `formData`, validates, talks to Firebase, and either returns an error message or calls `redirect()`. In the component, `useActionData()` shows the error and `useNavigation()` drives the "Submitting..." button state. There is no manual `onSubmit`, `preventDefault` or loading state anywhere in the forms.

### 3. Deferred data with Suspense and `use()`
Loaders can return a promise without awaiting it. The page renders immediately and `<Suspense>` shows a fallback while the component unwraps the promise with React's `use()` hook. I used this for the Vans list, the host pages, the Dashboard and reviews. A tip I picked up: `await` only what must block navigation (like the auth check) and return the data promise un-awaited.

```jsx
export async function loader({ request }) {
  await requireAuth({ request })            // blocks: redirect happens before render
  return { hostVans: getHostVans() }        // doesn't block: streamed in via Suspense
}
```

### 4. Protecting routes with loaders
`requireAuth` is a loader helper that throws `redirect("/login?...")` when nobody is logged in, including a `redirectTo` so users return to the page they wanted after logging in. Two things tripped me up:

- **Loaders receive `{ request, params }`**, an object, not the request itself.
- **Parent and child loaders run in parallel.** A protected parent loader doesn't stop a child loader from starting, so each child loader calls `requireAuth` itself.

### 5. Firebase's session restore is async
On a hard refresh, `auth.currentUser` is `null` until Firebase restores the session, so a naive check bounces logged-in users to the login page. Waiting for `auth.authStateReady()` inside `getCurrentUser()` fixed it, and every loader and API function uses that helper.

### 6. Nested routes, `Outlet` and `useOutletContext`
`HostLayout` and `HostVanDetail` render child routes through `<Outlet />`. The van detail page passes its data to the Details, Pricing and Photos tabs with `<Outlet context={{ currentVan }} />`, so the children don't refetch.

### 7. Other features I got comfortable with
- **`NavLink`** with `isActive` styling for the header and tab navigation.
- **`useSearchParams`** for filter state in the URL, and passing `state` through `Link` so "Back to simple vans" remembers the filter.
- **Relative links** (`to=".."` with `relative="path"`, `to="."` with `end`) in nested routes.
- **`errorElement`** with `useRouteError` for a single error page that catches loader and action failures. Throwing objects like `{ message, status }` from the API layer gives that page something useful to show.
- **Pathless action routes**, such as `vans/:id/delete`, for a delete button that is a `<Form>` with no page of its own.
- **Dynamic and ranked routes**: `vans/new` and `vans/:id` coexist because React Router ranks static segments higher.
- **Redirect after action**, which prevents duplicate submissions on refresh and keeps the browser history clean (`replace` on login and register forms).

### 8. Lessons from the rest of the stack
- **Components declared inside components** are recreated on every render, which remounts them. Defining them at module level is safer.
- **File uploads need `encType="multipart/form-data"`** on the form, or the action only receives the file name.
- **Security rules are the real backend.** Firestore rules enforce ownership, validate booking totals against the real van price, and limit each trip to one review. Client-side checks are only for user experience.
- **Vite env vars** need the `VITE_` prefix, are baked in at build time, and must be supplied to the CI build as secrets.


---

## Data model (Firestore)

```
users/{uid}        name, email, createdAt
vans/{vanId}       name, price, description, type, imageUrl, hostId, createdAt
rentals/{id}       vanId, vanName, vanImageUrl, hostId, renterId, renterName,
                   startDate, endDate, days, total, createdAt
reviews/{rentalId} rentalId, vanId, vanName, hostId, renterId, renterName,
                   rating, text, createdAt
```

The review's document ID equals its rental's ID, which limits each trip to a single review.

---

## Project structure

```
src/
├── api/                    auth, vans, rentals, reviews
├── context
    ├──  AuthContext.js     AuthContext onAuthStateChanged context for the UI
├── config
    ├──  firebase.js        Firebase initialization (auth, db)
├── utils.js/
    ├── review, requireAuth, rentals, cloudinary
├── validators
    ├── vanForm.js          Shared van validation
├── components/             Layout, Header, Footer, HostLayout, VanForm, Stars, ReviewList, Error
└── pages/
    ├── Home, About, Login, Register, Trips, ReviewTrip, NotFound
    ├── vans/               Vans, VanDetail, RentVan
    └── host/               Dashboard, Income, Reviews, HostVans, HostVanDetail,
                            HostVanInfo, HostVanPricing, HostVanPhotos, AddVan, EditVan
```

---

## Running it locally

**Prerequisites:** Node.js 18+, a Firebase project with Email/Password sign-in and Firestore enabled, and a free Cloudinary account with an **unsigned** upload preset.

```bash
git clone https://github.com/Abbas-Abubakar/vans-life
cd vans-life
npm install
```

Create a `.env` file in the project root:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Publish Firestore security rules that cover the `users`, `vans`, `rentals` and `reviews` collections, then start the dev server:

```bash
npm run dev
```

---

## Deployment

The site is hosted on Firebase Hosting, with a rewrite rule so client-side routes like `/host/vans` don't 404 on refresh. Pushes to the main branch deploy automatically through GitHub Actions. The `VITE_*` values are stored as repository secrets and passed to the build step.

To deploy manually:

```bash
npm run build
firebase deploy --only hosting
```

---

## Known limitations and next steps

- **No double-booking protection.** Preventing overlapping dates needs a Cloud Function or a public availability collection.
- **No payments or cancellation.** Bookings are saved without payment and can't be edited. Stripe and cancellation are natural next steps.
- **The "review after the trip ends" check is client-side.** The security rules still guarantee that the reviewer booked that trip and that there is one review per trip.
- **Deleted vans leave their images in Cloudinary.** Unsigned uploads can't be deleted from the browser.
- **Reviews can't be edited or deleted.**

---

## Acknowledgements

The original #vanlife concept and design come from the Scrimba React Router course. Everything involving Firebase, authentication, uploads, bookings, reviews and deployment was added on top as a learning exercise.
