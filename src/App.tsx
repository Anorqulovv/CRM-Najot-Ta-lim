import { useCookies } from "react-cookie"
import { AuthRoute, DashboardRoute } from "./routes"

const App = () => {
  const [cookies] = useCookies(['token'])
  return cookies.token ? <DashboardRoute/> : <AuthRoute/>
}

export default App
