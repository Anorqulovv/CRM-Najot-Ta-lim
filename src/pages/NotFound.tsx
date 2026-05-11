import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

const NotFound = () => {
  const navigate = useNavigate()
  const [count, setCount] = useState(8)

  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000)
    const r = setTimeout(() => navigate("/"), 8000)
    return () => { clearInterval(t); clearTimeout(r) }
  }, [navigate])

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg, #1a1d23 0%, #242830 50%, #1a1d23 100%)",
      position: "relative", overflow: "hidden", fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none"
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: `${120 + i * 80}px`,
            height: `${120 + i * 80}px`,
            borderRadius: "50%",
            border: `1px solid rgba(200,134,74,${0.04 + i * 0.015})`,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
          }} />
        ))}
        <div style={{
          position: "absolute", top: "15%", left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,134,74,0.07) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "8%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(122,69,32,0.06) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{
        position: "relative", zIndex: 1, textAlign: "center", padding: "40px 24px",
        maxWidth: 540, width: "100%",
      }}>
        {/* 404 */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div style={{
            fontSize: "clamp(100px, 20vw, 160px)",
            fontWeight: 800,
            lineHeight: 1,
            background: "linear-gradient(135deg, #c8864a 0%, #8f5c28 40%, #c8864a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-4px",
            userSelect: "none",
            fontFamily: "'Outfit', sans-serif",
          }}>404</div>
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "clamp(100px, 20vw, 160px)", fontWeight: 800,
            letterSpacing: "-4px",
            background: "linear-gradient(135deg, rgba(200,134,74,0.06), transparent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transform: "translate(3px, 5px)",
            userSelect: "none",
            fontFamily: "'Outfit', sans-serif",
          }}>404</div>
        </div>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: "linear-gradient(135deg, rgba(200,134,74,0.15), rgba(143,92,40,0.08))",
          border: "1px solid rgba(200,134,74,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 24px",
          boxShadow: "0 8px 32px rgba(200,134,74,0.12)",
        }}>🗺️</div>

        <h1 style={{
          fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.92)",
          margin: "0 0 12px", letterSpacing: "-0.3px",
          fontFamily: "'Outfit', sans-serif",
        }}>
          Sahifa topilmadi
        </h1>

        <p style={{
          fontSize: 14.5, color: "rgba(255,255,255,0.4)",
          margin: "0 0 36px", lineHeight: 1.7,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Siz qidirgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
          Bosh sahifaga qaytishingizni tavsiya etamiz.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "12px 24px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)", fontWeight: 600,
              fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          >
            ← Orqaga qaytish
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 28px", borderRadius: 12,
              background: "linear-gradient(135deg, #7a4520, #c8864a)",
              border: "none",
              color: "#fff", fontWeight: 700,
              fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(200,134,74,0.35)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            🏠 Bosh sahifa
          </button>
        </div>

        {/* Countdown */}
        <div style={{
          marginTop: 40, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid rgba(200,134,74,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#c8864a",
          }}>{count}</div>
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            soniyadan so'ng avtomatik yo'naltiriladi
          </span>
        </div>
      </div>
    </div>
  )
}

export default NotFound
