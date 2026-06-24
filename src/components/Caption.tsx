import { Button } from "antd"
import {
  PlusOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PieChartOutlined,
  TeamOutlined,
  UsergroupDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { useNavigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

const BROWN_DARK = "#7a4520"
const BROWN_LIGHT = "#c8864a"

type CaptionProps = {
  title: string
  count?: number
  subtitle?: string
  icon?: ReactNode
  hideCreate?: boolean
  createPath?: string
  createText?: string
  extraclass?: string
}

const getSidebarIconByTitle = (title: string): ReactNode | null => {
  const key = title.toLowerCase().trim()

  if (key.includes("yo'nalish") || key.includes("yo‘nalish")) return <PieChartOutlined />
  if (key.includes("filial")) return <BankOutlined />
  if (key.includes("guruh") || key.includes("gurux")) return <BarChartOutlined />
  if (key.includes("ustoz")) return <UserOutlined />
  if (key.includes("support") || key.includes("yordamchi")) return <CustomerServiceOutlined />
  if (key.includes("o'quvchi") || key.includes("o‘quvchi")) return <UsergroupDeleteOutlined />
  if (key.includes("ota-ona") || key.includes("ota ona")) return <TeamOutlined />
  if (key.includes("test")) return <FileTextOutlined />
  if (key.includes("davomat")) return <CalendarOutlined />
  if (key.includes("bildirish")) return <BellOutlined />
  if (key.includes("faollik")) return <HistoryOutlined />
  if (key.includes("foydalanuvchi")) return <AuditOutlined />
  if (key.includes("profil")) return <UserOutlined />

  return null
}

export const Caption = ({
  title,
  count,
  subtitle,
  icon,
  hideCreate = false,
  createPath,
  createText = "Qo'shish",
}: CaptionProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const pageIcon = getSidebarIconByTitle(title) ?? icon ?? <AppstoreOutlined />

  const handleCreate = () => {
    navigate(createPath ?? `${location.pathname}/create`)
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className="caption-icon-box flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[22px] text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${BROWN_DARK}, ${BROWN_LIGHT})`,
            boxShadow: "0 10px 24px rgba(143,92,40,0.28)",
            color: "#ffffff",
          }}
        >
          {pageIcon}
        </div>

        <div>
          <h1
            className="m-0 text-2xl font-extrabold leading-tight sm:text-[26px]"
            style={{
              color: "#ffffff",
              textShadow: "0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {title}
          </h1>

          <p
            className="m-0 mt-1 text-[13px] font-semibold"
            style={{
              color: "rgba(255,255,255,0.78)",
              textShadow: "0 2px 8px rgba(0,0,0,0.45)",
            }}
          >
            {subtitle ?? (typeof count === "number" ? `Jami ${count} ta` : "")}
          </p>
        </div>
      </div>

      {!hideCreate && (
        <Button
          onClick={handleCreate}
          size="large"
          icon={<PlusOutlined />}
          style={{
            height: 44,
            borderRadius: 14,
            border: "none",
            background: `linear-gradient(135deg, ${BROWN_DARK}, ${BROWN_LIGHT})`,
            color: "#fff",
            fontWeight: 800,
            boxShadow: "0 10px 24px rgba(143,92,40,0.25)",
            paddingInline: 22,
          }}
        >
          {createText}
        </Button>
      )}
    </div>
  )
}

export default Caption
