import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PATH } from "../../components"

const LoginHome = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(PATH.login)
  },[])
  return ""
}

export default LoginHome