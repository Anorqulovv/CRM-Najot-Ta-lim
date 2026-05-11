import { Navigate, Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";
import { PATH } from "../components";

const PrivateRoute = () => {
    const [cookies] = useCookies(["accessToken"]);

    return cookies.accessToken ? <Outlet /> : <Navigate to={PATH.login} replace />;
};

export default PrivateRoute;