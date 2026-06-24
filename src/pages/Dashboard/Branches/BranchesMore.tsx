import {
  ArrowLeftOutlined,
  BankOutlined,
  DeleteFilled,
  EditFilled,
  EnvironmentOutlined,
  PhoneOutlined,
  FieldNumberOutlined,
} from "@ant-design/icons"
import { Button, Modal, Skeleton, Tag } from "antd"
import { useNavigate, useParams } from "react-router-dom"
import { useCookies } from "react-cookie"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Delete, GetById } from "../../../service"
import { QueryPATH } from "../../../components"

const C = {
  accent: "#8f5c28",
  accentGradient: "linear-gradient(135deg, #7a4520, #c8864a)",
  accentBg: "linear-gradient(135deg, #f5ece3 0%, #fdf8f5 100%)",
  accentBorder: "#f5f0eb",
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
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "11px 0",
      borderBottom: `1px solid ${C.accentBorder}`,
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#f5ece3",
        color: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 14,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 2 }}>{label}</div>
      {isLoading ? (
        <Skeleton.Input active size="small" style={{ width: 140 }} />
      ) : (
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
          {value || <span style={{ color: "#ddd", fontWeight: 400 }}>—</span>}
        </div>
      )}
    </div>
  </div>
)

const BranchesMore = () => {
  const navigate = useNavigate()
  const { branchId } = useParams()
  const [cookies] = useCookies(["accessToken"])
  const [delModal, setDelModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: branch = {}, isLoading } = GetById(
    branchId,
    cookies.accessToken,
    QueryPATH.branchesMore,
    "/branches"
  )

  const { mutate: DeleteBranch, isPending } = Delete(
    cookies.accessToken,
    `/branches/${branchId}`,
    navigate,
    queryClient,
    QueryPATH.branches
  )

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Orqaga
        </Button>

        <div style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<EditFilled />}
            style={{ background: C.accentGradient, color: "#fff", border: "none" }}
            onClick={() => navigate(`/branches/${branchId}/update`)}
          >
            Tahrirlash
          </Button>
          <Button danger icon={<DeleteFilled />} onClick={() => setDelModal(true)}>
            O‘chirish
          </Button>
        </div>
      </div>

      <div
        style={{
          borderRadius: 16,
          background: C.accentBg,
          border: `1px solid ${C.accentBorder}`,
          padding: "20px 22px",
          maxWidth: 560,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: C.accentGradient,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            <BankOutlined />
          </div>
          <div>
            {isLoading ? (
              <Skeleton.Input active size="small" style={{ width: 160 }} />
            ) : (
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a" }}>
                {branch?.name ?? "—"}
              </div>
            )}
            <Tag color={branch?.isActive ? "green" : "red"} style={{ marginTop: 4 }}>
              {branch?.isActive ? "Faol" : "Nofaol"}
            </Tag>
          </div>
        </div>

        <InfoRow
          icon={<FieldNumberOutlined />}
          label="ID"
          value={<Tag color="orange">#{branchId}</Tag>}
          isLoading={isLoading}
        />
        <InfoRow
          icon={<EnvironmentOutlined />}
          label="Manzil"
          value={branch?.address}
          isLoading={isLoading}
        />
        <InfoRow
          icon={<PhoneOutlined />}
          label="Telefon"
          value={branch?.phone}
          isLoading={isLoading}
        />
      </div>

      <Modal
        open={delModal}
        onCancel={() => setDelModal(false)}
        onOk={() => DeleteBranch()}
        confirmLoading={isPending}
        okText="Ha, o‘chirish"
        cancelText="Bekor qilish"
        okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        title={<span style={{ color: "#dc2626", fontWeight: 600 }}>O‘chirishni tasdiqlang</span>}
        centered
        width={380}
      >
        <p style={{ margin: "12px 0", fontSize: 13.5, lineHeight: "22px", color: "#555" }}>
          <strong>"{branch?.name}"</strong> filialini o‘chirmoqchimisiz? Bu filialga biriktirilgan
          foydalanuvchilar filialsiz qoladi.
        </p>
      </Modal>
    </div>
  )
}

export default BranchesMore
