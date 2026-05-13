import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, type FormEvent } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetById, Update } from "../../../service"
import { CustomSelect, QueryPATH } from "../../../components"
import { Button, DatePicker, Input, Select, TimePicker, InputNumber } from "antd"
import {
  ArrowLeftOutlined, SaveOutlined, TeamOutlined, ApartmentOutlined,
  UserOutlined, CalendarOutlined, FlagOutlined, CustomerServiceOutlined,
  ClockCircleOutlined, ScheduleOutlined,
} from "@ant-design/icons"
import dayjs, { Dayjs } from "dayjs"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const C = {
  accent: '#8f5c28',
  accentGradient: 'linear-gradient(135deg, #7a4520, #c8864a)',
  accentBg: 'linear-gradient(135deg, #f5ece3 0%, #fdf9f6 100%)',
  accentBorder: '#f0e8df',
  inputStyle: {
    borderRadius: 9, borderColor: '#e5d8cc',
    background: '#fdfaf7', minHeight: 44,
  } as React.CSSProperties,
}

const Field = ({ label, hint, required, fullWidth, children }: {
  label: React.ReactNode, hint?: string, required?: boolean,
  fullWidth?: boolean, children: React.ReactNode
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 6,
    ...(fullWidth ? { gridColumn: '1 / -1' } : {}),
  }}>
    <span style={{
      fontSize: 12, fontWeight: 600, color: C.accent,
      letterSpacing: '0.4px', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
    </span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: '#999' }}>{hint}</span>}
  </div>
)

const statusOptions = [
  { label: "Faol", value: "ACTIVE" },
  { label: "To'xtatilgan", value: "PAUSED" },
  { label: "Tugallangan", value: "FINISHED" },
]

const GroupsCrud = () => {
  const currentUser = useCurrentUser()
  const isTeacher = currentUser?.role === "TEACHER"
  const isSupport = currentUser?.role === "SUPPORT"
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")
  const isReadOnly = !isAdmin

  const { groupId, id: stackPathId, teacherId: teacherPathId, supportId: supportPathId } =
    useParams<{ groupId?: string, id?: string, teacherId?: string, supportId?: string }>()

  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const queryClient = useQueryClient()
  const dateFormat = "YYYY-MM-DD"

  const [name, setName] = useState("")
  const [directionId, setDirectionId] = useState<number | null>(stackPathId ? Number(stackPathId) : null)
  const [teacherId, setTeacherId] = useState<number | null>(teacherPathId ? Number(teacherPathId) : null)
  const [supportId, setSupportId] = useState<number | null>(supportPathId ? Number(supportPathId) : null)
  const [branchId, setBranchId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)
  const [status, setStatus] = useState<string>("ACTIVE")
  const [lessonDays, setLessonDays] = useState<string[]>([])
  const [lessonTime, setLessonTime] = useState<string | null>(null)
  const [lessonDuration, setLessonDuration] = useState<number | null>(90)

  const { mutate: GroupCreate, isPending: createLoading } = Create(cookies.accessToken, "/groups", navigate, queryClient, QueryPATH.groups)
  const { mutate: GroupUpdate, isPending: updateLoading } = Update(cookies.accessToken, groupId ? `/groups/${groupId}` : "", navigate, queryClient, QueryPATH.groupsMore, QueryPATH.groups)

  const { data: myTeacherInfo = {} } = GetById(isTeacher ? String(currentUser?.id) : undefined, cookies.accessToken, QueryPATH.teachersMore, "/teachers")
  const { data: mySupportInfo = {} } = GetById(isSupport ? String(currentUser?.id) : undefined, cookies.accessToken, QueryPATH.supportMore, "/supports")
  const { data: teacherInfo = {} } = GetById(teacherPathId, cookies.accessToken, QueryPATH.teachersMore, "/teachers")
  const { data: supportInfo = {} } = GetById(supportPathId, cookies.accessToken, QueryPATH.supportMore, "/supports")
  const { data: moreInfo = {} } = GetById(groupId, cookies.accessToken, QueryPATH.groupsMore, "/groups")

  useEffect(() => {
    if (moreInfo && groupId) {
      setName(moreInfo.name || "")
      setDirectionId(moreInfo.directionId ?? null)
      setTeacherId(moreInfo.teacherId ?? null)
      setStartDate(moreInfo.startDate ? dayjs(moreInfo.startDate) : null)
      setEndDate(moreInfo.endDate ? dayjs(moreInfo.endDate) : null)
      setStatus(moreInfo.status || "ACTIVE")
      setSupportId(moreInfo.supportId ?? null)
      setBranchId(moreInfo.branchId ?? null)
      setLessonDays(moreInfo.lessonDays ?? [])
      setLessonTime(moreInfo.lessonTime ?? null)
      setLessonDuration(moreInfo.lessonDuration ?? 90)
    }
  }, [moreInfo, groupId])

  useEffect(() => {
    if (isTeacher && myTeacherInfo?.directionId) {
      setDirectionId(myTeacherInfo.directionId)
      setTeacherId(myTeacherInfo.id)
    }
  }, [myTeacherInfo, isTeacher])

  useEffect(() => {
    if (isSupport && mySupportInfo?.directionId) {
      setDirectionId(mySupportInfo.directionId)
      setSupportId(mySupportInfo.id)
    }
  }, [mySupportInfo, isSupport])

  useEffect(() => {
    if (teacherInfo?.directionId && teacherPathId) setDirectionId(teacherInfo.directionId)
  }, [teacherInfo, teacherPathId])

  useEffect(() => {
    if (supportInfo?.directionId && supportPathId) {
      setDirectionId(supportInfo.directionId)
      setSupportId(Number(supportPathId))
    }
  }, [supportInfo, supportPathId])

  const handleDirectionChange = (val: any) => {
    setDirectionId(val ? Number(val) : null)
    if (!teacherPathId && !isTeacher) setTeacherId(null)
    if (!supportPathId && !isSupport) setSupportId(null)
  }

  const handleTeacherChange = (val: any, option?: any) => {
    setTeacherId(val ? Number(val) : null)
    if (option?.directionId && !stackPathId && !teacherPathId) setDirectionId(option.directionId)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isReadOnly) return
    const payload = { name: name.trim(), directionId, teacherId, startDate: startDate?.format(dateFormat) ?? null, endDate: endDate?.format(dateFormat) ?? null, status, supportId, branchId: branchId || undefined, lessonDays, lessonTime, lessonDuration }
    groupId ? GroupUpdate(payload) : GroupCreate(payload)
  }

  const isUpdate = Boolean(groupId)
  const isLoading = isUpdate ? updateLoading : createLoading
  const isDirectionDisabled = !!stackPathId || !!teacherPathId || !!supportPathId || isTeacher || isSupport || isReadOnly || isReadOnly

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px 24px', maxWidth: 860, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 8, borderColor: '#d6c4b0', color: C.accent, height: 36, display: 'flex', alignItems: 'center', gap: 4 }}>
          Orqaga
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: C.accentGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15,
          }}>
            {isUpdate ? <SaveOutlined /> : <TeamOutlined />}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {isUpdate ? "Guruhni tahrirlash" : "Yangi guruh qo'shish"}
          </h1>
        </div>

        {!isReadOnly && (
          <Button loading={isLoading} htmlType="submit" size="large"
            style={{
              background: C.accentGradient, border: 'none', borderRadius: 9,
              color: '#fff', fontWeight: 600, fontSize: 13.5, height: 40,
              paddingInline: 22, boxShadow: '0 2px 8px rgba(143,92,40,0.25)',
            }}>
            {isUpdate ? "Yangilash" : "Saqlash"}
          </Button>
        )}
      </div>

      {/* Form card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.accentBorder}`, background: C.accentBg }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.accent }}>Guruh ma'lumotlari</div>
          <div style={{ fontSize: 12.5, color: '#999', marginTop: 3 }}>
            {isReadOnly ? "Siz faqat ko'rish huquqiga egasiz" : <><span style={{ color: '#ef4444' }}>*</span> belgili maydonlar majburiy</>}
          </div>
        </div>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
          {/* Guruh nomi — full width */}
          <Field label={<><TeamOutlined /> Guruh nomi</>} required={!isReadOnly} fullWidth>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              disabled={isReadOnly} size="large"
              placeholder="Masalan: Frontend 1-guruh"
              style={C.inputStyle} required={!isReadOnly} />
          </Field>

          <Field label={<><ApartmentOutlined /> Yo'nalish</>}
            hint={isTeacher || isSupport ? "Sizning yo'nalishingiz" : stackPathId ? "Tashqaridan berilgan" : "Avval yo'nalish tanlang"}
            required={!isReadOnly}>
            <CustomSelect disabled={isDirectionDisabled || isReadOnly}
              URL="/directions" placeholder="Yo'nalish tanlang"
              queryKey={QueryPATH.directions} setValue={handleDirectionChange} value={directionId} />
          </Field>

          <Field label={<><UserOutlined /> Ustoz</>}
            hint={isTeacher ? "Siz ustoz sifatida tanlangansiz" : directionId ? "Yo'nalishdagi ustozlar" : "Avval yo'nalish tanlang"}
            required={!isReadOnly}>
            <CustomSelect disabled={!!teacherPathId || !directionId || isTeacher || isReadOnly}
              URL="/teachers" placeholder="Ustoz tanlang"
              queryKey={QueryPATH.teachers} setValue={handleTeacherChange}
              value={teacherId} params={directionId ? { directionId } : {}} />
          </Field>

          <Field label={<><CustomerServiceOutlined /> Support</>}
            hint={isSupport ? "Siz support sifatida tanlangansiz" : directionId ? "Yo'nalishdagi supportlar" : "Avval yo'nalish tanlang"}>
            <CustomSelect key={`support-${directionId}`}
              disabled={!!supportPathId || isSupport || isReadOnly}
              URL="/supports" placeholder="Support tanlang"
              queryKey={QueryPATH.support} setValue={(val: any) => setSupportId(val ? Number(val) : null)}
              value={supportId} params={isSupport ? {} : directionId ? { directionId } : {}} />
          </Field>

          <Field label={<>🏦 Filial</>} hint="Guruh qaysi filialga tegishli">
            <CustomSelect disabled={isReadOnly}
              URL="/branches" placeholder="Filial tanlang"
              queryKey={QueryPATH.branches}
              setValue={(val: any) => setBranchId(val ? Number(val) : null)}
              value={branchId} />
          </Field>

          <Field label={<><CalendarOutlined /> Boshlanish sanasi</>}>
            <DatePicker value={startDate} format={dateFormat}
              onChange={(date) => setStartDate(date)} disabled={isReadOnly}
              size="large" style={{ borderRadius: 9, minHeight: 44, width: '100%' }} placeholder="Boshlanish sanasini tanlang" />
          </Field>

          <Field label={<><CalendarOutlined /> Tugash sanasi</>}>
            <DatePicker value={endDate} format={dateFormat}
              onChange={(date) => setEndDate(date)} disabled={isReadOnly}
              size="large" style={{ borderRadius: 9, minHeight: 44, width: '100%' }}
              placeholder="Tugash sanasini tanlang"
              disabledDate={(current) => startDate ? current.isBefore(startDate, "day") : false} />
          </Field>

          <Field label={<><FlagOutlined /> Holat</>} required={!isReadOnly} fullWidth>
            <Select value={status} onChange={(val) => setStatus(val)}
              disabled={isReadOnly} size="large" placeholder="Status tanlang"
              options={statusOptions} style={{ width: '100%', minHeight: 44 }} />
          </Field>

          {/* ── Dars jadvali ── */}
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f0e8df', paddingTop: 16, marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ScheduleOutlined /> Dars jadvali
            </div>
          </div>

          <Field label={<><ScheduleOutlined /> Dars kunlari</>} fullWidth
            hint="O'quvchilar dars bo'ladigan kunlarni tanlang">
            <Select
              mode="multiple"
              value={lessonDays}
              onChange={(vals) => setLessonDays(vals)}
              disabled={isReadOnly}
              size="large"
              placeholder="Kunlarni tanlang..."
              style={{ width: '100%' }}
              options={[
                { label: '🟢 Dushanba', value: 'Dushanba' },
                { label: '🟢 Seshanba', value: 'Seshanba' },
                { label: '🟢 Chorshanba', value: 'Chorshanba' },
                { label: '🟢 Payshanba', value: 'Payshanba' },
                { label: '🟢 Juma', value: 'Juma' },
                { label: '🟡 Shanba', value: 'Shanba' },
                { label: '🔴 Yakshanba', value: 'Yakshanba' },
              ]}
            />
          </Field>

          <Field label={<><ClockCircleOutlined /> Dars boshlanish vaqti</>}
            hint="Dars qaysi vaqtda boshlanadi">
            <TimePicker
              value={lessonTime ? dayjs(lessonTime, 'HH:mm') : null}
              format="HH:mm"
              onChange={(_, timeStr) => setLessonTime(timeStr as string || null)}
              disabled={isReadOnly}
              size="large"
              placeholder="Vaqtni tanlang"
              minuteStep={5}
              style={{ width: '100%', borderRadius: 9, minHeight: 44 }}
            />
          </Field>

          <Field label={<><ClockCircleOutlined /> Dars davomiyligi (daqiqa)</>}
            hint="Dars necha daqiqa davom etadi">
            <InputNumber
              value={lessonDuration}
              onChange={(val) => setLessonDuration(val)}
              disabled={isReadOnly}
              size="large"
              min={30} max={360} step={30}
              placeholder="90"
              addonAfter="daq"
              style={{ width: '100%', borderRadius: 9 }}
            />
          </Field>
        </div>

        <div style={{ padding: '12px 24px', borderTop: `1px solid ${C.accentBorder}`, background: '#fdfaf7' }}>
          <span style={{ fontSize: 12, color: '#b0a090' }}>
            * Barcha majburiy maydonlarni to'ldiring va "Saqlash" tugmasini bosing
          </span>
        </div>
      </div>
    </form>
  )
}

export default GroupsCrud