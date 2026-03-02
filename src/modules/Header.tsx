import { BellFilled, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { Badge, Button, Modal, Popover } from "antd"
import { useContext, useState } from "react"
import { Context } from "../context/Context"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { PATH } from "../components"
import { useCookies } from "react-cookie"
import { GetMe } from "../service"

const Header = () => {
  const [cookies, , removeCookie] = useCookies(["token"])
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const { setCollapse, collapse } = useContext(Context)

  const {data:userInfo = {}, isLoading} = GetMe(cookies.token)

  function handleLogOut() {
    setLoading(true)
    setTimeout(() => {
      toast.success("Chiqib ketdinggiz")
      setOpenModal(false)
    }, 1000)
    setTimeout(() => {
      removeCookie("token")
      navigate(PATH.home)
    }, 1800)
  }
  const LogOutContent = (
    <>
      <h1 className="font-bold">{userInfo.fullName}</h1>
      <Button onClick={() => setOpenModal(true)} className="bg-red-500! mt-2" block icon={<LogoutOutlined />} type="primary">Chiqish</Button>
    </>
  )
  return (
    <div className="px-5 py-6.75 bg-[#8f5c28]! flex items-center justify-between">
      <Button onClick={() => setCollapse(!collapse)} className={'bg-[#ffffffa5]! mb-0! text-black!'} type="primary" style={{ marginBottom: 16 }}>
        {collapse ? <MenuFoldOutlined className="scale-[1.1]" /> : <MenuUnfoldOutlined className="scale-[1.1]" />}
      </Button>
      <div className="flex items-center gap-5">
        <Badge className="text-[#ffffffa5]! cursor-pointer!" size="small" count={2}>
          <BellFilled className="text-[30px]" />
        </Badge>
        <Popover content={LogOutContent}>
          <Button loading={isLoading} className="bg-[#ffffffa5]! text-black! w-10! h-10!" type="primary" size="large">
            {userInfo?.fullName?.split(" ")[0].split("")[0]}
            {userInfo?.fullName?.split(" ")[1].split("")[0]}
          </Button>
        </Popover>
      </div>
      <Modal confirmLoading={loading} onOk={handleLogOut} okText="Chiqish" cancelText="Bekor qilish" okButtonProps={{ className: "bg-[#8f5c28]!" }} open={openModal} onCancel={() => setOpenModal(false)} title="Chiqish">
        <p>Aniq chiqishni hohlaysizmi?</p>
      </Modal>
    </div>
  )
}

export default Header