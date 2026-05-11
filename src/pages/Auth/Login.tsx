import { LogoIcon } from "../../assets/icons"
import { LoginImg } from "../../assets/images"
import { LoginForm } from "../../components"

const Login = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <img src={LoginImg} alt="bg" className="absolute w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-sm" />
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="w-full max-w-7xl h-[85vh] flex rounded-3xl overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
          <div className="relative w-1/2 h-full hidden md:block">
            <img src={LoginImg} alt="bg" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-tr from-black/60 via-black/20 to-transparent" />
          </div>
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-12 text-white">
            <div className="text-center my-0 mx-auto">
              <LogoIcon classList="scale-[1.6] ml-[30px]" />
              <h2 className="mt-6 text-2xl font-semibold tracking-wide">
                Najot Ta'lim
              </h2>
              <p className="text-sm opacity-70 mt-1">
                Sign in to your account
              </p>
            </div>
            <div className="w-full mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Login