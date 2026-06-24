import { HistoryOutlined, useMemo, useState } from "react"
import { Table, Tag, Input, Card, Select } from "antd"
import {
  AuditOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import { useCookies } from "react-cookie"
import { GetAll } from "../../../service"
import { QueryPATH } from "../../../components"

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "—"

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const Activity = () => {
  const [cookies] = useCookies(["accessToken"])

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [onlineFilter, setOnlineFilter] = useState<string>("ALL")
  const [methodFilter, setMethodFilter] = useState<string>("ALL")
  const [actionFilter, setActionFilter] = useState<string>("ALL")

  const { data: users = [], isPending: usersLoading } = GetAll(
    QueryPATH.activityOverview,
    [],
    cookies.accessToken,
    "/activity/overview"
  )

  const { data: logs = [], isPending: logsLoading } = GetAll(
    QueryPATH.activityLogs,
    [],
    cookies.accessToken,
    "/activity/logs",
    { limit: 200 }
  )

  const roleOptions = useMemo(() => {
    const roles = Array.from(new Set(users.map((u: any) => u.role).filter(Boolean)))

    return [
      { label: "Barcha rollar", value: "ALL" },
      ...roles.map((role: any) => ({ label: role, value: role })),
    ]
  }, [users])

  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(logs.map((l: any) => l.action).filter(Boolean)))

    return [
      { label: "Barcha amallar", value: "ALL" },
      ...actions.map((action: any) => ({ label: action, value: action })),
    ]
  }, [logs])

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim()

    return users.filter((u: any) => {
      const matchSearch =
        !q ||
        u.fullName?.toLowerCase()?.includes(q) ||
        u.username?.toLowerCase()?.includes(q) ||
        u.phone?.toLowerCase()?.includes(q) ||
        u.role?.toLowerCase()?.includes(q)

      const matchRole = roleFilter === "ALL" || u.role === roleFilter

      const matchOnline =
        onlineFilter === "ALL" ||
        (onlineFilter === "ONLINE" && u.isOnline) ||
        (onlineFilter === "OFFLINE" && !u.isOnline)

      return matchSearch && matchRole && matchOnline
    })
  }, [users, search, roleFilter, onlineFilter])

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase().trim()

    return logs.filter((l: any) => {
      const matchSearch =
        !q ||
        l.user?.fullName?.toLowerCase()?.includes(q) ||
        l.user?.username?.toLowerCase()?.includes(q) ||
        l.action?.toLowerCase()?.includes(q) ||
        l.path?.toLowerCase()?.includes(q) ||
        l.method?.toLowerCase()?.includes(q)

      const matchMethod = methodFilter === "ALL" || l.method === methodFilter
      const matchAction = actionFilter === "ALL" || l.action === actionFilter

      return matchSearch && matchMethod && matchAction
    })
  }, [logs, search, methodFilter, actionFilter])

  const onlineCount = users.filter((u: any) => u.isOnline).length

  const userColumns = [
    {
      title: "№",
      key: "order",
      width: 70,
      render: (_: any, __: any, index: number) => (
        <Tag color="gold" className="rounded-md font-bold">
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: "Foydalanuvchi",
      dataIndex: "fullName",
      render: (_: any, row: any) => (
        <div>
          <div className="font-bold text-[#1a1a1a]">{row.fullName || "—"}</div>
          <div className="text-xs text-gray-400">
            @{row.username || "—"} · {row.phone || "—"}
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 140,
      render: (role: string) => <Tag color="gold">{role}</Tag>,
    },
    {
      title: "Holat",
      dataIndex: "isOnline",
      width: 130,
      render: (online: boolean) =>
        online ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Online
          </Tag>
        ) : (
          <Tag color="default" icon={<ClockCircleOutlined />}>
            Offline
          </Tag>
        ),
    },
    {
      title: "Oxirgi faollik",
      dataIndex: "lastSeenAt",
      render: (v: string) => formatDateTime(v),
    },
  ]

  const logColumns = [
    {
      title: "№",
      key: "order",
      width: 70,
      render: (_: any, __: any, index: number) => (
        <Tag color="gold" className="rounded-md font-bold">
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: "Vaqt",
      dataIndex: "createdAt",
      width: 160,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: "Kim",
      dataIndex: "user",
      width: 220,
      render: (u: any) => (
        <div>
          <div className="font-semibold text-[#1a1a1a]">
            {u?.fullName || "Noma'lum"}
          </div>
          <div className="text-xs text-gray-400">
            {u?.role || "—"} · @{u?.username || "—"}
          </div>
        </div>
      ),
    },
    {
      title: "Amal",
      dataIndex: "action",
      render: (v: string) => <span className="font-semibold text-[#8f5c28]">{v}</span>,
    },
    {
      title: "Method",
      dataIndex: "method",
      width: 95,
      render: (v: string) => (
        <Tag color={v === "GET" ? "blue" : v === "DELETE" ? "red" : "orange"}>
          {v}
        </Tag>
      ),
    },
    {
      title: "Path",
      dataIndex: "path",
      render: (v: string) => <code className="text-xs text-gray-500">{v}</code>,
    },
    {
      title: "Status",
      dataIndex: "statusCode",
      width: 90,
      render: (v: number) => <Tag color={v >= 400 ? "red" : "green"}>{v}</Tag>,
    },
  ]

  return (
    <div className="activity-page p-4 sm:p-5 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-[22px] text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #7a4520, #c8864a)",
              boxShadow: "0 10px 24px rgba(143,92,40,0.28)",
            }}
          >
            <HistoryOutlined />
          </div>

          <div>
            <h1
              className="m-0 text-2xl font-extrabold sm:text-[26px]"
              style={{ color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
            >
              Platforma faolligi
            </h1>
            <p
              className="m-0 mt-1 text-[13px] font-semibold"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Kim online, oxirgi faollik va foydalanuvchi amallari
            </p>
          </div>
        </div>

        <Input
          size="large"
          allowClear
          prefix={<SearchOutlined style={{ color: "#c8864a" }} />}
          placeholder="Ism, username, role yoki amal bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl xl:max-w-[420px]"
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-none shadow-sm">
          <div className="text-2xl font-extrabold text-[#8f5c28]">{users.length}</div>
          <div className="text-sm text-gray-500">Jami foydalanuvchilar</div>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <div className="text-2xl font-extrabold text-green-600">{onlineCount}</div>
          <div className="text-sm text-gray-500">Hozir online</div>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <div className="text-2xl font-extrabold text-[#8f5c28]">{logs.length}</div>
          <div className="text-sm text-gray-500">Oxirgi activity loglar</div>
        </Card>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="m-0 text-[15px] font-bold text-[#8f5c28]">
            Online va oxirgi faollik
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Select
              size="large"
              value={roleFilter}
              onChange={setRoleFilter}
              options={roleOptions}
              className="w-full"
            />

            <Select
              size="large"
              value={onlineFilter}
              onChange={setOnlineFilter}
              options={[
                { label: "Barcha holatlar", value: "ALL" },
                { label: "Faqat online", value: "ONLINE" },
                { label: "Faqat offline", value: "OFFLINE" },
              ]}
              className="w-full"
            />

            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#c8864a" }} />}
              placeholder="Foydalanuvchi qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl"
            />
          </div>
        </div>

        <Table
          rowKey="id"
          loading={usersLoading}
          dataSource={filteredUsers}
          columns={userColumns}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="m-0 text-[15px] font-bold text-[#8f5c28]">
            Foydalanuvchi amallari
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Select
              size="large"
              value={methodFilter}
              onChange={setMethodFilter}
              options={[
                { label: "Barcha methodlar", value: "ALL" },
                { label: "GET", value: "GET" },
                { label: "POST", value: "POST" },
                { label: "PATCH", value: "PATCH" },
                { label: "PUT", value: "PUT" },
                { label: "DELETE", value: "DELETE" },
              ]}
              className="w-full"
            />

            <Select
              size="large"
              value={actionFilter}
              onChange={setActionFilter}
              options={actionOptions}
              className="w-full"
            />

            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#c8864a" }} />}
              placeholder="Log qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl"
            />
          </div>
        </div>

        <Table
          rowKey="id"
          loading={logsLoading}
          dataSource={filteredLogs}
          columns={logColumns}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </div>
    </div>
  )
}

export default Activity
