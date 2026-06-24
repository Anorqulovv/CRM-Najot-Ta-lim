import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Input } from "antd"
import { useEffect, useState, type SubmitEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCookies } from "react-cookie"
import { QueryPATH } from "../../../components"
import { Create, GetById, Update } from "../../../service"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const BROWN = "#8f5c28"
const BROWN_DARK = "#7a4520"
const BROWN_LIGHT = "#c8864a"

const primaryButtonStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "none",
  background: `linear-gradient(135deg, ${BROWN}, #a36532)`,
  color: "#fff",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(143,92,40,0.26)",
}

const StacksCrud = () => {
  const { id: stackId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const canManage = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")

  useEffect(() => {
    if (currentUser && !canManage) navigate(-1)
  }, [currentUser, canManage, navigate])

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

  const { data: moreInfo = {} } = stackId
    ? GetById(stackId, cookies.accessToken, QueryPATH.directionsMore, "/directions")
    : { data: {} }

  useEffect(() => {
    if (stackId && moreInfo) {
      setName(moreInfo.name ?? "")
      setDescription(moreInfo.description ?? "")
    }
  }, [moreInfo, stackId])

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const payload = {
      name: name.trim(),
      description: description.trim(),
    }

    stackId ? StackUpdate(payload) : StackCreate(payload)
  }

  const loading = stackId ? updateLoading : isPending

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl p-4 sm:p-5 lg:p-6">
      <div className="mb-6 grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
        <Button
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          size="large"
          className="w-full sm:w-fit"
          style={primaryButtonStyle}
        >
          Orqaga
        </Button>

        <div className="flex items-center justify-center">
          <h1
            className="m-0 text-center text-xl font-extrabold sm:text-[24px]"
            style={{
              color: "#ffffff",
              textShadow: "0 2px 10px rgba(0,0,0,0.55)",
            }}
          >
            Yo'nalish {stackId ? "tahrirlash" : "qo'shish"}
          </h1>
        </div>

        <div className="flex justify-start sm:justify-end">
          <Button
            loading={loading}
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            className="w-full sm:w-fit"
            style={primaryButtonStyle}
          >
            Saqlash
          </Button>
        </div>
      </div>

      <div className="mx-auto overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#f0e8df] bg-gradient-to-br from-[#f5ece3] to-[#fdf8f5] px-5 py-4">
          <div className="h-2 w-2 rounded-full bg-[#8f5c28]" />
          <span className="text-sm font-semibold text-[#8f5c28]">
            {stackId ? "Ma'lumotlarni tahrirlang" : "Yangi yo'nalish ma'lumotlarini kiriting"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:p-7">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wide text-[#8f5c28]">
              Yo'nalish nomi
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              allowClear
              size="large"
              placeholder="Masalan: Frontend dasturlash"
              className="rounded-xl border-[#e5d8cc] bg-[#fdfaf7] text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wide text-[#8f5c28]">
              Kurs haqida
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              allowClear
              size="large"
              placeholder="Qisqacha tavsif..."
              className="rounded-xl border-[#e5d8cc] bg-[#fdfaf7] text-sm"
            />
          </div>
        </div>

        <div className="border-t border-[#f0e8df] bg-[#fdfaf7] px-5 py-3 text-xs text-[#b0a090]">
          * Barcha maydonlarni to'ldiring va “Saqlash” tugmasini bosing
        </div>
      </div>
    </form>
  )
}

export default StacksCrud
