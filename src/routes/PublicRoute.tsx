import { Navigate, Outlet } from "react-router-dom"
import { useCookies } from "react-cookie"
import { jwtDecode } from "jwt-decode"
import { PATH } from "../components"

const PublicRoute = () => {
  const [cookies] = useCookies(["accessToken"])

  if (!cookies.accessToken) return <Outlet />

  try {
    const decoded: any = jwtDecode(cookies.accessToken)
    return <Navigate to={decoded?.role === "PARENT" ? PATH.profile : PATH.home} replace />
  } catch {
    return <Navigate to={PATH.login} replace />
  }
}

export default PublicRoute
