import { useQuery } from "@tanstack/react-query"
import { useCookies } from "react-cookie"
import { Skeleton } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { instance } from "../../../hooks"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
} from "recharts"

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.07)",
  boxShadow: "0 4px 22px rgba(0,0,0,0.06)",
}

const statCard = (label: string, value: string | number, bg: string, color: string) => (
  <div style={{ padding: 14, borderRadius: 14, background: bg }}>
    <div style={{ fontSize: 11, color, fontWeight: 800, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 900, color: "#1a1a1a", marginTop: 4 }}>{value}</div>
  </div>
)

const ParentResults = () => {
  const navigate = useNavigate()
  const [cookies] = useCookies(["accessToken"])

  const { data, isLoading } = useQuery({
    queryKey: ["parent-children-analytics", cookies.accessToken],
    queryFn: async () => {
      const res = await instance(cookies.accessToken).get("/tests/parent/children-analytics")
      return res.data?.data
    },
    enabled: Boolean(cookies.accessToken),
  })

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#f2ede7" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: "1px solid #d6c4b0",
            background: "#fff",
            color: "#8f5c28",
            cursor: "pointer",
          }}
        >
          <ArrowLeftOutlined />
        </button>

        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1a1a1a" }}>
            📊 Farzandlarim natijalari
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8b7355" }}>
            Farzandlaringizning test natijalari va urinishlar diagrammasi
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ ...cardStyle, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : data?.children?.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {data.children.map((child: any) => (
            <div key={child.studentId} style={{ ...cardStyle, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a1a" }}>
                    👤 {child.fullName || "Farzand"}
                  </h2>
                  <p style={{ margin: "5px 0 0", color: "#9c8572", fontSize: 13 }}>
                    🏫 {child.groupName || "Guruh biriktirilmagan"}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(110px, 1fr))", gap: 10, flex: 1, minWidth: 460 }}>
                  {statCard("Jami urinish", child.totalTests ?? 0, "#f5ece3", "#8f5c28")}
                  {statCard("O'rtacha", `${child.averageScore ?? 0}%`, "#ecfdf5", "#16a34a")}
                  {statCard("Eng yuqori", `${child.highestScore ?? 0}%`, "#eff6ff", "#2563eb")}
                  {statCard("Eng past", `${child.lowestScore ?? 0}%`, "#fff7ed", "#ea580c")}
                </div>
              </div>

              {child.tests?.length ? (
                <div style={{ height: 330, width: "100%", background: "#fffaf5", borderRadius: 16, padding: 14, border: "1px solid #f0e8df" }}>
                  <ResponsiveContainer>
                    <LineChart data={child.tests}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <ChartTooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8f5c28"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: 18, background: "#fffaf5", borderRadius: 14, color: "#9c8572" }}>
                  Bu farzand uchun hali test natijalari yo‘q.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: 28, color: "#9c8572" }}>
          Sizga biriktirilgan farzandlar yoki test natijalari topilmadi.
        </div>
      )}
    </div>
  )
}

export default ParentResults
