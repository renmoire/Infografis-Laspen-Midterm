import { useEffect, useState, useRef } from "react"
import { toPng } from "html-to-image"

// ── EXPORT HELPERS ─────────────────────────────────────────────────────────
const FILTER = (n) => !n.classList?.contains("no-capture") && n.tagName !== "NAV"

async function captureSec(el, name) {
  const pO = document.body.style.overflow, pM = document.body.style.minWidth
  document.body.style.overflow = "visible"
  document.body.style.minWidth = "1024px"
  await new Promise(r => setTimeout(r, 100))
  try {
    const url = await toPng(el, {
      backgroundColor: "#faf7f2",
      pixelRatio: 2,
      width: 1024,
      height: el.scrollHeight,
      filter: FILTER
    })
    Object.assign(document.createElement("a"), { href: url, download: name }).click()
  } finally { document.body.style.overflow = pO; document.body.style.minWidth = pM }
}
async function captureFull(name) {
  const pO = document.body.style.overflow
  document.body.style.overflow = "visible"
  try {
    const url = await toPng(document.body, {
      backgroundColor: "#faf7f2", pixelRatio: 2,
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight, filter: FILTER
    })
    Object.assign(document.createElement("a"), { href: url, download: name }).click()
  } finally { document.body.style.overflow = pO }
}

// ── EXPORT FAB ─────────────────────────────────────────────────────────────
function ExportFAB() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)
  const items = [
    { id:"hero",     label:"Cover"    },
    { id:"analisis", label:"Analisis" },
    { id:"era40",    label:"Era 4.0"  },
    { id:"kritik",   label:"Kritik"   },
    { id:"strategi", label:"Strategi" },
  ]
  const go = async (id) => {
    setBusy(id)
    try {
      if (id === "full") await captureFull("infografis-full.png")
      else { const el = document.getElementById(id); if (el) await captureSec(el, `infografis-${id}.png`) }
    } catch(e) { console.error(e) }
    setBusy(null)
  }
  return (
    <div className="no-capture" style={{ position:"fixed", bottom:"1.5rem", right:"1.25rem", zIndex:50, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
      {open && (
        <div style={{ display:"flex", flexDirection:"column", gap:"6px", alignItems:"flex-end" }}>
          <button onClick={() => go("full")} disabled={!!busy}
            style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"8px 18px", background:"#c0622a", color:"#faf7f2", border:"none", borderRadius:"99px", cursor:"pointer", whiteSpace:"nowrap", opacity: busy ? 0.5 : 1 }}>
            {busy==="full" ? "···" : "↓ Full Page"}
          </button>
          <div style={{ width:"100%", height:"1px", background:"rgba(26,20,16,0.09)" }} />
          {items.map(({ id, label }) => (
            <button key={id} onClick={() => go(id)} disabled={!!busy}
              style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", padding:"8px 18px", background:"#ede8db", color: busy===id ? "#c0622a" : "rgba(255,255,255,0.6)", border:"1px solid rgba(26,20,16,0.08)", borderRadius:"99px", cursor:"pointer", whiteSpace:"nowrap", opacity: busy&&busy!==id ? 0.4 : 1 }}>
              {busy===id ? "···" : `↓ ${label}`}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(v => !v)}
        style={{ width:"44px", height:"44px", borderRadius:"50%", background: open ? "rgba(26,20,16,0.09)" : "#c0622a", color: open ? "#fff" : "#faf7f2", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", fontSize:"1.1rem", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s ease" }}>
        {open ? "✕" : "↓"}
      </button>
    </div>
  )
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState("hero")
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const lastClick               = useRef(null)

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 30)
      if (menuOpen) setMenuOpen(false)
      const tot = document.documentElement.scrollHeight - window.innerHeight
      setProgress(tot > 0 ? (window.scrollY / tot) * 100 : 0)
    }
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [menuOpen])

  useEffect(() => {
    const ids = ["hero","analisis","era40","kritik","strategi"]
    const obs = ids.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(id) }, { threshold: 0.25 })
      o.observe(el); return o
    })
    return () => obs.forEach(o => o?.disconnect())
  }, [])

  useEffect(() => {
    const o = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target) }
      })
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" })
    const els = document.querySelectorAll(".reveal, .reveal-left")
    els.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("in")
      } else {
        o.observe(el)
      }
    })
    return () => o.disconnect()
  }, [])

  const navLinks = [
    { id:"analisis", label:"Analisis" },
    { id:"era40",    label:"Era 4.0"  },
    { id:"kritik",   label:"Kritik"   },
    { id:"strategi", label:"Strategi" },
  ]

  const go = (id) => {
    if (lastClick.current === id) {
      window.scrollTo({ top: 0, behavior:"smooth" })
      lastClick.current = null; setMenuOpen(false); return
    }
    lastClick.current = id
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior:"smooth" })
    setMenuOpen(false)
  }

  return (
    <div style={{ minHeight:"100vh", background:"#faf7f2" }}>

      {/* progress bar — solid, no gradient */}
      <div style={{ position:"fixed", top:0, left:0, height:"2px", width:`${progress}%`, background:"#c0622a", zIndex:9999, transition:"width 0.1s linear" }} />

      <ExportFAB />

      {/* ── NAV ── */}
      <nav className="no-capture" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:40,
        background: scrolled||menuOpen ? "rgba(250,247,242,0.92)" : "transparent",
        backdropFilter: scrolled||menuOpen ? "blur(20px)" : "none",
        borderBottom: scrolled||menuOpen ? "1px solid rgba(26,20,16,0.08)" : "1px solid transparent",
        transition:"all 0.4s ease",
      }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 1.5rem", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => go("hero")} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:"0.85rem", color:"#1a1410", lineHeight:1.2 }}>Irenia Maisa Kamila</div>
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.6rem", fontWeight:600, letterSpacing:"0.14em", color:"#c0622a", textTransform:"uppercase" }}>2506031</div>
          </button>

          <div className="hide-mobile" style={{ display:"flex", gap:"4px" }}>
            {navLinks.map(({ id, label }) => (
              <button key={id} onClick={() => go(id)} className={`nav-pill${active===id?" active":""}`}>{label}</button>
            ))}
          </div>

          <button onClick={() => setMenuOpen(v=>!v)} id="burger-btn"
            style={{ display:"none", background:"none", border:"none", cursor:"pointer", flexDirection:"column", gap:"5px", padding:"4px" }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:"block", width:"20px", height:"1.5px", background:"#1a1410", transition:"all 0.3s ease",
                transform: menuOpen ? (i===0 ? "translateY(6.5px) rotate(45deg)" : i===2 ? "translateY(-6.5px) rotate(-45deg)" : "none") : "none",
                opacity: menuOpen && i===1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        <div style={{ maxHeight: menuOpen ? "280px" : "0", overflow:"hidden", transition:"max-height 0.35s ease, opacity 0.3s", opacity: menuOpen ? 1 : 0, borderTop: menuOpen ? "1px solid rgba(26,20,16,0.08)" : "none" }}>
          <div style={{ maxWidth:"900px", margin:"0 auto", padding:"1rem 1.5rem", display:"flex", flexDirection:"column", gap:"4px" }}>
            {navLinks.map(({ id, label }) => (
              <button key={id} onClick={() => go(id)}
                style={{ background: active===id ? "rgba(192,98,42,0.1)" : "transparent", border:"none", borderRadius:"10px", cursor:"pointer", padding:"0.75rem 1rem", textAlign:"left", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.85rem", fontWeight:600, color: active===id ? "#c0622a" : "#7a6a5a" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 640px) {
          #burger-btn { display: flex !important; }
          .hide-mobile { display: none !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section id="hero" style={{ position:"relative", minHeight:"100svh", display:"flex", flexDirection:"column", justifyContent:"center", overflow:"hidden", background:"#faf7f2" }}>

        {/* dot grid — flat, no gradient */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(26,20,16,0.06) 1px, transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }} />

        {/* corner accent blocks */}
        <div style={{ position:"absolute", top:0, right:0, width:"280px", height:"280px", background:"#c0622a", opacity:0.06, clipPath:"polygon(100% 0, 0 0, 100% 100%)" }} />
        <div style={{ position:"absolute", bottom:0, left:0, width:"200px", height:"200px", background:"#5a8a5e", opacity:0.06, clipPath:"polygon(0 100%, 0 0, 100% 100%)" }} />

        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"7rem 1.5rem 5rem", position:"relative", zIndex:1 }}>

          {/* badge */}
          <div className="reveal" style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"5px 14px", borderRadius:"99px", border:"1px solid rgba(192,98,42,0.3)", background:"rgba(192,98,42,0.08)", marginBottom:"2rem" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#5a8a5e", flexShrink:0 }} />
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#5a8a5e" }}>Landasan Pendidikan · 2025</span>
          </div>

          {/* headline — solid colors, no gradient text */}
          <h1 className="reveal serif" style={{ fontSize:"clamp(3rem,9vw,6.5rem)", fontWeight:900, lineHeight:0.95, letterSpacing:"-0.03em", color:"#1a1410", marginBottom:"1.5rem" }}>
            Pendidikan<br />
            <span style={{ fontStyle:"italic", color:"#c0622a" }}>sebagai</span><br />
            Gerakan<br />
            <span style={{ fontStyle:"italic", color:"#b84a2e" }}>Semesta</span>
          </h1>

          <p className="reveal" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.75rem", fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#7a6a5a", marginBottom:"2.5rem" }}>
            di Era Society 5.0 &nbsp;·&nbsp; Infografis Pendidikan
          </p>

          <div className="reveal" style={{ maxWidth:"560px", background:"#ede8db", border:"1px solid rgba(26,20,16,0.08)", borderRadius:"16px", padding:"1.5rem" }}>
            <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.9rem", lineHeight:1.7, color:"rgba(26,20,16,0.6)" }}>
              Pendidikan bukan hanya proses belajar — ia adalah fondasi pembentukan karakter, moral, dan kesiapan generasi menghadapi perubahan global yang semakin kompleks.
            </p>
          </div>

          <div className="reveal" style={{ marginTop:"3rem", display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"1px", height:"48px", background:"#c0622a", opacity:0.4 }} />
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#7a6a5a" }}>Scroll untuk eksplorasi</span>
          </div>
        </div>
      </section>

      <div style={{ height:"1px", background:"rgba(26,20,16,0.07)", maxWidth:"900px", margin:"0 auto" }} />

      {/* ══════════════════════════════════════
          ANALISIS
      ══════════════════════════════════════ */}
      <section id="analisis" style={{ position:"relative", padding:"5rem 0", background:"#faf7f2" }}>

        {/* side accent stripe */}
        <div style={{ position:"absolute", top:0, right:0, width:"3px", height:"100%", background:"#c0622a", opacity:0.15 }} />

        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 1.5rem" }}>

          <div className="reveal" style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"1rem" }}>
            <div style={{ width:"24px", height:"2px", background:"#c0622a" }} />
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#7a6a5a" }}>Analisis Kritis</span>
          </div>

          <h2 className="reveal serif" style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:"0.5rem", color:"#1a1410" }}>
            Dampak Perkembangan<br /><span style={{ color:"#c0622a" }}>Teknologi</span>
          </h2>
          <p className="reveal" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#7a6a5a", fontSize:"0.85rem", marginBottom:"3rem" }}>dalam Dunia Pendidikan Indonesia</p>

          {/* pos/neg split — flat solid */}
          <div className="reveal two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"rgba(26,20,16,0.07)", borderRadius:"20px", overflow:"hidden" }}>

            {/* POSITIF */}
            <div style={{ background:"#ede8db", padding:"2rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"4px 12px", borderRadius:"99px", background:"rgba(90,138,94,0.1)", border:"1px solid rgba(90,138,94,0.25)" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#5a8a5e" }} />
                  <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#5a8a5e" }}>Positif</span>
                </div>
                <span className="serif" style={{ fontSize:"4rem", fontWeight:900, color:"rgba(90,138,94,0.07)", lineHeight:1 }}>+</span>
              </div>
              {[
                { h:"Akses Informasi",      b:"Informasi tersedia lebih cepat dan melampaui batas geografis." },
                { h:"Pembelajaran Digital", b:"Platform e-learning memperluas jangkauan pendidikan formal." },
                { h:"Inovasi Pedagogis",    b:"Teknologi mendorong metode pengajaran adaptif dan kreatif." },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom: i<2?"1.25rem":"0", paddingBottom: i<2?"1.25rem":"0", borderBottom: i<2?"1px solid rgba(26,20,16,0.06)":"none" }}>
                  <div style={{ width:"3px", borderRadius:"99px", background:"#5a8a5e", flexShrink:0, alignSelf:"stretch", minHeight:"36px" }} />
                  <div>
                    <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:"0.85rem", color:"#1a1410", marginBottom:"3px" }}>{item.h}</p>
                    <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.78rem", color:"#7a6a5a", lineHeight:1.55 }}>{item.b}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* NEGATIF */}
            <div style={{ background:"#e8e0d0", padding:"2rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.75rem" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"4px 12px", borderRadius:"99px", background:"rgba(184,74,46,0.1)", border:"1px solid rgba(184,74,46,0.25)" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#b84a2e" }} />
                  <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#b84a2e" }}>Negatif</span>
                </div>
                <span className="serif" style={{ fontSize:"4rem", fontWeight:900, color:"rgba(184,74,46,0.07)", lineHeight:1 }}>−</span>
              </div>
              {[
                { h:"Degradasi Sosial", b:"Menurunnya kualitas interaksi tatap muka dan empati interpersonal." },
                { h:"Erosi Budaya",     b:"Nilai-nilai lokal tergerus dominasi konten digital global." },
                { h:"Ketergantungan",   b:"Siswa kehilangan kemampuan berpikir mandiri tanpa teknologi." },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom: i<2?"1.25rem":"0", paddingBottom: i<2?"1.25rem":"0", borderBottom: i<2?"1px solid rgba(26,20,16,0.06)":"none" }}>
                  <div style={{ width:"3px", borderRadius:"99px", background:"#b84a2e", flexShrink:0, alignSelf:"stretch", minHeight:"36px" }} />
                  <div>
                    <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:"0.85rem", color:"#1a1410", marginBottom:"3px" }}>{item.h}</p>
                    <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.78rem", color:"#7a6a5a", lineHeight:1.55 }}>{item.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* quote */}
          <div className="reveal" style={{ marginTop:"2.5rem", padding:"2rem 2rem 2rem 2.5rem", borderLeft:"3px solid #c0622a", background:"rgba(192,98,42,0.05)", borderRadius:"0 12px 12px 0" }}>
            <p className="serif" style={{ fontSize:"clamp(1rem,2.5vw,1.3rem)", fontWeight:700, fontStyle:"italic", color:"#1a1410", lineHeight:1.5 }}>
              "Teknologi adalah alat — karakter manusia yang menentukan arahnya."
            </p>
            <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.7rem", color:"#7a6a5a", marginTop:"0.75rem", letterSpacing:"0.1em", textTransform:"uppercase" }}>Refleksi Landasan Pendidikan</p>
          </div>
        </div>
      </section>

      <div style={{ height:"1px", background:"rgba(26,20,16,0.07)", maxWidth:"900px", margin:"0 auto" }} />

      {/* ══════════════════════════════════════
          ERA 4.0
      ══════════════════════════════════════ */}
      <section id="era40" style={{ position:"relative", padding:"5rem 0", background:"#f5f0e8" }}>

        <div style={{ position:"absolute", top:0, left:0, width:"3px", height:"100%", background:"#8b6b3d", opacity:0.2 }} />

        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 1.5rem" }}>

          <div className="reveal" style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"1rem" }}>
            <div style={{ width:"24px", height:"2px", background:"#8b6b3d" }} />
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#7a6a5a" }}>Peran Landasan Pendidikan</span>
          </div>

          <h2 className="reveal serif" style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:"3rem", color:"#1a1410" }}>
            Revolusi 4.0,{" "}<span style={{ color:"#c0622a" }}>Society 5.0</span>
            <br />&amp; Era <span style={{ fontStyle:"italic" }}>VUCA</span>
          </h2>

          <div style={{ display:"flex", flexDirection:"column" }}>
            {[
              { icon:"⚙️", color:"#c0622a",  bg:"rgba(192,98,42,0.1)",  label:"Revolusi Industri 4.0", tag:"Teknologi & Industri", body:"Teknologi digital — AI, IoT, big data — mengubah fundamental cara manusia belajar, bekerja, dan berkomunikasi. Pendidikan dituntut menghasilkan lulusan yang adaptif dan melek teknologi." },
              { icon:"🌐", color:"#5a8a5e",  bg:"rgba(90,138,94,0.1)",  label:"Society 5.0",           tag:"Humanisasi Teknologi",  body:"Visi yang menempatkan manusia sebagai pusat kemajuan teknologi. Pendidikan harus memastikan teknologi meningkatkan martabat manusia — bukan menggantikan nilai kemanusiaan." },
              { icon:"🌪️", color:"#b84a2e",  bg:"rgba(184,74,46,0.1)",   label:"Era VUCA",              tag:"Ketidakpastian Global", body:"Volatile, Uncertain, Complex, Ambiguous. Pendidikan berbasis landasan yang kuat adalah bekal utama menghadapi perubahan yang tidak bisa diprediksi." },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:"1.5rem", padding:"2rem 0", borderBottom: i<2 ? "1px solid rgba(26,20,16,0.07)" : "none", alignItems:"start" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:item.bg, border:`1px solid ${item.color}`, borderWidth:"1px", borderStyle:"solid", borderColor:`${item.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem" }}>
                    {item.icon}
                  </div>
                  <span className="serif" style={{ fontSize:"2.5rem", fontWeight:900, color:"rgba(26,20,16,0.05)", lineHeight:1 }}>{String(i+1).padStart(2,"0")}</span>
                </div>
                <div style={{ paddingTop:"4px" }}>
                  <span style={{ display:"inline-block", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:item.color, background:`${item.color}18`, padding:"3px 10px", borderRadius:"99px", marginBottom:"0.6rem" }}>{item.tag}</span>
                  <h3 className="serif" style={{ fontWeight:700, fontSize:"1.2rem", color:"#1a1410", marginBottom:"0.5rem" }}>{item.label}</h3>
                  <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.83rem", lineHeight:1.7, color:"#7a6a5a" }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height:"1px", background:"rgba(26,20,16,0.07)", maxWidth:"900px", margin:"0 auto" }} />

      {/* ══════════════════════════════════════
          KRITIK PANCASILA
      ══════════════════════════════════════ */}
      <section id="kritik" style={{ position:"relative", padding:"5rem 0", background:"#faf7f2" }}>

        <div style={{ position:"absolute", top:0, right:0, width:"3px", height:"100%", background:"#b84a2e", opacity:0.2 }} />

        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 1.5rem" }}>

          <div className="reveal" style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"1rem" }}>
            <div style={{ width:"24px", height:"2px", background:"#b84a2e" }} />
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#7a6a5a" }}>Evaluasi Kritis</span>
          </div>

          <h2 className="reveal serif" style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:"0.5rem", color:"#1a1410" }}>
            Implementasi Nilai <span style={{ fontStyle:"italic", color:"#b84a2e" }}>Pancasila</span>
          </h2>
          <p className="reveal" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#7a6a5a", fontSize:"0.85rem", marginBottom:"3rem" }}>dalam Praktik Pendidikan Indonesia</p>

          <div style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>
  {[
    {
      sila:"Sila 1", label:"Ketuhanan", color:"#c0622a", bg:"rgba(192,98,42,0.07)", n:"1",
      paragraf:`Sila Ketuhanan Yang Maha Esa menuntut pendidikan yang tidak hanya mengajarkan ritual keagamaan, tetapi juga membentuk karakter toleran dan berakhlak mulia. Faktanya, pendidikan agama di banyak sekolah masih berfokus pada aspek kognitif dan hafalan — siswa tahu nama-nama ibadah, namun belum tentu menghayati nilai di baliknya. Akibatnya, intoleransi antarumat beragama masih kerap muncul di lingkungan sekolah. Pendidikan perlu bergeser dari sekadar "mengajarkan agama" menjadi "membentuk manusia beragama" yang benar-benar hidup berdampingan secara damai.`
    },
    {
      sila:"Sila 2", label:"Kemanusiaan", color:"#b84a2e", bg:"rgba(184,74,46,0.07)", n:"2",
      paragraf:`Sila Kemanusiaan yang Adil dan Beradab menghendaki pendidikan yang memanusiakan manusia. Namun realitas di lapangan memperlihatkan masih maraknya perundungan, kekerasan fisik, dan diskriminasi di lingkungan sekolah. Ini bukan semata masalah individu, melainkan cerminan sistem pendidikan yang belum sepenuhnya menanamkan empati dan penghargaan terhadap sesama. Kurikulum yang terlalu berorientasi pada nilai akademik seringkali mengorbankan pendidikan karakter. Internalisasi nilai kemanusiaan harus dimulai dari cara guru memperlakukan siswa, dari budaya sekolah yang diciptakan, bukan sekadar materi pelajaran di kelas.`
    },
    {
      sila:"Sila 3", label:"Persatuan", color:"#5a8a5e", bg:"rgba(90,138,94,0.07)", n:"3",
      paragraf:`Indonesia memiliki ribuan pulau dan ratusan suku bangsa, namun sistem pendidikan belum sepenuhnya mampu menerjemahkan keberagaman itu menjadi kekuatan persatuan. Kesenjangan mutu antara sekolah di kota besar dan daerah 3T masih sangat tajam — guru berkualitas, fasilitas memadai, dan akses internet yang stabil masih menjadi kemewahan di banyak pelosok negeri. Kondisi ini secara tidak langsung menciptakan kesenjangan generasi: anak-anak di kota siap bersaing global, sementara anak-anak di daerah terpencil berjuang hanya untuk sekadar menuntaskan pendidikan dasar. Persatuan sejati dimulai dari pemerataan kesempatan belajar.`
    },
    {
      sila:"Sila 4–5", label:"Kerakyatan & Keadilan", color:"#8b6b3d", bg:"rgba(139,107,61,0.07)", n:"4",
      paragraf:`Kebijakan pendidikan Indonesia masih banyak yang bersifat top-down — dirumuskan di pusat tanpa cukup melibatkan komunitas lokal, orang tua, dan bahkan guru di lapangan. Sila keempat menuntut pendidikan yang demokratis dan partisipatif, sementara sila kelima menghendaki keadilan sosial yang menyeluruh. Namun akses terhadap perangkat digital dan koneksi internet yang memadai masih sangat timpang secara geografis dan ekonomi. Pandemi COVID-19 telah mengekspos secara gamblang betapa lebarnya jurang digital ini. Keadilan pendidikan bukan berarti semua mendapat hal yang sama, melainkan semua mendapat apa yang mereka butuhkan untuk bisa berkembang.`
    },
  ].map((item, i) => (
    <div key={i} className="reveal" style={{ position:"relative", overflow:"hidden", padding:"2rem", background:item.bg, border:`1px solid ${item.color}30`, borderRadius:"16px" }}>
      <span className="serif" style={{ position:"absolute", right:"-8px", bottom:"-16px", fontSize:"5.5rem", fontWeight:900, color:"rgba(26,20,16,0.04)", lineHeight:1, pointerEvents:"none", userSelect:"none" }}>{item.n}</span>
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"0.75rem" }}>
        <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.18em", textTransform:"uppercase", color:item.color }}>{item.sila}</span>
        <div style={{ width:"1px", height:"12px", background:`${item.color}50` }} />
        <h3 className="serif" style={{ fontWeight:700, fontSize:"1.1rem", color:"#1a1410" }}>{item.label}</h3>
      </div>
      <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.85rem", lineHeight:1.8, color:"rgba(26,20,16,0.65)" }}>{item.paragraf}</p>
    </div>
  ))}
</div>
        </div>
      </section>

      <div style={{ height:"1px", background:"rgba(26,20,16,0.07)", maxWidth:"900px", margin:"0 auto" }} />

      {/* ══════════════════════════════════════
          STRATEGI
      ══════════════════════════════════════ */}
      <section id="strategi" style={{ position:"relative", padding:"5rem 0 8rem", background:"#f5f0e8" }}>

        <div style={{ position:"absolute", top:0, left:0, width:"3px", height:"100%", background:"#5a8a5e", opacity:0.2 }} />

        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 1.5rem" }}>

          <div className="reveal" style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"1rem" }}>
            <div style={{ width:"24px", height:"2px", background:"#5a8a5e" }} />
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#7a6a5a" }}>Integrasi Landasan Pendidikan</span>
          </div>

          <h2 className="reveal serif" style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:"0.5rem", color:"#1a1410" }}>
            Strategi Menghadapi <span style={{ fontStyle:"italic", color:"#c0622a" }}>Era VUCA</span>
          </h2>
          <p className="reveal" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#7a6a5a", fontSize:"0.85rem", marginBottom:"3rem" }}>
            Membentuk generasi unggul melalui integrasi lima landasan pendidikan
          </p>

          <div style={{ display:"flex", flexDirection:"column" }}>
            {[
              { no:"01", color:"#c0622a", bg:"rgba(192,98,42,0.1)", icon:"💡", landasan:"Filosofis",
  strategi:"Menanamkan Pancasila sebagai falsafah hidup",
  deskripsi:`Landasan filosofis pendidikan Indonesia bersumber pada Pancasila dan UUD 1945 yang menjunjung tinggi harkat dan martabat manusia. Artinya, pendidikan bukan sekadar transmisi pengetahuan, melainkan proses pembentukan manusia seutuhnya yang beriman, berakhlak, dan berpikir kritis. Dalam menghadapi era VUCA, landasan ini menjadi kompas — ketika segalanya berubah cepat dan penuh ketidakpastian, nilai-nilai Pancasila menjadi pegangan yang tidak goyah. Kurikulum perlu dirancang agar siswa tidak sekadar hafal sila-sila, tetapi benar-benar menghidupinya dalam keseharian.` },
{ no:"02", color:"#8b6b3d", bg:"rgba(139,107,61,0.1)", icon:"📜", landasan:"Historis",
  strategi:"Belajar dari perjalanan pendidikan bangsa",
  deskripsi:`Sejarah pendidikan Indonesia adalah sejarah perjuangan panjang — dari era kolonial yang membatasi akses belajar, hingga semangat Ki Hajar Dewantara yang memperjuangkan pendidikan untuk semua. Memahami akar historis ini penting agar generasi muda tidak hanya tahu ke mana harus pergi, tetapi juga mengerti dari mana mereka berasal. Landasan historis mengajarkan bahwa setiap reformasi pendidikan perlu mempertimbangkan konteks budaya dan perjalanan bangsa, bukan sekadar mengadopsi model pendidikan asing tanpa adaptasi yang bermakna.` },
{ no:"03", color:"#5a8a5e", bg:"rgba(90,138,94,0.1)", icon:"🏘️", landasan:"Sosiologis",
  strategi:"Pendidikan berbasis komunitas dan gotong royong",
  deskripsi:`Pendidikan tidak terjadi di ruang hampa — ia hidup dalam ekosistem sosial yang melibatkan keluarga, masyarakat, dan lembaga di sekitarnya. Landasan sosiologis mengingatkan bahwa sekolah adalah cerminan masyarakat, dan masyarakat yang sehat adalah prasyarat pendidikan yang bermakna. Strategi pendidikan berbasis komunitas berarti melibatkan orang tua secara aktif, menggandeng tokoh lokal sebagai sumber belajar, dan menciptakan ruang bagi siswa untuk belajar langsung dari realitas sosial di sekitar mereka. Di era VUCA, kemampuan berkolaborasi dan membangun jaringan sosial adalah keterampilan yang tidak kalah pentingnya dari literasi digital.` },
{ no:"04", color:"#8b6b3d", bg:"rgba(139,107,61,0.1)", icon:"🌿", landasan:"Antropologis",
  strategi:"Pendidikan berbasis kearifan lokal dan budaya",
  deskripsi:`Indonesia adalah rumah bagi lebih dari 300 kelompok etnis dengan kekayaan budaya yang luar biasa. Landasan antropologis menegaskan bahwa keberagaman ini bukan hambatan, melainkan aset strategis dalam membangun identitas pendidikan yang khas Indonesia. Kearifan lokal — sistem gotong royong, nilai adat, seni tradisional — mengandung kebijaksanaan yang relevan untuk menjawab tantangan zaman. Pendidikan yang mengintegrasikan budaya lokal tidak hanya memperkuat identitas siswa, tetapi juga melatih mereka untuk berpikir dari perspektif yang beragam, sebuah kemampuan krusial di dunia yang semakin terhubung.` },
{ no:"05", color:"#b84a2e", bg:"rgba(184,74,46,0.1)", icon:"🧠", landasan:"Psikologis",
  strategi:"Pembelajaran berpusat pada peserta didik",
  deskripsi:`Setiap anak adalah individu unik dengan gaya belajar, kecepatan perkembangan, dan kebutuhan emosional yang berbeda-beda. Landasan psikologis pendidikan menegaskan bahwa efektivitas pembelajaran sangat bergantung pada seberapa baik kita memahami kondisi psikologis peserta didik. Di era penuh tekanan seperti sekarang, kesehatan mental siswa bukan isu pinggiran — ia adalah fondasi. Pendekatan pembelajaran yang responsif secara emosional, yang memberi ruang untuk gagal dan bangkit kembali, yang menghargai proses bukan hanya hasil, adalah wujud nyata dari pendidikan yang berpusat pada manusia seutuhnya.` },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ position:"relative", display:"grid", gridTemplateColumns:"56px 1fr", gap:"1.25rem", paddingBottom:"2rem" }}>
                {/* connector line */}
                {i < 4 && <div style={{ position:"absolute", left:"23px", top:"52px", bottom:"0", width:"1px", background:"rgba(26,20,16,0.07)" }} />}

                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
                  <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.1em", color:item.color, opacity:0.8 }}>{item.no}</span>
                  <div style={{ width:"46px", height:"46px", borderRadius:"14px", background:item.bg, border:`1px solid ${item.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem", flexShrink:0 }}>
                    {item.icon}
                  </div>
                </div>

                <div style={{ paddingTop:"2px" }}>
                  <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:item.color, display:"block", marginBottom:"0.35rem" }}>
                    Landasan {item.landasan}
                  </span>
                  <h3 className="serif" style={{ fontWeight:700, fontSize:"1.05rem", color:"#1a1410", marginBottom:"0.4rem", lineHeight:1.3 }}>{item.strategi}</h3>
                  <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.8rem", lineHeight:1.7, color:"#7a6a5a" }}>{item.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div className="reveal" style={{ marginTop:"3rem", padding:"1.25rem 1.5rem", background:"#ede8db", border:"1px solid rgba(26,20,16,0.08)", borderRadius:"12px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem" }}>
            <div>
              <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:"0.8rem", color:"#1a1410" }}>Irenia Maisa Kamila</p>
              <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.65rem", color:"#7a6a5a", letterSpacing:"0.1em" }}>NIM 2506031</p>
            </div>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {["Landasan Pendidikan","2025","Infografis"].map(t => (
                <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 12px", background:"rgba(26,20,16,0.05)", border:"1px solid rgba(26,20,16,0.08)", borderRadius:"99px", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"0.7rem", color:"#7a6a5a" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}