import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Card, Radio, Typography, Space, Spin, Progress, Tag } from "antd"
import { GetById } from "../../../service"
import toast from "react-hot-toast"
import { QueryPATH } from "../../../components"
import { instance } from "../../../hooks"
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ArrowLeftOutlined,
  SendOutlined,
  FileTextOutlined,
  LockOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography

type StatusScreenProps = {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  message?: React.ReactNode
  note?: React.ReactNode
  actionText?: string
  onAction?: () => void
}

const StatusScreen = ({
  icon,
  iconBg,
  iconColor,
  title,
  message,
  note,
  actionText,
  onAction,
}: StatusScreenProps) => (
  <div className="tests-take-page">
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 24,
          textAlign: "center",
          border: "1px solid #f0e8df",
          boxShadow: "0 20px 60px rgba(143, 92, 40, 0.14)",
        }}
        styles={{ body: { padding: "34px 30px" } }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: "50%",
            margin: "0 auto 18px",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 34, color: iconColor, display: "flex" }}>{icon}</span>
        </div>

        <Title level={3} style={{ margin: "0 0 10px", fontWeight: 800 }}>
          {title}
        </Title>

        {message && (
          <Text
            style={{
              display: "block",
              margin: "0 auto 24px",
              maxWidth: 420,
              fontSize: 15,
              lineHeight: 1.7,
              color: "#7c5f46",
            }}
          >
            {message}
          </Text>
        )}

        {note && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: actionText ? 24 : 0,
            }}
          >
            {note}
          </div>
        )}

        {actionText && (
          <Button
            size="large"
            onClick={onAction}
            style={{
              height: 44,
              borderRadius: 12,
              paddingInline: 26,
              background: "linear-gradient(135deg, #8f5c28, #c8864a)",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              boxShadow: "0 8px 22px rgba(143, 92, 40, 0.28)",
            }}
          >
            {actionText}
          </Button>
        )}
      </Card>
    </div>
  </div>
)

const TestsTake = () => {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()

  const { data: test, isLoading } = GetById(
    testId!,
    cookies.accessToken,
    QueryPATH.tests,
    "/tests"
  )

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const violationSent = useRef(false)
  const submittedRef = useRef(false)


  const sendViolation = async (reason: string, shouldNavigate = true) => {
    if (violationSent.current || submittedRef.current || result) return
    violationSent.current = true

    try {
      await instance(cookies.accessToken).post(`/tests/${testId}/violation`, { reason })
      toast.error("Test qoidasi buzildi. Natija 0 qilindi.")
      if (shouldNavigate) navigate("/tests", { replace: true })
    } catch {
      if (shouldNavigate) navigate("/tests", { replace: true })
    }
  }

  useEffect(() => {
    if (!testId || !cookies.accessToken || !test?.id) return

    const start = async () => {
      try {
        const res = await instance(cookies.accessToken).post(`/tests/${testId}/start`)
        const data = res.data?.data
        setStartedAt(data?.startedAt ? new Date(data.startedAt) : new Date())
        setDurationMinutes(data?.durationMinutes ?? null)
      } catch (err: any) {
        const message = err?.response?.data?.message ?? "Testni boshlashda xatolik"
        setStartError(Array.isArray(message) ? message[0] : message)
        toast.error(Array.isArray(message) ? message[0] : message)
      }
    }

    start()
  }, [testId, cookies.accessToken, test?.id])

  useEffect(() => {
    if (!startedAt || !durationMinutes) return

    const tick = () => {
      const deadline = startedAt.getTime() + durationMinutes * 60 * 1000
      const left = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      setRemainingSeconds(left)

      if (left <= 0) {
        sendViolation("TIME_EXPIRED")
      }
    }

    tick()
    const interval = setInterval(tick, 1000)

    return () => clearInterval(interval)
  }, [startedAt, durationMinutes])

  useEffect(() => {
    const prevent = (e: Event) => {
      e.preventDefault()
      return false
    }

    const keydown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "a", "s", "p"].includes(key)) {
        e.preventDefault()
      }
    }

    const visibility = () => {
      if (document.hidden) {
        sendViolation("PAGE_HIDDEN_OR_TAB_CHANGED")
      }
    }

    const blur = () => {
      sendViolation("WINDOW_BLUR_OR_OTHER_PAGE_OPENED")
    }

    const beforeUnload = () => {
      if (!violationSent.current && !submittedRef.current && !result) {
        violationSent.current = true

        try {
          fetch(`/api/tests/${testId}/violation`, {
            method: "POST",
            keepalive: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies.accessToken}`,
            },
            body: JSON.stringify({ reason: "PAGE_CLOSED" }),
          })
        } catch {}
      }
    }

    document.addEventListener("copy", prevent)
    document.addEventListener("paste", prevent)
    document.addEventListener("cut", prevent)
    document.addEventListener("contextmenu", prevent)
    document.addEventListener("keydown", keydown)
    document.addEventListener("visibilitychange", visibility)
    window.addEventListener("blur", blur)
    window.addEventListener("beforeunload", beforeUnload)

    document.body.style.userSelect = "none"

    return () => {
      // React ichida boshqa sahifaga o'tsa ham violation bo'lsin:
      // /tests/:id/take -> /attendance yoki /profile kabi SPA navigation.
      if (!violationSent.current && !submittedRef.current && !result) {
        violationSent.current = true

        try {
          fetch(`/api/tests/${testId}/violation`, {
            method: "POST",
            keepalive: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies.accessToken}`,
            },
            body: JSON.stringify({ reason: "ROUTE_CHANGED_OR_LEFT_TEST" }),
          })
        } catch {}
      }

      document.removeEventListener("copy", prevent)
      document.removeEventListener("paste", prevent)
      document.removeEventListener("cut", prevent)
      document.removeEventListener("contextmenu", prevent)
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("blur", blur)
      window.removeEventListener("beforeunload", beforeUnload)
      document.body.style.userSelect = ""
    }
  }, [testId, result])

  const handleAnswerChange = (questionId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Hech bo'lmaganda bitta savolga javob bering!")
      return
    }

    submittedRef.current = true
    setSubmitting(true)

    try {
      const res = await instance(cookies.accessToken).post("/tests/submit", {
        testId: Number(testId),
        answers,
      })

      const data = res.data?.data
      setResult({ score: data.score, passed: data.passed })
      queryClient.invalidateQueries({ queryKey: [QueryPATH.tests] })
    } catch (err: any) {
      submittedRef.current = false
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "Cheklanmagan"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="tests-take-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <Spin size="large" tip="Test yuklanmoqda..." />
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <StatusScreen
        icon={<FileTextOutlined />}
        iconBg="linear-gradient(135deg, #fee2e2, #fecaca)"
        iconColor="#dc2626"
        title="Test topilmadi"
        message="Siz qidirayotgan test mavjud emas yoki o'chirilgan bo'lishi mumkin."
        actionText="Testlarga qaytish"
        onAction={() => navigate("/tests", { replace: true })}
      />
    )
  }

  if (startError) {
    return (
      <StatusScreen
        icon={<LockOutlined />}
        iconBg="linear-gradient(135deg, #fee2e2, #fecaca)"
        iconColor="#dc2626"
        title="Testga kirish mumkin emas"
        message={startError}
        note="Agar testni qayta ishlash kerak bo‘lsa, ustozingizdan ruxsat so‘rang."
        actionText="Testlarga qaytish"
        onAction={() => navigate("/tests", { replace: true })}
      />
    )
  }

  const now = new Date()
  const startsAt = test.startsAt ? new Date(test.startsAt) : null
  const endsAt = test.endsAt ? new Date(test.endsAt) : null

  if (test.status !== "ACTIVE") {
    return (
      <StatusScreen
        icon={<LockOutlined />}
        iconBg="linear-gradient(135deg, #fee2e2, #fecaca)"
        iconColor="#dc2626"
        title="Bu test faol emas"
        message="Ustozingiz bu testni vaqtincha faolsizlantirgan. Faollashtirilganda qayta urinib ko'ring."
        actionText="Testlarga qaytish"
        onAction={() => navigate("/tests", { replace: true })}
      />
    )
  }

  if (startsAt && now < startsAt) {
    return (
      <StatusScreen
        icon={<ClockCircleOutlined />}
        iconBg="linear-gradient(135deg, #fef3c7, #fde68a)"
        iconColor="#d97706"
        title="Test hali boshlanmagan"
        message={`Boshlanish vaqti: ${startsAt.toLocaleString("uz-UZ")}`}
        actionText="Testlarga qaytish"
        onAction={() => navigate("/tests", { replace: true })}
      />
    )
  }

  if (endsAt && now > endsAt) {
    return (
      <StatusScreen
        icon={<LockOutlined />}
        iconBg="linear-gradient(135deg, #fee2e2, #fecaca)"
        iconColor="#dc2626"
        title="Test vaqti tugagan"
        message={`Tugash vaqti: ${endsAt.toLocaleString("uz-UZ")}`}
        actionText="Testlarga qaytish"
        onAction={() => navigate("/tests", { replace: true })}
      />
    )
  }

  const questions = test.questions ?? []
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length

  if (result) {
    return (
      <div className="tests-take-page mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <Card style={{ textAlign: "center", borderRadius: 18 }}>
          {result.passed ? (
            <CheckCircleFilled style={{ fontSize: 64, color: "#16a34a" }} />
          ) : (
            <CloseCircleFilled style={{ fontSize: 64, color: "#dc2626" }} />
          )}

          <Title level={2} style={{ marginTop: 16 }}>
            {result.passed ? "Tabriklaymiz!" : "Afsus!"}
          </Title>

          <Progress
            type="circle"
            percent={result.score}
            strokeColor={result.passed ? "#16a34a" : "#dc2626"}
            format={() => `${result.score}%`}
          />

          <div style={{ marginTop: 24 }}>
            <Button
              size="large"
              onClick={() => navigate("/tests")}
              style={{
                height: 44,
                borderRadius: 12,
                paddingInline: 26,
                background: "linear-gradient(135deg, #8f5c28, #c8864a)",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                boxShadow: "0 8px 22px rgba(143, 92, 40, 0.28)",
              }}
            >
              Testlarga qaytish
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="tests-take-page mx-auto max-w-5xl p-4 sm:p-5 lg:p-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/tests")}
          style={{
            height: 42,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #8f5c28, #a36532)",
            color: "#fff",
            fontWeight: 800,
            boxShadow: "0 10px 24px rgba(143,92,40,0.24)",
          }}
        >
          Orqaga
        </Button>

        <Tag
          color={remainingSeconds !== null && remainingSeconds < 300 ? "red" : "orange"}
          style={{
            borderRadius: 10,
            padding: "5px 12px",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          ⏱ {formatTime(remainingSeconds)}
        </Tag>
      </div>

      <Card className="tests-take-info-card" style={{ borderRadius: 18, marginBottom: 20 }}>
        <Space direction="vertical" size={8}>
          <Text style={{ color: "#6b5742", fontWeight: 700 }}>Test</Text>
          <Title level={2} style={{ margin: 0, color: "#1a1a1a", fontWeight: 800 }}>{test.title}</Title>
          <Text style={{ color: "#1a1a1a", fontWeight: 600 }}>Minimal ball: {test.minScore ?? 60}</Text>
          <Text style={{ color: "#1a1a1a", fontWeight: 600 }}>Savollar: {totalQuestions} ta</Text>
          <Progress percent={Math.round((answeredCount / Math.max(totalQuestions, 1)) * 100)} />
        </Space>
      </Card>

      {questions.map((q: any, index: number) => (
        <Card key={q.id} className="tests-take-question-card" style={{ borderRadius: 16, marginBottom: 16 }}>
          <Title level={5} style={{ color: "#1a1a1a", fontWeight: 800, marginBottom: 14 }}>
            {index + 1}. {q.text}
          </Title>
          <Radio.Group
            value={answers[q.id]}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {q.choices?.map((choice: any) => (
                <Radio key={choice.id} value={choice.id}>
                  <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{choice.text}</span>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>
      ))}

      <Button
        type="primary"
        size="large"
        block
        loading={submitting}
        icon={<SendOutlined />}
        onClick={handleSubmit}
        style={{
          height: 50,
          borderRadius: 12,
          background: "linear-gradient(135deg, #8f5c28, #b8782a)",
          border: "none",
          fontWeight: 700,
          color: "#fff",
        }}
      >
        Testni yakunlash
      </Button>
    </div>
  )
}

export default TestsTake
