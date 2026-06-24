import { Input } from "antd"
import { SearchOutlined, TeamOutlined } from "@ant-design/icons"
import { Caption, CustomSelect, CustomTable, QueryPATH } from "../../../components"
import { useState, type FC } from "react"
import { GetAll } from "../../../service"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { debounce } from "../../../hooks"
import { useCurrentUser } from "../../../hooks/useCurrentUser"

const INPUT_STYLE: React.CSSProperties = {
  borderRadius: 9, borderColor: '#e5d8cc', background: '#fff', fontSize: 13.5,
}

interface StudentType {
  groupPropId?: number | null
  teacherPropId?: number | null
}

const Students: FC<StudentType> = ({ groupPropId, teacherPropId }) => {
  const [cookies] = useCookies(["accessToken"])
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const isTeacher = currentUser?.role === "TEACHER"
  const isSupport = currentUser?.role === "SUPPORT"
  const isAdmin = ['SUPERADMIN', 'ADMIN'].includes(currentUser?.role ?? '')

  const columns = [
    { title: "ID", dataIndex: "key", width: 60 },
    { title: "To'liq ismi", dataIndex: "fullName" },
    { title: "Telefon", dataIndex: "phone" },
    { title: "Guruh", dataIndex: "groupName" },
    !isTeacher && !isSupport && { title: "Ustoz", dataIndex: "teacherName" },
    {
      title: "Holat", dataIndex: "isActive",
      render: (v: boolean) => (
        <span style={{ color: v ? "#16a34a" : "#dc2626", fontWeight: 600, fontSize: 13 }}>
          {v ? "Faol" : "Nofaol"}
        </span>
      ),
    },
    !isSupport && { title: "Batafsil", dataIndex: "action", align: "center" as const, width: 100 },
  ].filter(Boolean)

  function returnFn(value: any) {
    return {
      ...value,
      key: value.id,
      fullName: value.user?.fullName ?? "➖",
      phone: value.user?.phone ?? "➖",
      isActive: value.user?.isActive ?? false,
      groupName: value.group?.name ?? "➖",
      teacherName: value.group?.teacher?.fullName ?? "➖",
      _groupId: value.group?.id ?? null,
      _teacherId: value.group?.teacherId ?? null,
      _supportId: value.group?.supportId ?? null,
    }
  }

  const [search, setSearch] = useState("")
  const debouncedSearch = debounce(search, 800)
  const [groupId, setGroupId] = useState<number | null>(groupPropId ?? null)
  const [teacherId, setTeacherId] = useState<number | null>(
    isTeacher ? currentUser?.id : (teacherPropId ?? null)
  )

  const { data: allStudents = [], isPending } = GetAll(
    QueryPATH.students, [], cookies.accessToken, "/students", {}, navigate, returnFn
  )

  const students = allStudents
    .filter((s: any) => {
      const matchName = !debouncedSearch || s.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchGroup = !groupId || s._groupId === groupId
      const matchTeacher = isTeacher
        ? s._teacherId === Number(currentUser?.id)
        : (!teacherId || s._teacherId === teacherId)
      const matchSupport = isSupport ? s._supportId === Number(currentUser?.id) : true
      return matchName && matchGroup && matchTeacher && matchSupport
    })
    .map((s: any, index: number) => ({ ...s, key: index + 1 }))

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <Caption count={students.length} title="O'quvchilar" icon={<TeamOutlined />} hideCreate={!isAdmin} />

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#c8864a' }} />}
          size="large" allowClear placeholder="Ism bo'yicha qidirish..."
          className="w-full max-w-full rounded-xl border-[#e5d8cc] bg-white text-[13.5px] md:max-w-[300px]"
        />

        {!isTeacher && !isSupport && (
          <>
            <CustomSelect
              disabled={!!groupPropId}
              placeholder="Guruh tanlang"
              URL="/groups"
              queryKey={QueryPATH.groups}
              setValue={(v: any) => {
                setGroupId(v ? Number(v) : null)
                if (!teacherPropId) setTeacherId(null)
              }}
              value={groupId}
            />
            <CustomSelect
              disabled={!!teacherPropId}
              placeholder="Ustoz tanlang"
              URL="/teachers"
              queryKey={QueryPATH.teachers}
              setValue={(v: any) => setTeacherId(v ? Number(v) : null)}
              value={teacherId}
            />
          </>
        )}

        {isSupport && (
          <CustomSelect
            disabled={!!groupPropId}
            placeholder="Guruh tanlang"
            URL="/groups"
            queryKey={QueryPATH.groups}
            setValue={(v: any) => setGroupId(v ? Number(v) : null)}
            value={groupId}
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <CustomTable loading={isPending} columns={columns} data={students} />
      </div>
    </div>
  )
}

export default Students