import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, type SubmitEvent } from "react"
import { useCookies } from "react-cookie"
import { useNavigate, useParams } from "react-router-dom"
import { Create, GetById, Update } from "../../../service"
import { QueryPATH } from "../../../components"
import { Button, Input } from "antd"
import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons"

const StudentsCrud = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [cookies] = useCookies(['token'])
  const queryClient = useQueryClient()

  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setlastName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  // Create Teacher
  const { mutate: StudentCreate, isPending: createLoading } = Create(cookies.token, "/students", navigate, queryClient, QueryPATH.students)

  // Update
  const { mutate: StudentUpdate, isPending: updateLoading } = Update(cookies.token, `/students/${studentId}`, navigate, queryClient, QueryPATH.studentsMore, QueryPATH.students)

  // Submit FN
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = { firstName,lastName,email,phone,password}
    console.log(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    studentId ? StudentUpdate(data) : StudentCreate(data)
  }

  // Get By Id for Update
  const { data: moreInfo = {} } = studentId ? GetById(studentId, cookies.token, QueryPATH.studentsMore, "/students") : {}
  useEffect(() => {
    if (moreInfo && studentId) {
      setFirstName(moreInfo.firstName)
      setlastName(moreInfo.lastName)
      setEmail(moreInfo.email)
      setPhone(moreInfo.phone)
      setPassword(moreInfo.password)
    }
  }, [studentId, moreInfo])
  return (
    <form onSubmit={handleSubmit} className="p-5">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(-1)} type="dashed" icon={<ArrowLeftOutlined />}></Button>
        <h1 className="font-bold text-[25px]">Student {studentId ? "tahrirlash" : "qo'shish"}</h1>
        <Button loading={studentId ? updateLoading : createLoading} htmlType="submit" icon={<PlusCircleOutlined />} size="large" type="primary">Saqlash</Button>
      </div>
      <div className="grid grid-cols-2 gap-5 m-5">
        <div className="w-full flex flex-col gap-3">
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Ism kiriting:</span>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full" allowClear size="large" placeholder="Ism" />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Familiya kiriting:</span>
            <Input value={lastName} onChange={(e) => setlastName(e.target.value)} className="w-full" allowClear size="large" placeholder="Familiya" />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Email:</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" allowClear size="large" placeholder="Email" />
          </label>
        </div>
        <div className="w-full flex flex-col gap-3">
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Nomer kiriting:</span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full" allowClear size="large" placeholder="Nomer" />
          </label>
          <label className="flex flex-col w-full! gap-1">
            <span className="text-[#8f5c28] pl-1">Parol kiriting:</span>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" allowClear size="large" placeholder="Parol" />
          </label>
        </div>
      </div>
    </form>
  )
}

export default StudentsCrud