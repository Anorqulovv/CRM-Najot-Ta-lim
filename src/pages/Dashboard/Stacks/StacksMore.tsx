import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteFilled,
  EditFilled,
  FieldNumberOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
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
import { formatDateTime } from "../../../utils/formatDate"

const BROWN = "#8f5c28"
const BROWN_DARK = "#7a4520"
const BROWN_LIGHT = "#c8864a"

const primaryBtnStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "none",
  background: `linear-gradient(135deg, ${BROWN}, #a36532)`,
  color: "#fff",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(143,92,40,0.25)",
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
        color: BROWN,
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
        <p className="m-0 break-words text-[14.5px] font-bold text-[#1a1a1a]">
          {value || <span className="font-normal text-[#c7b7a7]">—</span>}
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

  const canManage = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")

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
                  Yo'nalish tafsilotlari
                </p>
              </>
            )}
          </div>
        </div>

        {canManage && (
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
              className="h-10 rounded-xl border-none font-bold shadow-md"
              style={{
                background: `linear-gradient(135deg, ${BROWN}, #a36532)`,
              }}
            >
              Tahrirlash
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white shadow-xl shadow-black/10">
          <div
            className="flex items-center gap-3 border-b px-5 py-4"
            style={{
              background: "linear-gradient(135deg, #fff7ef 0%, #f6e7d8 100%)",
              borderColor: "#ead8c7",
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
              style={{
                background: `linear-gradient(135deg, ${BROWN_DARK}, ${BROWN_LIGHT})`,
                boxShadow: "0 8px 18px rgba(143,92,40,0.24)",
              }}
            >
              <InfoCircleOutlined />
            </div>

            <div>
              <h3 className="m-0 text-[15px] font-extrabold text-[#8f5c28]">
                Asosiy ma'lumotlar
              </h3>
              <p className="m-0 mt-0.5 text-[11.5px] font-medium text-[#9c8572]">
                Yo'nalish haqida umumiy ma'lumot
              </p>
            </div>
          </div>

          <div className="px-5 pb-3 pt-2">
            <InfoRow
              icon={<FieldNumberOutlined />}
              label="ID"
              value={<Tag color="orange">#{stackId}</Tag>}
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
              label="Yaratilgan vaqt"
              value={formatDateTime(moreInfo.createdAt)}
              isLoading={isLoading}
            />

            <InfoRow
              icon={<HistoryOutlined />}
              label="O'zgartirilgan vaqt"
              value={formatDateTime(moreInfo.updatedAt)}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="direction-more-groups overflow-hidden rounded-3xl border border-white/20 bg-white shadow-xl shadow-black/10">
          <Groups
            title="Guruhlar"
            stackPropId={stackId ? Number(stackId) : null}
            basePath={`/directions/${stackId}`}
          />
        </div>
      </div>

      <Modal
        open={delModal}
        onCancel={() => setDelModal(false)}
        onOk={() => DeleteStack()}
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
          <strong className="text-[#1a1a1a]">"{moreInfo.name}"</strong> yo'nalishini
          o'chirsangiz, u bilan bog'liq ma'lumotlar ham o'chib ketishi mumkin.
        </p>
      </Modal>
    </div>
  )
}

export default StacksMore
