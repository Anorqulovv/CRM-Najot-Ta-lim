import { Navigate, Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";
import { PATH } from "../components";

const PublicRoute = () => {
  const [cookies] = useCookies(["accessToken"]);

  return cookies.accessToken ? <Navigate to={PATH.home} replace /> : <Outlet />;
};

export default PublicRoute;