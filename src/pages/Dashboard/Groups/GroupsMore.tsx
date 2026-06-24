import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { GetById } from "../../../service"
import { CustomTable, QueryPATH } from "../../../components"
import { Button, Modal, Skeleton, Tag } from "antd"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteFilled,
  EditFilled,
  FieldNumberOutlined,
  FlagOutlined,
  HistoryOutlined,
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  CustomerServiceOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"
import toast from "react-hot-toast"
import { useCurrentUser } from "../../../hooks/useCurrentUser"
import { instance } from "../../../hooks"
import { formatDateTime } from "../../../utils/formatDate"

const C = {
  accent: "#8f5c28",
  accentDark: "#7a4520",
  accentLight: "#c8864a",
  accentGradient: "linear-gradient(135deg, #8f5c28, #a36532)",
  accentBg: "linear-gradient(135deg, #fff7ef 0%, #f6e7d8 100%)",
  accentBorder: "#ead8c7",
}

const primaryBtnStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "none",
  background: C.accentGradient,
  color: "#fff",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(143,92,40,0.25)",
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: "green", label: "Faol" },
    PAUSED: { color: "orange", label: "To'xtatilgan" },
    FINISHED: { color: "red", label: "Tugallangan" },
  }

  const s = map[status] ?? { color: "default", label: status }
  return <Tag color={s.color}>{s.label}</Tag>
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
  <div className="flex items-start gap-3 border-b border-[#efe4d9] py-4 last:border-b-0">
    <div
      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[14px]"
      style={{
        background: "linear-gradient(135deg, #f7efe7, #fffaf5)",
        color: C.accent,
        border: "1px solid #ead8c7",
      }}
    >
      {icon}
    </div>

    <div className="min-w-0 flex-1">
      <p className="mb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#8f5c28]">
        {label}
      </p>

      {isLoading ? (
        <Skeleton.Input active size="small" className="!w-40" />
      ) : (
        <div className="break-words text-[14.5px] font-bold text-[#1a1a1a]">
          {value || <span className="font-normal text-[#c7b7a7]">—</span>}
        </div>
      )}
    </div>
  </div>
)

const GroupsMore = () => {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const [cookies] = useCookies(["accessToken"])
  const [delModal, setDelModal] = useState(false)
  const queryClient = useQueryClient()

  const currentUser = useCurrentUser()
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")
  const isReadOnly = !isAdmin
  const canAddStudent = isAdmin

  const { data: moreInfo = {}, isLoading } = GetById(
    groupId,
    cookies.accessToken,
    QueryPATH.groupsMore,
    "/groups"
  )

  const [isPending, setIsPending] = useState(false)

  const getBackPathAfterDelete = () => {
    const parts = window.location.pathname.split("/").filter(Boolean)

    if (parts[0] === "directions" && parts[1]) return `/directions/${parts[1]}`
    if (parts[0] === "teachers" && parts[1]) return `/teachers/${parts[1]}`
    if (parts[0] === "support" && parts[1]) return `/support/${parts[1]}`

    return "/groups"
  }

  const handleDeleteGroup = async () => {
    if (!groupId) return

    setIsPending(true)

    try {
      await instance(cookies.accessToken).delete(`/groups/${groupId}`)

      setDelModal(false)

      await queryClient.invalidateQueries({ queryKey: [QueryPATH.groups] })
      await queryClient.invalidateQueries({ queryKey: [QueryPATH.groupsMore] })
      await queryClient.invalidateQueries({ queryKey: [QueryPATH.directions] })
      await queryClient.invalidateQueries({ queryKey: [QueryPATH.directionsMore] })

      toast.success("Guruh o'chirildi")
      navigate(getBackPathAfterDelete(), { replace: true })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Guruhni o'chirishda xatolik")
    } finally {
      setIsPending(false)
    }
  }

  const studentColumns = [
    { title: "№", dataIndex: "order" },
    { title: "To'liq ismi", dataIndex: "fullName" },
    { title: "Telefon", dataIndex: "phone" },
    {
      title: "Holat",
      dataIndex: "isActive",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"}>{v ? "Faol" : "Nofaol"}</Tag>
      ),
    },
  ]

  const students = (moreInfo.students ?? []).map((s: any, index: number) => ({
    ...s,
    order: index + 1,
    fullName: s.user?.fullName ?? s.fullName ?? "—",
    phone: s.user?.phone ?? s.phone ?? "—",
    isActive: s.user?.isActive ?? s.isActive ?? false,
  }))

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            size="large"
            style={primaryBtnStyle}
          >
            Orqaga
          </Button>

          <div>
            {isLoading ? (
              <Skeleton.Input active className="!h-7 !w-44" />
            ) : (
              <>
                <h2
                  className="m-0 text-xl font-extrabold leading-tight"
                  style={{
                    color: "#ffffff",
                    textShadow: "0 2px 10px rgba(0,0,0,0.55)",
                  }}
                >
                  {moreInfo.name}
                </h2>

                <p
                  className="m-0 mt-1 text-xs font-semibold"
                  style={{
                    color: "rgba(255,255,255,0.76)",
                    textShadow: "0 2px 8px rgba(0,0,0,0.45)",
                  }}
                >
                  Guruh tafsilotlari
                </p>
              </>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => setDelModal(true)}
              danger
              type="primary"
              size="large"
              icon={<DeleteFilled />}
              className="h-10 rounded-xl font-bold"
            >
              O'chirish
            </Button>

            <Button
              onClick={() => navigate("update")}
              size="large"
              type="primary"
              icon={<EditFilled />}
              className="h-10 rounded-xl border-none font-bold"
              style={primaryBtnStyle}
            >
              Tahrirlash
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white shadow-xl shadow-black/10">
          <div
            className="flex flex-col items-center gap-3 border-b px-5 py-6"
            style={{
              background: C.accentBg,
              borderColor: C.accentBorder,
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-white"
              style={{
                background: `linear-gradient(135deg, ${C.accentDark}, ${C.accentLight})`,
                boxShadow: "0 10px 24px rgba(143,92,40,0.28)",
              }}
            >
              <TeamOutlined style={{ fontSize: 24 }} />
            </div>

            {isLoading ? (
              <Skeleton.Input active className="!w-40" />
            ) : (
              <div className="text-center">
                <div className="text-[16px] font-extrabold text-[#1a1a1a]">
                  {moreInfo.name}
                </div>

                {moreInfo.status && (
                  <div className="mt-2">
                    <StatusBadge status={moreInfo.status} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-5 pb-3 pt-2">
            <InfoRow
              icon={<FieldNumberOutlined />}
              label="ID"
              value={<Tag color="orange">#{groupId}</Tag>}
            />

            <InfoRow
              icon={<ApartmentOutlined />}
              label="Yo'nalish"
              value={moreInfo.direction?.name}
              isLoading={isLoading}
            />

            <InfoRow
              icon={<UserOutlined />}
              label="Ustoz"
              value={moreInfo.teacher?.fullName}
              isLoading={isLoading}
            />

            <InfoRow
              icon={<CustomerServiceOutlined />}
              label="Support"
              value={moreInfo.support?.fullName}
              isLoading={isLoading}
            />

            <InfoRow
              icon={<FlagOutlined />}
              label="Holat"
              value={moreInfo.status ? <StatusBadge status={moreInfo.status} /> : null}
              isLoading={isLoading}
            />

            <InfoRow
              icon={<CalendarOutlined />}
              label="Boshlanish"
              value={formatDateTime(moreInfo.startDate)}
              isLoading={isLoading}
            />

            <InfoRow
              icon={<HistoryOutlined />}
              label="Tugash"
              value={formatDateTime(moreInfo.endDate)}
              isLoading={isLoading}
            />

            <InfoRow
              icon={<TeamOutlined />}
              label="O'quvchilar"
              value={<Tag color="blue">{students.length} ta</Tag>}
              isLoading={isLoading}
            />

            {moreInfo.lessonDays && moreInfo.lessonDays.length > 0 && (
              <InfoRow
                icon={<ScheduleOutlined />}
                label="Dars kunlari"
                value={
                  <div className="flex flex-wrap gap-1">
                    {(moreInfo.lessonDays as string[]).map((day: string) => (
                      <Tag key={day} color="blue" className="m-0 text-[11px]">
                        {day}
                      </Tag>
                    ))}
                  </div>
                }
              />
            )}

            {moreInfo.lessonTime && (
              <InfoRow
                icon={<ClockCircleOutlined />}
                label="Dars vaqti"
                value={
                  <span className="text-[15px] font-extrabold text-[#8f5c28]">
                    🕐 {moreInfo.lessonTime}
                    {moreInfo.lessonDuration && (
                      <span className="ml-1.5 text-xs font-normal text-[#888]">
                        ({moreInfo.lessonDuration} daq)
                      </span>
                    )}
                  </span>
                }
              />
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white shadow-xl shadow-black/10">
          <div className="p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <InfoCircleOutlined style={{ color: C.accent }} />
                <span className="text-[15px] font-extrabold text-[#1a1a1a]">
                  O'quvchilar
                </span>
                <span className="ml-1 text-xs font-semibold text-[#8b7355]">
                  ({students.length} ta)
                </span>
              </div>

              {canAddStudent && (
                <Button
                  size="middle"
                  icon={<PlusOutlined />}
                  onClick={() => navigate(`/groups/${groupId}/create`)}
                  style={{
                    background: C.accentGradient,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 800,
                    boxShadow: "0 8px 18px rgba(143,92,40,0.22)",
                  }}
                >
                  O'quvchi qo'shish
                </Button>
              )}
            </div>

            <CustomTable loading={isLoading} columns={studentColumns} data={students} />
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <Modal
          open={delModal}
          onCancel={() => setDelModal(false)}
          onOk={handleDeleteGroup}
          confirmLoading={isPending}
          okText="Ha, o'chirish"
          cancelText="Bekor qilish"
          okButtonProps={{ danger: true, style: { borderRadius: 8, fontWeight: 700 } }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
          title={
            <span className="text-[15px] font-semibold text-[#dc2626]">
              O'chirishni tasdiqlang
            </span>
          }
          centered
          width={380}
        >
          <p className="my-3 text-[13.5px] leading-6 text-[#666]">
            <strong className="text-[#1a1a1a]">"{moreInfo.name}"</strong> guruhini
            o'chirsangiz, u bilan bog'liq barcha ma'lumotlar ham o'chib ketishi mumkin.
          </p>
        </Modal>
      )}
    </div>
  )
}

export default GroupsMore
