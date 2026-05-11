import { ArrowLeftOutlined, SaveOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Input } from "antd"
import { useEffect, useState, type SubmitEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCookies } from "react-cookie"
import { QueryPATH } from "../../../components"
import { Create, GetById, Update } from "../../../service"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const ACCENT = '#8f5c28'
const ACCENT_LIGHT = '#f5ece3'
const ACCENT_GRADIENT = 'linear-gradient(135deg, #7a4520, #c8864a)'

const StacksCrud = () => {
  const { id: stackId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(['accessToken'])
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const canManage = currentUser?.role === "SUPERADMIN" || currentUser?.role === "ADMIN"

  useEffect(() => {
    if (currentUser && !canManage) {
      navigate(-1)
    }
  }, [currentUser, canManage])

  const { mutate: StackCreate, isPending } = Create(
    cookies.accessToken,
    "/directions",
    navigate,
    queryClient,
    QueryPATH.directions
  )

  const { mutate: StackUpdate, isPending: updateLoading } = Update(
    cookies.accessToken,
    `/directions/${stackId}`,
    navigate,
    queryClient,
    QueryPATH.directionsMore,
    QueryPATH.directions
  )

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = { name, description }
    stackId ? StackUpdate(data) : StackCreate(data)
  }

  const { data: moreInfo = {} } = stackId
    ? GetById(stackId, cookies.accessToken, QueryPATH.directionsMore, "/directions")
    : {}

  useEffect(() => {
    if (stackId && moreInfo) {
      setName(moreInfo.name)
      setDescription(moreInfo.description)
    }
  }, [moreInfo, stackId])

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px 24px' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <Button
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          style={{
            borderRadius: 8,
            borderColor: '#d6c4b0',
            color: ACCENT,
            fontWeight: 500,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Orqaga
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: ACCENT_GRADIENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 15,
            }}
          >
            {stackId ? <SaveOutlined /> : <PlusCircleOutlined />}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Yo'nalish {stackId ? "tahrirlash" : "qo'shish"}
          </h1>
        </div>

        <Button
          loading={stackId ? updateLoading : isPending}
          htmlType="submit"
          icon={stackId ? <SaveOutlined /> : <PlusCircleOutlined />}
          size="large"
          style={{
            background: ACCENT_GRADIENT,
            border: 'none',
            borderRadius: 9,
            color: '#fff',
            fontWeight: 600,
            fontSize: 13.5,
            height: 40,
            paddingInline: 20,
            boxShadow: '0 2px 8px rgba(143,92,40,0.25)',
          }}
        >
          Saqlash
        </Button>
      </div>

      {/* Form card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid rgba(0,0,0,0.07)',
          overflow: 'hidden',
          maxWidth: 780,
          margin: '0 auto',
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f0e8df',
            background: 'linear-gradient(135deg, #f5ece3 0%, #fdf8f5 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: ACCENT,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 14, color: ACCENT }}>
            {stackId ? "Ma'lumotlarni tahrirlang" : "Yangi yo'nalish ma'lumotlarini kiriting"}
          </span>
        </div>

        {/* Fields */}
        <div
          style={{
            padding: '28px 24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
          }}
        >
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: ACCENT,
                letterSpacing: '0.4px',
                textTransform: 'uppercase' as const,
              }}
            >
              Yo'nalish nomi
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              allowClear
              size="large"
              placeholder="Masalan: Frontend dasturlash"
              style={{
                borderRadius: 9,
                borderColor: '#e5d8cc',
                fontSize: 14,
                background: '#fdfaf7',
              }}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: ACCENT,
                letterSpacing: '0.4px',
                textTransform: 'uppercase' as const,
              }}
            >
              Kurs haqida
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              allowClear
              size="large"
              placeholder="Qisqacha tavsif..."
              style={{
                borderRadius: 9,
                borderColor: '#e5d8cc',
                fontSize: 14,
                background: '#fdfaf7',
              }}
            />
          </div>
        </div>

        {/* Card footer hint */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #f0e8df',
            background: '#fdfaf7',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12, color: '#b0a090' }}>
            * Barcha maydonlarni to'ldiring va "Saqlash" tugmasini bosing
          </span>
        </div>
      </div>
    </form>
  )
}

export default StacksCrud