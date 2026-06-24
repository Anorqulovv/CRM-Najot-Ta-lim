import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetById, Update } from "../../../service"
import { Button, Input } from "antd"
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons"
import { useCurrentUser } from "../../../hooks/useCurrentUser"
import { ensureUzPhonePrefix } from "../../../utils/phone"

const QueryBranches = "branches"
const QueryBranchesMore = "branches-more"

const BROWN = "#8f5c28"

const primaryButtonStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "none",
  background: `linear-gradient(135deg, ${BROWN}, #a36532)`,
  color: "#fff",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(143,92,40,0.26)",
}

const Field = ({
  label,
  hint,
  required,
  children,
}: {
  label: React.ReactNode
  hint?: string
  required?: boolean
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8f5c28]">
      {label}
      {required && <span className="text-[#ef4444]">*</span>}
    </span>

    {children}

    {hint && <span className="text-[11.5px] text-[#999]">{hint}</span>}
  </div>
)

const BranchesCrud = () => {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("+998")

  const isUpdate = Boolean(branchId)
  const canManage = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")

  useEffect(() => {
    if (currentUser && !canManage) navigate(-1)
  }, [currentUser, canManage, navigate])

  const { mutate: BranchCreate, isPending: createLoading } = Create(
    cookies.accessToken,
    "/branches",
    navigate,
    queryClient,
    QueryBranches
  )

  const { mutate: BranchUpdate, isPending: updateLoading } = Update(
    cookies.accessToken,
    `/branches/${branchId}`,
    navigate,
    queryClient,
    QueryBranchesMore,
    QueryBranches
  )

  const { data: moreInfo = {} } = branchId
    ? GetById(branchId, cookies.accessToken, QueryBranchesMore, "/branches")
    : { data: {} }

  useEffect(() => {
    if (branchId && moreInfo?.id) {
      setName(moreInfo.name ?? "")
      setAddress(moreInfo.address ?? "")
      setPhone(moreInfo.phone ?? "+998")
    }
  }, [branchId, moreInfo])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const payload: any = {
      name: name.trim(),
    }

    if (address.trim()) payload.address = address.trim()
    if (phone.trim() && phone.trim() !== "+998") payload.phone = phone.trim()

    branchId ? BranchUpdate(payload) : BranchCreate(payload)
  }

  const isLoading = isUpdate ? updateLoading : createLoading

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl p-4 sm:p-5 lg:p-6">
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
            {isUpdate ? "Filialni tahrirlash" : "Yangi filial qo‘shish"}
          </h1>
        </div>

        <div className="flex justify-start sm:justify-end">
          <Button
            loading={isLoading}
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            className="w-full sm:w-fit"
            style={primaryButtonStyle}
          >
            {isUpdate ? "Yangilash" : "Saqlash"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="border-b border-[#f0e8df] bg-gradient-to-br from-[#f5ece3] to-[#fdf9f6] px-5 py-4">
          <div className="font-bold text-[#8f5c28]">Filial ma’lumotlari</div>
          <div className="mt-1 text-[12.5px] text-[#999]">
            <span className="text-[#ef4444]">*</span> belgili maydonlar majburiy
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <Field label={<><BankOutlined /> Filial nomi</>} required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="large"
              placeholder="Chilonzor filiali"
              className="rounded-xl border-[#e5d8cc] bg-[#fdfaf7]"
              required
            />
          </Field>

          <Field label={<><EnvironmentOutlined /> Manzil</>} hint="Ixtiyoriy">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              size="large"
              placeholder="Chilonzor tumani, 7-mavze, 15-uy"
              className="rounded-xl border-[#e5d8cc] bg-[#fdfaf7]"
            />
          </Field>

          <Field label={<><PhoneOutlined /> Telefon</>} hint="Ixtiyoriy — Format: +998901234567">
            <Input
              value={phone}
              onChange={(e) => setPhone(ensureUzPhonePrefix(e.target.value))}
              size="large"
              placeholder="+998901234567"
              className="rounded-xl border-[#e5d8cc] bg-[#fdfaf7]"
            />
          </Field>
        </div>
      </div>
    </form>
  )
}

export default BranchesCrud
