import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetById, Update } from "../../../service"
import { Button, Input } from "antd"
import { ArrowLeftOutlined, SaveOutlined, BankOutlined, EnvironmentOutlined, PhoneOutlined } from "@ant-design/icons"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const C = {
  accent: '#8f5c28',
  accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
  accentBg: 'linear-gradient(135deg, #f5ece3 0%, #fdf9f6 100%)',
  accentBorder: '#f0e8df',
  inputStyle: { borderRadius: 9, borderColor: '#e5d8cc', background: '#fdfaf7', minHeight: 44 } as React.CSSProperties,
}

const Field = ({ label, hint, required, children }: {
  label: React.ReactNode, hint?: string, required?: boolean, children: React.ReactNode
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, letterSpacing: '0.4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
      {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
    </span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: '#999' }}>{hint}</span>}
  </div>
)

const QueryBranches = "branches"
const QueryBranchesMore = "branches-more"

const BranchesCrud = () => {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(['accessToken'])
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")

  // Faqat SUPERADMIN va ADMIN bu sahifaga kira oladi
  useEffect(() => {
    const allowedRoles = ["SUPERADMIN", "ADMIN"]
    if (currentUser && !allowedRoles.includes(currentUser.role)) navigate(-1)
  }, [currentUser, navigate])

  const { mutate: BranchCreate, isPending: createLoading } = Create(
    cookies.accessToken, "/branches", navigate, queryClient, QueryBranches
  )
  const { mutate: BranchUpdate, isPending: updateLoading } = Update(
    cookies.accessToken, `/branches/${branchId}`, navigate, queryClient, QueryBranchesMore, QueryBranches
  )

  const { data: moreInfo = {} } = branchId
    ? GetById(branchId, cookies.accessToken, QueryBranchesMore, "/branches")
    : { data: {} }

  useEffect(() => {
    if (branchId && moreInfo?.id) {
      setName(moreInfo.name ?? "")
      setAddress(moreInfo.address ?? "")
      setPhone(moreInfo.phone ?? "")
    }
  }, [branchId, moreInfo])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data: any = { name }
    if (address.trim()) data.address = address.trim()
    if (phone.trim()) data.phone = phone.trim()
    branchId ? BranchUpdate(data) : BranchCreate(data)
  }

  const isUpdate = Boolean(branchId)
  const isLoading = isUpdate ? updateLoading : createLoading

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px', maxWidth: 700, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 8, borderColor: '#d6c4b0', color: C.accent, height: 36, display: 'flex', alignItems: 'center', gap: 4 }}>
          Orqaga
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
            {isUpdate ? <SaveOutlined /> : <BankOutlined />}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {isUpdate ? "Filialni tahrirlash" : "Yangi filial qo'shish"}
          </h1>
        </div>
        <Button loading={isLoading} htmlType="submit" size="large"
          style={{ background: C.accentGradient, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13.5, height: 40, paddingInline: 22, boxShadow: '0 2px 8px rgba(143,92,40,0.25)' }}>
          {isUpdate ? "Yangilash" : "Saqlash"}
        </Button>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.accentBorder}`, background: C.accentBg }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.accent }}>Filial ma'lumotlari</div>
          <div style={{ fontSize: 12.5, color: '#999', marginTop: 3 }}>
            <span style={{ color: '#ef4444' }}>*</span> belgili maydonlar majburiy
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label={<><BankOutlined /> Filial nomi</>} required>
            <Input value={name} onChange={e => setName(e.target.value)} size="large"
              placeholder="Chilonzor filiali" style={C.inputStyle} required />
          </Field>
          <Field label={<><EnvironmentOutlined /> Manzil</>} hint="Ixtiyoriy">
            <Input value={address} onChange={e => setAddress(e.target.value)} size="large"
              placeholder="Chilonzor tumani, 7-mavze, 15-uy" style={C.inputStyle} />
          </Field>
          <Field label={<><PhoneOutlined /> Telefon</>} hint="Ixtiyoriy — Format: +998711234567">
            <Input value={phone} onChange={e => setPhone(e.target.value)} size="large"
              placeholder="+998711234567" style={C.inputStyle} />
          </Field>
        </div>
      </div>
    </form>
  )
}

export default BranchesCrud
