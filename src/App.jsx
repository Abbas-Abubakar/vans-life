
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, redirect } from "react-router-dom"
import './App.css'
import Layout from "./components/Layout"
import Home from "./pages/Home"
import About from "./pages/About"
import Vans, { loader as vansLoader } from "./pages/vans/Vans"
import VanDetail, { loader as vanDetailLoader } from "./pages/vans/VanDetail"
import HostLayout from "./components/HostLayout"
import Dashboard from "./pages/host/Dashboard"
import Income from "./pages/host/Income"
import Reviews from "./pages/host/Reviews"
import HostVans, { loader as hostVansLoader } from "./pages/host/HostVans"
import HostVanDetail, { loader as hostVanDetailLoader, deleteAction } from "./pages/host/HostVanDetail"
import HostVanInfo from "./pages/host/HostVanInfo"
import HostVanPricing from "./pages/host/HostVanPricing"
import HostVanPhotos from "./pages/host/HostVanPhotos"
import NotFound from "./pages/NotFound"
import ErrorPage from "./components/Error"
import Login, { loader as loginLoader, action as loginAction } from "./pages/Login"
import Register, { action as registerAction } from "./pages/Register"
import AddVan, { loader as addVanLoader, action as addVanAction } from "./pages/host/AddVan"
import EditVan, { loader as editVanLoader, action as editVanAction } from "./pages/host/EditVan"
import { requireAuth } from "./utils/requireAuth"


const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="register" element={<Register />} action={registerAction} />
    <Route path="login" element={<Login />} loader={loginLoader} action={loginAction} />
    <Route path="vans" element={<Vans />} loader={vansLoader} />
    <Route path="vans/:id" element={<VanDetail />} loader={vanDetailLoader} />

    <Route
      path="host"
      element={<HostLayout />}
      loader={requireAuth}
    >
      <Route index element={<Dashboard />} />
      <Route path="income" element={<Income />} />
      <Route path="reviews" element={<Reviews />} />

      <Route path="vans" element={<HostVans />} loader={hostVansLoader} />
      <Route path="vans/new" element={<AddVan />} loader={addVanLoader} action={addVanAction} />
      <Route path="vans/:id/edit" element={<EditVan />} loader={editVanLoader} action={editVanAction} />
      <Route path="vans/:id/delete" action={deleteAction} />
      <Route
        path="vans/:id"
        element={<HostVanDetail />}
        loader={hostVanDetailLoader}
      >
        <Route index element={<HostVanInfo />} />
        <Route path="pricing" element={<HostVanPricing />} />
        <Route path="photos" element={<HostVanPhotos />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Route>
))

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
