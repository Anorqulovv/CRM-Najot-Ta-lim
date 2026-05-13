import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetById, Update } from "../../../service"
import { CustomSelect, QueryPATH } from "../../../components"
import { Button, Input } from "antd"
import {
  ArrowLeftOutlined, SaveOutlined, UserOutlined, PhoneOutlined,
  LockOutlined, IdcardOutlined, TeamOutlined, MessageOutlined, UserAddOutlined,
} from "@ant-design/icons"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const C = {
  accent: '#8f5c28',
  accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
  accentBg: 'linear-gradient(135deg, #f5ece3 0%, #fdf9f6 100%)',
  accentBorder: '#f0e8df',
  inputStyle: { borderRadius: 9, borderColor: '#e5d8cc', background: '#fdfaf7', minHeight: 44 } as React.CSSProperties,
}

const Field = ({ label, hint, required, fullWidth, children }: {
  label: React.ReactNode, hint?: string, required?: boolean, fullWidth?: boolean, children: React.ReactNode
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, letterSpacing: '0.4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
      {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
    </span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: '#999' }}>{hint}</span>}
  </div>
)

const SectionCard = ({ title, subtitle, children }: {
  title: React.ReactNode, subtitle?: string, children: React.ReactNode
}) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
    <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.accentBorder}`, background: C.accentBg }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: C.accent }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12.5, color: '#999', marginTop: 3 }}>{subtitle}</div>}
    </div>
    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
      {children}
    </div>
  </div>
)

const StudentsCrud = () => {
  const currentUser = useCurrentUser()
  const isTeacher = currentUser?.role === "TEACHER"
  const isSupport = currentUser?.role === "SUPPORT"
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")
  const isReadOnly = !isAdmin

  const { studentId, groupId: groupPathId } = useParams<{ studentId?: string, groupId?: string }>()
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [telegramId, setTelegramId] = useState("")
  const [groupId, setGroupId] = useState<number | null>(groupPathId ? Number(groupPathId) : null)
  const [directionId, setDirectionId] = useState<number | null>(null)
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [cardId, setCardId] = useState("")
  const [branchId, setBranchId] = useState<number | null>(null)
  const [parentFullName, setParentFullName] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [parentPhone2, setParentPhone2] = useState("")
  const [parentTelegramId, setParentTelegramId] = useState("")
  const [parentUsername, setParentUsername] = useState("")
  const [parentPassword, setParentPassword] = useState("")
  const [hasParent, setHasParent] = useState(false)

  const { mutate: StudentCreate, isPending: createLoading } = Create(cookies.accessToken, "/students", navigate, queryClient, QueryPATH.students)
  const { mutate: StudentUpdate, isPending: updateLoading } = Update(cookies.accessToken, `/students/${studentId}`, navigate, queryClient, QueryPATH.studentsMore, QueryPATH.students)

  const { data: myTeacherInfo = {} } = GetById(isTeacher ? String(currentUser?.id) : undefined, cookies.accessToken, QueryPATH.teachersMore, "/teachers")
  const { data: moreInfo = {} } = studentId ? GetById(studentId, cookies.accessToken, QueryPATH.studentsMore, "/students") : { data: {} }

  useEffect(() => {
    if (isTeacher && myTeacherInfo?.directionId) {
      setDirectionId(myTeacherInfo.directionId)
      setTeacherId(myTeacherInfo.id)
    }
  }, [myTeacherInfo, isTeacher])

  useEffect(() => {
    if (moreInfo && studentId) {
      setFullName(moreInfo.user?.fullName ?? "")
      setUsername(moreInfo.user?.username ?? "")
      setPhone(moreInfo.user?.phone ?? "")
      setTelegramId(moreInfo.user?.telegramId ?? "")
      setPassword("")
      setGroupId(moreInfo.groupId ?? null)
      setCardId(moreInfo.cardId ?? "")
      setBranchId(moreInfo.user?.branchId ?? null)
      setDirectionId(moreInfo.group?.directionId ?? null)
      setTeacherId(moreInfo.group?.teacherId ?? null)
      if (moreInfo.parent) {
        setHasParent(true)
        setParentFullName(moreInfo.parent?.user?.fullName ?? "")
        setParentPhone(moreInfo.parent?.user?.phone ?? "")
        setParentPhone2(moreInfo.parent?.phone2 ?? "")
        setParentTelegramId(moreInfo.parent?.user?.telegramId ?? "")
        setParentUsername(moreInfo.parent?.user?.username ?? "")
        setParentPassword("")
      }
    }
  }, [studentId, moreInfo])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isReadOnly) return
    if (studentId) {
      const data: any = { groupId, cardId, branchId: branchId || undefined }
      if (fullName.trim()) data.fullName = fullName.trim()
      if (username.trim()) data.username = username.trim()
      if (phone.trim()) data.phone = phone.trim()
      if (telegramId.trim()) data.telegramId = telegramId.trim()
      if (password.trim()) data.password = password.trim()
      if (hasParent) {
        const parentData: any = {}
        if (parentFullName.trim()) parentData.fullName = parentFullName.trim()
        if (parentPhone.trim()) parentData.phone = parentPhone.trim()
        if (parentPhone2.trim()) parentData.phone2 = parentPhone2.trim()
        if (parentTelegramId.trim()) parentData.telegramId = parentTelegramId.trim()
        if (parentUsername.trim()) parentData.username = parentUsername.trim()
        if (parentPassword.trim()) parentData.password = parentPassword.trim()
        if (Object.keys(parentData).length > 0) data.parent = parentData
      }
      StudentUpdate(data)
    } else {
      const payload: any = {
        user: { fullName, username, phone, password, ...(telegramId.trim() ? { telegramId } : {}) },
        student: { groupId: groupId || undefined, cardId: cardId || undefined },
        branchId: branchId || undefined,
      }
      if (hasParent && parentFullName.trim() && parentPhone.trim()) {
        payload.parent = {
          fullName: parentFullName.trim(), phone: parentPhone.trim(),
          ...(parentPhone2.trim() ? { phone2: parentPhone2.trim() } : {}),
          username: parentUsername.trim() || undefined, password: parentPassword.trim() || undefined,
          ...(parentTelegramId.trim() ? { telegramId: parentTelegramId.trim() } : {}),
        }
      }
      StudentCreate(payload)
    }
  }

  const isUpdate = Boolean(studentId)
  const isLoading = isUpdate ? updateLoading : createLoading
  const isDirectionDisabled = !!groupPathId || isTeacher || isReadOnly
  const isTeacherDisabled = !!groupPathId || isTeacher || !directionId || isReadOnly
  const isGroupDisabled = !!groupPathId || isReadOnly

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 8, borderColor: '#d6c4b0', color: C.accent, height: 36, display: 'flex', alignItems: 'center', gap: 4 }}>
          Orqaga
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15 }}>
            {isUpdate ? <SaveOutlined /> : <UserOutlined />}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {isUpdate ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}
          </h1>
        </div>
        {!isReadOnly && (
          <Button loading={isLoading} htmlType="submit" size="large"
            style={{ background: C.accentGradient, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13.5, height: 40, paddingInline: 22, boxShadow: '0 2px 8px rgba(143,92,40,0.25)' }}>
            {isUpdate ? "Yangilash" : "Saqlash"}
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* 1. Shaxsiy ma'lumotlar */}
        <SectionCard title="Shaxsiy ma'lumotlar"
          subtitle={isReadOnly ? "Siz faqat ko'rish huquqiga egasiz" : isUpdate ? "O'zgartirmoqchi bo'lgan maydonlarni to'ldiring" : "* belgili maydonlar majburiy"}>
          <Field label={<><UserOutlined /> To'liq ism</>} required={!isUpdate && !isReadOnly}>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isReadOnly} size="large" placeholder="Ali Karimov" style={C.inputStyle} required={!isUpdate && !isReadOnly} />
          </Field>
          <Field label={<><IdcardOutlined /> Username</>} hint={isReadOnly ? undefined : "Harf, raqam, nuqta, _ va -"} required={!isUpdate && !isReadOnly}>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} disabled={isReadOnly} size="large" placeholder="ali_karimov" style={C.inputStyle} required={!isUpdate && !isReadOnly} />
          </Field>
          <Field label={<><PhoneOutlined /> Telefon raqami</>} hint={isReadOnly ? undefined : "Format: +998901234567"} required={!isUpdate && !isReadOnly}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isReadOnly} size="large" placeholder="+998901234567" style={C.inputStyle} required={!isUpdate && !isReadOnly} />
          </Field>
          {!isReadOnly && (
            <Field label={<><LockOutlined /> Parol</>} hint={isUpdate ? "Bo'sh qoldirilsa o'zgarmaydi" : "Kamida 6 ta belgi"} required={!isUpdate}>
              <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} size="large" placeholder={isUpdate ? "Yangi parol (ixtiyoriy)" : "••••••••"} style={C.inputStyle} required={!isUpdate} />
            </Field>
          )}
          <Field label={<><MessageOutlined /> Telegram ID</>} hint={isReadOnly ? undefined : "Ixtiyoriy"}>
            <Input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} disabled={isReadOnly} size="large" placeholder="123456789" style={C.inputStyle} />
          </Field>
        </SectionCard>

        {/* 2. O'quvchi ma'lumotlari */}
        <SectionCard title="O'quvchi ma'lumotlari" subtitle={isReadOnly ? "Faqat ko'rish huquqi" : "Guruh va karta ID si ixtiyoriy"}>
          <Field label={<><IdcardOutlined /> Yo'nalish</>} hint={isReadOnly ? "Faqat ko'rish" : isTeacher ? "Sizning yo'nalishingiz" : groupPathId ? "Tashqaridan berilgan" : "Avval yo'nalish tanlang"}>
            <CustomSelect disabled={isDirectionDisabled} URL="/directions" placeholder="Yo'nalish tanlang"
              queryKey={QueryPATH.directions}
              setValue={(val: any) => {
                setDirectionId(val ? Number(val) : null)
                if (!isTeacher && !isReadOnly) { setTeacherId(null); setGroupId(null) }
              }}
              value={directionId} />
          </Field>
          <Field label={<><UserOutlined /> Ustoz</>} hint={isReadOnly ? "Faqat ko'rish" : isTeacher ? "Siz ustoz sifatida" : directionId ? "Yo'nalishdagi ustozlar" : "Avval yo'nalish tanlang"}>
            <CustomSelect disabled={isTeacherDisabled} URL="/teachers" placeholder="Ustoz tanlang"
              queryKey={QueryPATH.teachers} setValue={(val: any) => setTeacherId(val ? Number(val) : null)}
              value={teacherId} params={directionId ? { directionId } : {}} />
          </Field>
          <Field label={<><TeamOutlined /> Guruh</>} hint={isReadOnly ? "Faqat ko'rish" : groupPathId ? "Tashqaridan berilgan" : directionId ? "Yo'nalishdagi guruhlar" : "Avval yo'nalish tanlang"}>
            <CustomSelect disabled={isGroupDisabled} URL="/groups" placeholder="Guruh tanlang"
              queryKey={QueryPATH.groups} setValue={(val: any) => setGroupId(val ? Number(val) : null)}
              value={groupId} params={isTeacher && teacherId ? { teacherId } : directionId ? { directionId } : {}} />
          </Field>
          <Field label={<><IdcardOutlined /> Karta ID</>} hint={isReadOnly ? undefined : "Ixtiyoriy"}>
            <Input value={cardId} onChange={(e) => setCardId(e.target.value)} disabled={isReadOnly} size="large" placeholder="CARD001" style={C.inputStyle} />
          </Field>
          <Field label={<>🏦 Filial</>} hint={isReadOnly ? undefined : "Ixtiyoriy"}>
            <CustomSelect disabled={isReadOnly} URL="/branches" placeholder="Filial tanlang"
              queryKey={QueryPATH.branches}
              setValue={(val: any) => setBranchId(val ? Number(val) : null)}
              value={branchId} />
          </Field>
        </SectionCard>

        {/* 3. Ota-ona */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.accentBorder}`, background: C.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.accent, display: 'flex', alignItems: 'center', gap: 7 }}>
                <UserAddOutlined /> Ota-ona ma'lumotlari
              </div>
              <div style={{ fontSize: 12.5, color: '#999', marginTop: 3 }}>
                {isReadOnly ? "Faqat ko'rish huquqi" : isUpdate && moreInfo?.parent ? "Mavjud ma'lumotlarni yangilang" : "Ixtiyoriy — telegram orqali xabarnoma"}
              </div>
            </div>
            {!isReadOnly && (
              <Button type={hasParent ? "default" : "primary"} onClick={() => setHasParent(!hasParent)}
                style={{ borderRadius: 9, background: hasParent ? '#fee2e2' : C.accentGradient, border: 'none', color: hasParent ? '#dc2626' : '#fff', fontWeight: 600 }}>
                {hasParent ? "Olib tashlash" : "Qo'shish"}
              </Button>
            )}
          </div>

          {hasParent
            ? (
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
                <Field label={<><UserOutlined /> To'liq ism</>} hint={isUpdate && !isReadOnly ? "Bo'sh qoldirilsa o'zgarmaydi" : undefined} required={!isUpdate && hasParent && !moreInfo?.parent && !isReadOnly}>
                  <Input value={parentFullName} onChange={(e) => setParentFullName(e.target.value)} disabled={isReadOnly} size="large" placeholder="Karim Karimov" style={C.inputStyle} />
                </Field>
                <Field label={<><PhoneOutlined /> Telefon raqami</>} hint={isReadOnly ? undefined : "Format: +998901234567"} required={!isUpdate && hasParent && !moreInfo?.parent && !isReadOnly}>
                  <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} disabled={isReadOnly} size="large" placeholder="+998901234567" style={C.inputStyle} />
                </Field>
                <Field label={<><PhoneOutlined /> 2-Telefon raqami</>} hint={isReadOnly ? undefined : "Ixtiyoriy — ikkinchi aloqa raqami"}>
                  <Input value={parentPhone2} onChange={(e) => setParentPhone2(e.target.value)} disabled={isReadOnly} size="large" placeholder="+998901234568" style={C.inputStyle} />
                </Field>
                <Field label={<><MessageOutlined /> Telegram ID</>} hint={isReadOnly ? undefined : "Bot orqali xabarnoma — muhim!"}>
                  <Input value={parentTelegramId} onChange={(e) => setParentTelegramId(e.target.value)} disabled={isReadOnly} size="large" placeholder="123456789" style={C.inputStyle} />
                </Field>
                <Field label={<><IdcardOutlined /> Username</>} hint={isReadOnly ? undefined : isUpdate ? "Bo'sh qoldirilsa o'zgarmaydi" : undefined}>
                  <Input value={parentUsername} onChange={(e) => setParentUsername(e.target.value)} disabled={isReadOnly} size="large" placeholder="karim_karimov" style={C.inputStyle} />
                </Field>
                {!isReadOnly && (
                  <>
                    <Field label={<><LockOutlined /> Parol</>} hint={isUpdate ? "Bo'sh qoldirilsa o'zgarmaydi" : undefined}>
                      <Input.Password value={parentPassword} onChange={(e) => setParentPassword(e.target.value)} size="large" placeholder="••••••••" style={C.inputStyle} />
                    </Field>
                    <div style={{ gridColumn: '1 / -1', padding: '12px 16px', borderRadius: 10, background: '#dbeafe', border: '1px solid #93c5fd', fontSize: 13, color: '#1d4ed8' }}>
                      💡 <strong>Telegram ID</strong> — ota-ona @userinfobot ga /start yuborsalar o'z ID larini bilib olishadi.
                    </div>
                  </>
                )}
              </div>
            )
            : (
              <div style={{ padding: '20px 24px', color: '#9c8572', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserAddOutlined />
                {isReadOnly ? "Ota-ona ma'lumotlari mavjud emas." : "Ota-ona qo'shilmagan. \"Qo'shish\" tugmasini bosing."}
              </div>
            )
          }
        </div>
      </div>
    </form>
  )
}

export default StudentsCrud