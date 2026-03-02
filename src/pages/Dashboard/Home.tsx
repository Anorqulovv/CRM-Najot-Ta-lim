import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PATH } from "../../components"

const Home = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(PATH.stacks)
  },[])
  return ""
}

export default Home