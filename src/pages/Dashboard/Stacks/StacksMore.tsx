import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteFilled,
  EditFilled,
  FieldNumberOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  HistoryOutlined,
} from "@ant-design/icons"
import { Button, Modal, Skeleton, Tag } from "antd"
import { useNavigate, useParams } from "react-router-dom"
import { QueryPATH } from "../../../components"
import { useCookies } from "react-cookie"
import { Delete, GetById } from "../../../service"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Groups from "../Groups/Groups"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const ACCENT = '#8f5c28'
const ACCENT_LIGHT = '#f5ece3'
const ACCENT_GRADIENT = 'linear-gradient(135deg, #7a4520, #c8864a)'

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—"
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

const InfoRow = ({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  isLoading?: boolean
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid #f5f0eb',
    }}
  >
    {/* Icon */}
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: ACCENT_LIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: ACCENT,
        flexShrink: 0,
        fontSize: 13,
        marginTop: 2,
      }}
    >
      {icon}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: 10.5,
          color: '#bbb',
          fontWeight: 600,
          margin: '0 0 3px',
          letterSpacing: '0.6px',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </p>
      {isLoading ? (
        <Skeleton.Input active size="small" style={{ width: 160 }} />
      ) : (
        <p
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0,
            wordBreak: 'break-word' as const,
          }}
        >
          {value || <span style={{ color: '#ddd', fontWeight: 400 }}>—</span>}
        </p>
      )}
    </div>
  </div>
)

const StacksMore = () => {
  const navigate = useNavigate()
  const { id: stackId } = useParams()
  const [cookies] = useCookies(["accessToken"])
  const [delModal, setDelModal] = useState(false)
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const canManage = currentUser?.role === "SUPERADMIN" || currentUser?.role === "ADMIN"

  const { data: moreInfo = {}, isLoading } = GetById(
    stackId,
    cookies.accessToken,
    QueryPATH.directionsMore,
    "/directions"
  )

  const { mutate: DeleteStack, isPending } = Delete(
    cookies.accessToken,
    `/directions/${stackId}`,
    navigate,
    queryClient,
    QueryPATH.directions
  )

  return (
    <div style={{ padding: '24px 24px' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            style={{
              borderRadius: 8,
              borderColor: '#d6c4b0',
              color: ACCENT,
              height: 36,
              display: 'flex',
              alignItems: 'center',
            }}
          />
          <div>
            {isLoading ? (
              <Skeleton.Input active style={{ width: 180, height: 28 }} />
            ) : (
              <>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1a1a1a',
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  {moreInfo.name}
                </h2>
                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>
                  Yo'nalish tafsilotlari
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {canManage && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={() => setDelModal(true)}
            danger
            type="primary"
            size="large"
            icon={<DeleteFilled />}
            style={{ borderRadius: 9, height: 40, fontWeight: 500 }}
          >
            O'chirish
          </Button>
          <Button
            onClick={() => navigate("update")}
            size="large"
            type="primary"
            icon={<EditFilled />}
            style={{
              background: ACCENT_GRADIENT,
              border: 'none',
              borderRadius: 9,
              height: 40,
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(143,92,40,0.22)',
            }}
          >
            Tahrirlash
          </Button>
        </div>
        )}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
        {/* Left: info card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: '14px 20px',
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
            <span style={{ fontWeight: 600, fontSize: 13.5, color: ACCENT }}>
              Asosiy ma'lumotlar
            </span>
          </div>

          {/* Info rows */}
          <div style={{ padding: '4px 20px 8px' }}>
            <InfoRow
              icon={<FieldNumberOutlined />}
              label="ID"
              value={<Tag color="orange" style={{ margin: 0 }}>#{stackId}</Tag>}
            />
            <InfoRow
              icon={<FontSizeOutlined />}
              label="Nomi"
              value={moreInfo.name}
              isLoading={isLoading}
            />
            <InfoRow
              icon={<FileTextOutlined />}
              label="Ma'lumot"
              value={moreInfo.description}
              isLoading={isLoading}
            />
            <InfoRow
              icon={<CalendarOutlined />}
              label="Yaratilingan vaqt"
              value={formatDate(moreInfo.createdAt)}
              isLoading={isLoading}
            />
            <div style={{ borderBottom: 'none' }}>
              <InfoRow
                icon={<HistoryOutlined />}
                label="O'zgartirilgan vaqt"
                value={formatDate(moreInfo.updatedAt)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Right: groups table */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}
        >
          <Groups
            title="Guruhlar"
            stackPropId={stackId ? Number(stackId) : null}
            basePath={`/directions/${stackId}`}
          />
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={delModal}
        onCancel={() => setDelModal(false)}
        onOk={() => DeleteStack()}
        confirmLoading={isPending}
        okText="Ha, o'chirish"
        cancelText="Bekor qilish"
        okButtonProps={{ danger: true, style: { borderRadius: 8, fontWeight: 500 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        title={
          <span style={{ fontSize: 15, fontWeight: 600, color: '#dc2626' }}>
            O'chirishni tasdiqlang
          </span>
        }
        centered
        width={380}
      >
        <p style={{ color: '#666', fontSize: 13.5, margin: '12px 0 4px', lineHeight: 1.6 }}>
          <strong style={{ color: '#1a1a1a' }}>"{moreInfo.name}"</strong> yo'nalishini
          o'chirsangiz, u bilan bog'liq ma'lumotlar ham o'chib ketishi mumkin.
        </p>
      </Modal>
    </div>
  )
}

export default StacksMore