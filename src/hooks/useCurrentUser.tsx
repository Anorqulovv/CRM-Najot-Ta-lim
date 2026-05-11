import { useCookies } from "react-cookie"
import { jwtDecode } from "jwt-decode"

export const useCurrentUser = () => {
  const [cookies] = useCookies(["accessToken"])
  
  try {
    if (!cookies.accessToken) return null
    const decoded: any = jwtDecode(cookies.accessToken)
    return decoded
  } catch {
    return null
  }
}