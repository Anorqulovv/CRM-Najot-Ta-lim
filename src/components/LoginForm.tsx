import { useState } from "react"
import { Form, Input, Button } from "antd"
import { LockOutlined, UserOutlined, PhoneOutlined, SafetyOutlined } from "@ant-design/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { instance } from "../hooks"
import { toast } from "react-hot-toast"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import PATH from "./Path"
import QueryPATH from "./QueryPath"

type Mode = "password" | "otp"
type OtpStep = "phone" | "code"

const INPUT_CLS =
  "h-14! rounded-2xl! bg-white/10! border-white/20! text-white! placeholder:text-white/40! focus:bg-white/20! focus:border-white/40! transition-all duration-300"

const LoginForm = () => {
  const navigate = useNavigate()
  const [, setCookie] = useCookies(["accessToken"])
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<Mode>("password")
  const [otpStep, setOtpStep] = useState<OtpStep>("phone")
  const [phone, setPhone] = useState("")

  // ── 1. Username + Password login ─────────────────────────────────
  const { mutate: loginPassword, isPending: passLoading } = useMutation({
    mutationFn: (body: { username: string; password: string }) =>
      instance().post("/auth/login", body),
    onSuccess: (res) => {
      toast.success("Muvaffaqiyatli kirdingiz!")
      queryClient.clear()
      localStorage.clear()
      sessionStorage.clear()
      setCookie("accessToken", res.data.data.token.accessToken, { path: "/" })
      const role = res.data?.data?.user?.role
      navigate(role === "PARENT" ? PATH.profile : PATH.home, { replace: true })
      queryClient.removeQueries({ queryKey: [QueryPATH.me] })
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || err.message),
  })

  // ── 2. OTP yuborish ───────────────────────────────────────────────
  const { mutate: sendOtp, isPending: sendLoading } = useMutation({
    mutationFn: (body: { phone: string }) =>
      instance().post("/auth/otp/send", body),
    onSuccess: () => {
      toast.success("Kod Telegram ga yuborildi!")
      setOtpStep("code")
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || err.message),
  })

  // ── 3. OTP tasdiqlash va login ────────────────────────────────────
  const { mutate: verifyOtp, isPending: verifyLoading } = useMutation({
    mutationFn: (body: { phone: string; code: string }) =>
      instance().post("/auth/otp/verify", body),
    onSuccess: (res) => {
      toast.success("Muvaffaqiyatli kirdingiz!")
      queryClient.clear()
      localStorage.clear()
      sessionStorage.clear()
      setCookie("accessToken", res.data.data.token.accessToken, { path: "/" })
      const role = res.data?.data?.user?.role
      navigate(role === "PARENT" ? PATH.profile : PATH.home, { replace: true })
      queryClient.removeQueries({ queryKey: [QueryPATH.me] })
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || err.message),
  })

  // ── Render: Username + Password ───────────────────────────────────
  const renderPasswordForm = () => (
    <Form
      layout="vertical"
      className="text-white space-y-5"
      onFinish={(v) =>
        loginPassword({
          username: v.username.trim(),
          password: v.password.trim(),
        })
      }
      autoComplete="off"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Username kiriting!" }]}
      >
        <Input
          allowClear
          size="large"
          prefix={<UserOutlined className="text-white/60" />}
          placeholder="Username"
          className={INPUT_CLS}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Password kiriting!" }]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-white/60" />}
          placeholder="Password"
          className={INPUT_CLS}
        />
      </Form.Item>
      <Button
        htmlType="submit"
        loading={passLoading}
        block
        size="large"
        className="h-14! rounded-2xl! bg-white! text-black! font-semibold text-base hover:scale-[1.02]! hover:opacity-90! transition-all duration-300"
      >
        Kirish
      </Button>
    </Form>
  )

  // ── Render: OTP — telefon kiritish ───────────────────────────────
  const renderOtpPhoneForm = () => (
    <Form
      layout="vertical"
      className="text-white space-y-5"
      onFinish={(v) => {
        const trimmedPhone = v.phone.trim()
        setPhone(trimmedPhone)
        sendOtp({ phone: trimmedPhone })
      }}
      autoComplete="off"
    >
      <div className="text-white/60 text-sm mb-2 text-center">
        Telegram ga bog'langan telefon raqamingizni kiriting
      </div>
      <Form.Item
        name="phone"
        rules={[
          { required: true, message: "Telefon raqam kiriting!" },
          {
            pattern: /^\+?[0-9]{9,13}$/,
            message: "To'g'ri raqam kiriting (masalan: +998901234567)",
          },
        ]}
      >
        <Input
          allowClear
          size="large"
          prefix={<PhoneOutlined className="text-white/60" />}
          placeholder="+998 90 123 45 67"
          className={INPUT_CLS}
        />
      </Form.Item>
      <Button
        htmlType="submit"
        loading={sendLoading}
        block
        size="large"
        className="h-14! rounded-2xl! bg-white! text-black! font-semibold text-base hover:scale-[1.02]! hover:opacity-90! transition-all duration-300"
      >
        Kod yuborish
      </Button>
    </Form>
  )

  // ── Render: OTP — kodni kiritish ─────────────────────────────────
  const renderOtpCodeForm = () => (
    <Form
      layout="vertical"
      className="text-white space-y-5"
      onFinish={(v) => verifyOtp({ phone: phone.trim(), code: v.code.trim() })}
      autoComplete="off"
    >
      <div className="text-white/60 text-sm text-center">
        <span className="text-white font-semibold">{phone}</span> raqamiga
        Telegram orqali 6 xonali kod yuborildi
      </div>

      <Form.Item
        name="code"
        rules={[
          { required: true, message: "Kodni kiriting!" },
          {
            len: 6,
            message: "Kod 6 ta raqamdan iborat bo'lishi kerak!",
          },
        ]}
      >
        <Input
          size="large"
          prefix={<SafetyOutlined className="text-white/60" />}
          placeholder="• • • • • •"
          maxLength={6}
          className={INPUT_CLS}
          style={{ letterSpacing: "0.4em", textAlign: "center", fontSize: 20 }}
        />
      </Form.Item>

      <Button
        htmlType="submit"
        loading={verifyLoading}
        block
        size="large"
        className="h-14! rounded-2xl! bg-white! text-black! font-semibold text-base hover:scale-[1.02]! hover:opacity-90! transition-all duration-300"
      >
        Tasdiqlash
      </Button>

      {/* Qayta yuborish */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setOtpStep("phone")
            sendOtp({ phone: phone.trim() })
          }}
          disabled={sendLoading}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.45)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {sendLoading ? "Yuborilmoqda..." : "Kodni qayta yuborish"}
        </button>
      </div>
    </Form>
  )

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "4px",
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => {
            setMode("password")
            setOtpStep("phone")
          }}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background:
              mode === "password" ? "rgba(255,255,255,0.18)" : "transparent",
            color:
              mode === "password" ? "#fff" : "rgba(255,255,255,0.45)",
            fontWeight: mode === "password" ? 600 : 400,
            fontSize: 13,
            transition: "all 0.2s",
          }}
        >
          <UserOutlined style={{ marginRight: 6 }} />
          Parol bilan
        </button>
        <button
          onClick={() => {
            setMode("otp")
            setOtpStep("phone")
          }}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background:
              mode === "otp" ? "rgba(255,255,255,0.18)" : "transparent",
            color: mode === "otp" ? "#fff" : "rgba(255,255,255,0.45)",
            fontWeight: mode === "otp" ? 600 : 400,
            fontSize: 13,
            transition: "all 0.2s",
          }}
        >
          <SafetyOutlined style={{ marginRight: 6 }} />
          Telegram OTP
        </button>
      </div>

      {/* Form content */}
      {mode === "password" && renderPasswordForm()}
      {mode === "otp" && otpStep === "phone" && renderOtpPhoneForm()}
      {mode === "otp" && otpStep === "code" && renderOtpCodeForm()}
    </div>
  )
}

export default LoginForm