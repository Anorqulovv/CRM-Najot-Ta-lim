import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

import AuthRoute from "./routes/AuthRoute";
import DashboardRoute from "./routes/DashboardRoute";
import { PATH } from "./components";

const App = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={`${PATH.login}/*`} element={<AuthRoute />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/*" element={<DashboardRoute />} />
      </Route>
      <Route path="*" element={<Navigate to={PATH.login} replace />} />
    </Routes>
  );
};

export default App;