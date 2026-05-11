import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";   // To'g'ri import yo'lini tekshiring
import NotFound from "../pages/NotFound";

const AuthRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthRoute;