import { LogoIcon } from "../../assets/icons"
import { LoginImg } from "../../assets/images"
import { LoginForm } from "../../components"

const Login = () => {
  return (
    <div className="flex h-screen">
      <div className="w-[50%]">
        <img className="w-full object-cover h-full" src={LoginImg} alt="Login img" />
      </div>
      <div className="w-[40%] p-30">
        <div className="flex text-[#9c7751] items-center gap-8">
          <LogoIcon classList="scale-[1.5]"/>
          <strong className="font-normal text-[35px]">Najot Ta'lim</strong>
        </div>
        <LoginForm/>
      </div>
    </div>
  )
}

export default Login