import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../components";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(["accessToken"]);

  useEffect(() => {
    try {
      const decoded: any = jwtDecode(cookies.accessToken);
      const role = decoded?.role;

      if (role === "STUDENT") {
        navigate(PATH.tests, { replace: true });
      } else if (role === "SUPPORT" || role === "TEACHER") {
        navigate(PATH.groups, { replace: true });
      } else {
        navigate(PATH.directions, { replace: true });
      }
    } catch {
      navigate(PATH.directions, { replace: true });
    }
  }, [navigate]);

  return null;
};

export default DashboardHome;