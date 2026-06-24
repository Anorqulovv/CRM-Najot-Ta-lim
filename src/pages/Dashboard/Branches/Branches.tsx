import { Input, Button, Table, Tag, Tooltip, Modal } from "antd"
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons"
import { useCookies } from "react-cookie"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GetAll } from "../../../service"
import { debounce, instance } from "../../../hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useCurrentUser } from "../../../hooks/useCurrentUser"
import { Caption } from "../../../components"
import toast from "react-hot-toast"

const QueryBranches = "branches"

const Branches = () => {
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])
  const [search, setSearch] = useState("")
  const [delModal, setDelModal] = useState<{ open: boolean; id?: number; name?: string }>({
    open: false,
  })

  const name = debounce(search, 600)
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(currentUser?.role ?? "")

  const { data: branches = [], isLoading } = GetAll(
    QueryBranches,
    [name],
    cookies.accessToken,
    "/branches",
    { name },
    navigate
  )

  const [delLoading, setDelLoading] = useState(false)

  const handleDeleteBranch = async () => {
    if (!delModal.id) return

    setDelLoading(true)

    try {
      await instance(cookies.accessToken).delete(`/branches/${delModal.id}`)
      await queryClient.invalidateQueries({ queryKey: [QueryBranches] })
      toast.success("Filial o‘chirildi")
      setDelModal({ open: false })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Filialni o‘chirishda xatolik")
    } finally {
      setDelLoading(false)
    }
  }

  const columns = [
    {
      title: "№",
      dataIndex: "order",
      key: "order",
      width: 70,
      render: (order: number) => (
        <Tag color="orange" className="rounded-md font-bold">
          #{order}
        </Tag>
      ),
    },
    {
      title: "Filial nomi",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]">
          <BankOutlined className="text-[#8f5c28]" />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Manzil",
      dataIndex: "address",
      key: "address",
      render: (addr: string) =>
        addr ? (
          <span className="flex items-center gap-1.5 text-[#555]">
            <EnvironmentOutlined className="text-[#8f5c28]" />
            {addr}
          </span>
        ) : (
          <span className="text-[#ccc]">—</span>
        ),
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) =>
        phone ? (
          <span className="flex items-center gap-1.5 text-[#555]">
            <PhoneOutlined className="text-[#8f5c28]" />
            {phone}
          </span>
        ) : (
          <span className="text-[#ccc]">—</span>
        ),
    },
    {
      title: "Holat",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"} className="rounded-md">
          {v ? "Faol" : "Nofaol"}
        </Tag>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: "Amallar",
            key: "actions",
            width: 110,
            render: (r: any) => (
              <div className="flex gap-1.5">
                <Tooltip title="Tahrirlash">
                  <Button
                    size="small"
                    type="primary"
                    icon={<EditOutlined />}
                    className="rounded-lg border-none bg-gradient-to-br from-[#7a4520] to-[#c8864a]"
                    onClick={() => navigate(`/branches/${r.id}/update`)}
                  />
                </Tooltip>

                <Tooltip title="O‘chirish">
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    className="rounded-lg"
                    onClick={() => setDelModal({ open: true, id: r.id, name: r.name })}
                  />
                </Tooltip>
              </div>
            ),
          },
        ]
      : []),
  ]

  const data = branches.map((b: any, index: number) => ({
    ...b,
    key: b.id,
    order: index + 1,
  }))

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <Caption count={branches.length} title="Filiallar" icon={<BankOutlined />} hideCreate={!isAdmin} />

      <div className="mb-5">
        <Input
          prefix={<SearchOutlined className="text-[#c8864a]" />}
          onChange={(e) => setSearch(e.target.value)}
          size="large"
          placeholder="Filial nomini qidirish..."
          allowClear
          className="w-full max-w-full rounded-xl border-[#e5d8cc] sm:max-w-[360px]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="crm-responsive-table">
          <Table
            loading={isLoading}
            dataSource={data}
            columns={columns}
            scroll={{ x: "max-content" }}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              responsive: true,
              showTotal: (t) => `Jami ${t} ta`,
            }}
            size="middle"
          />
        </div>
      </div>

      <Modal
        open={delModal.open}
        onCancel={() => setDelModal({ open: false })}
        onOk={handleDeleteBranch}
        confirmLoading={delLoading}
        okText="Ha, o‘chirish"
        cancelText="Bekor qilish"
        okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        title={<span className="font-semibold text-[#dc2626]">O‘chirishni tasdiqlang</span>}
        centered
        width={380}
      >
        <p className="my-3 text-[13.5px] leading-6 text-[#555]">
          <strong>"{delModal.name}"</strong> filialini o‘chirmoqchimisiz? Bu filialga
          biriktirilgan foydalanuvchilar filialsiz qoladi.
        </p>
      </Modal>
    </div>
  )
}

export default Branches
