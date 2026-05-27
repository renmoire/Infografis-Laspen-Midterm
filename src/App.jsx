import { useEffect, useState } from "react"

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const sections = ["hero", "analisis", "era40", "kritik", "strategi"]
    const observers = sections.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.35 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])

  // Close menu on scroll
  useEffect(() => {
    const onScroll = () => { if (menuOpen) setMenuOpen(false) }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [menuOpen])

  const navLinks = [
    { id: "analisis", label: "Analisis" },
    { id: "era40",    label: "Peran" },
    { id: "kritik",   label: "Kritik" },
    { id: "strategi", label: "Strategi" },
  ]

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 80
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: "smooth" })
    setMenuOpen(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-up")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f1e] font-sans text-[#111]">

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled || menuOpen ? "rgba(10, 15, 30, 0.92)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(18px)" : "none",
          borderBottom: scrolled || menuOpen ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          boxShadow: scrolled || menuOpen ? "0 4px 30px rgba(0,0,0,0.25)" : "none",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo("hero")}
            className="text-white font-black text-sm tracking-wide hover:text-blue-300 transition-colors duration-300"
          >
            Irenia Maisa Kamila (2506031)<span className="text-blue-400">.</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="relative px-3 py-1.5 text-xs font-semibold tracking-wide rounded-full transition-all duration-300 hover:text-white hover:bg-white/10"
                style={{
                  color: activeSection === id ? "#fff" : "rgba(255,255,255,0.45)",
                  background: activeSection === id ? "rgba(37,99,255,0.22)" : "transparent",
                  border: activeSection === id ? "1px solid rgba(99,153,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg transition-all duration-300 hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-300 origin-center"
              style={{
                transform: menuOpen ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-300"
              style={{
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-300 origin-center"
              style={{
                transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: menuOpen ? "260px" : "0px",
            opacity: menuOpen ? 1 : 0,
          }}
        >
          <div className="px-6 pb-4 flex flex-col gap-2">
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full text-left px-4 py-3 text-sm font-semibold tracking-wide rounded-xl transition-all duration-200"
                style={{
                  color: activeSection === id ? "#fff" : "rgba(255,255,255,0.55)",
                  background: activeSection === id ? "rgba(37,99,255,0.22)" : "rgba(255,255,255,0.04)",
                  border: activeSection === id ? "1px solid rgba(99,153,255,0.35)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── ANIMATED BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="twinkle absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.6,
            }}
          />
        ))}
        <div className="float absolute" style={{ top: "10%", right: "8%" }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 opacity-80 shadow-lg shadow-blue-400/40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-6 border-2 border-blue-300/50 rounded-full spin-slow" />
          </div>
        </div>
        <div className="float-slow absolute" style={{ top: "60%", right: "15%" }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 opacity-60" />
        </div>
        <div className="float-slower absolute" style={{ top: "30%", left: "5%" }}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-blue-500 opacity-50" />
        </div>
        <div className="drift absolute" style={{ top: "75%", left: "10%" }}>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-300 to-indigo-500 opacity-70" />
        </div>
        <div className="float absolute text-5xl opacity-20" style={{ top: "20%", left: "15%", animationDelay: "1.5s" }}>📖</div>
        <div className="twinkle-slow absolute text-4xl opacity-20" style={{ top: "50%", left: "3%" }}>✦</div>
        <div className="twinkle absolute text-xl opacity-20" style={{ top: "85%", right: "5%" }}>✦</div>
      </div>

      {/* ── HERO ── */}
      <section id="hero" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-blue-300 border border-blue-800 rounded-full px-3 py-1">
          Landasan Pendidikan
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mt-6 leading-tight text-white">
          Pendidikan sebagai<br />
          <span className="text-blue-400">Gerakan Semesta</span>
        </h1>
        <p className="text-blue-200 mt-3 tracking-wide uppercase font-medium text-sm">
          di Era Society 5.0
        </p>
        <div className="reveal mt-8 rounded-xl p-6 glass-card">
          <p className="text-white/70 text-base leading-relaxed">
            Pendidikan bukan hanya proses belajar, tetapi fondasi pembentukan karakter, moral, dan kesiapan generasi menghadapi perubahan global.
          </p>
        </div>
      </section>

      {/* ── SECTION 2 — ANALISIS KRITIS ── */}
      <section id="analisis" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40 border border-white/10 rounded-full px-3 py-1">
          Analisis Kritis
        </span>
        <h2 className="text-white font-black text-xl mt-4 mb-6">Dampak Perkembangan Teknologi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="reveal card-hover glass-card-dark rounded-xl p-6">
            <span className="text-xs font-bold tracking-widest uppercase text-green-600 bg-green-950/50 px-3 py-1 rounded-full">Positif</span>
            <ul className="mt-4 space-y-3 text-white/70 text-sm">
              <li className="flex gap-2"><span className="text-green-500 font-bold">✔</span> Akses informasi lebih cepat</li>
              <li className="flex gap-2"><span className="text-green-500 font-bold">✔</span> Pembelajaran digital semakin luas</li>
              <li className="flex gap-2"><span className="text-green-500 font-bold">✔</span> Teknologi mendukung inovasi pendidikan</li>
            </ul>
          </div>
          <div className="reveal card-hover glass-card-dark rounded-xl p-6">
            <span className="text-xs font-bold tracking-widest uppercase text-[#FFFFFF]/70 bg-[#FFFFFF]/19 px-3 py-1 rounded-full">Negatif</span>
            <ul className="mt-4 space-y-3 text-white/70 text-sm">
              <li className="flex gap-2"><span className="text-red-400 font-bold">✖</span> Menurunnya interaksi sosial</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">✖</span> Lunturnya nilai budaya dan moral</li>
              <li className="flex gap-2"><span className="text-red-400 font-bold">✖</span> Ketergantungan terhadap teknologi</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — ERA 4.0 & VUCA ── */}
      <section id="era40" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40 border border-white/10 rounded-full px-3 py-1">
          Peran Landasan Pendidikan
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {[
            { icon: "⚙️", title: "Revolusi Industri 4.0", body: "Teknologi digital mengubah cara manusia belajar, bekerja, dan berkomunikasi.", blue: true },
            { icon: "🌐", title: "Society 5.0", body: "Teknologi harus digunakan untuk meningkatkan kualitas hidup manusia, bukan menggantikan nilai kemanusiaan.", blue: false },
            { icon: "🌪️", title: "Era VUCA", body: "Pendidikan harus mampu menghadapi perubahan yang cepat, kompleks, dan penuh ketidakpastian.", blue: true },
          ].map((card, i) => (
            <div key={i} className={`reveal card-hover rounded-xl p-6 ${card.blue ? "glass-card-blue text-white" : "glass-card-light text-[#111]"}`}
              style={{ animationDelay: `${i * 0.15}s` }}>
              <span className="text-3xl">{card.icon}</span>
              <h3 className="font-black text-lg mt-3">{card.title}</h3>
              <p className={`text-sm mt-2 leading-relaxed ${card.blue ? "text-blue-100" : "text-[#666]"}`}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4 — KRITIK PANCASILA ── */}
      <section id="kritik" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40 border border-white/10 rounded-full px-3 py-1">
          Kritik Pendidikan
        </span>
        <h2 className="text-white font-black text-xl mt-4 mb-2">Kritik Implementasi Nilai Pancasila</h2>
        <p className="text-white/50 text-sm mb-6">dalam Praktik Pendidikan Indonesia</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              sila: "Sila 1", label: "Ketuhanan",
              kritik: "Pendidikan agama cenderung ritualistik, belum sepenuhnya membentuk akhlak dan toleransi antar umat beragama.",
            },
            {
              sila: "Sila 2", label: "Kemanusiaan",
              kritik: "Bullying dan kekerasan di sekolah masih marak, menandakan lemahnya internalisasi nilai kemanusiaan.",
            },
            {
              sila: "Sila 3", label: "Persatuan",
              kritik: "Kesenjangan kualitas pendidikan antara daerah 3T dan kota besar mencerminkan belum terwujudnya persatuan dalam akses pendidikan.",
            },
            {
              sila: "Sila 4 & 5", label: "Kerakyatan & Keadilan",
              kritik: "Kebijakan pendidikan sering top-down tanpa melibatkan komunitas lokal. Akses internet dan perangkat digital masih timpang.",
            },
          ].map((item, i) => (
            <div key={i} className="reveal card-hover glass-card rounded-xl p-6" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">{item.sila}</span>
                  <p className="text-white font-black text-lg mt-2">{item.label}</p>
                </div>
              </div>
              <p className="text-white/70 text-medium leading-relaxed">{item.kritik}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5 — STRATEGI INTEGRASI LANDASAN ── */}
      <section id="strategi" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-35">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40 border border-white/10 rounded-full px-3 py-1">
          Strategi
        </span>
        <h2 className="text-white font-black text-xl mt-4 mb-2">Strategi Integrasi Landasan Pendidikan</h2>
        <p className="text-white/50 text-sm mb-6">Menghadapi Era VUCA & Membentuk Generasi Unggul</p>

        <div className="space-y-3">
          {[
            {
              no: "01", warna: "from-blue-600 to-blue-800", landasan: "Filosofis",
              icon: "💡",
              strategi: "Menanamkan Pancasila sebagai falsafah hidup",
              deskripsi: "Pendidikan harus berakar pada nilai-nilai Pancasila sebagai panduan berpikir dan bertindak, bukan sekadar hafalan.",
            },
            {
              no: "02", warna: "from-indigo-600 to-indigo-800", landasan: "Historis",
              icon: "📜",
              strategi: "Belajar dari perjalanan pendidikan bangsa",
              deskripsi: "Mengintegrasikan sejarah perjuangan pendidikan Indonesia agar siswa memahami akar dan identitas bangsa.",
            },
            {
              no: "03", warna: "from-violet-600 to-violet-800", landasan: "Sosiologis",
              icon: "🏘️",
              strategi: "Pendidikan berbasis komunitas dan gotong royong",
              deskripsi: "Melibatkan keluarga, masyarakat, dan lembaga sosial dalam proses pendidikan sebagai ekosistem belajar.",
            },
            {
              no: "04", warna: "from-purple-600 to-purple-800", landasan: "Antropologis",
              icon: "🌿",
              strategi: "Pendidikan berbasis kearifan lokal dan budaya",
              deskripsi: "Mengakui keberagaman budaya Nusantara sebagai kekuatan, bukan hambatan, dalam membangun karakter bangsa.",
            },
            {
              no: "05", warna: "from-blue-700 to-cyan-700", landasan: "Psikologis",
              icon: "🧠",
              strategi: "Pendekatan pembelajaran berpusat pada peserta didik",
              deskripsi: "Memahami tahap perkembangan, gaya belajar, dan kebutuhan emosional siswa untuk menciptakan pembelajaran yang bermakna.",
            },
          ].map((item, i) => (
            <div key={i} className="reveal card-hover flex gap-4 glass-card rounded-xl p-5 overflow-hidden relative"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.warna} flex items-center justify-center text-xl`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[15px] font-black text-white/30 tracking-widest">{item.no}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 bg-blue-900/20 px-2 py-0.5 rounded-full">Landasan {item.landasan}</span>
                </div>
                <p className="text-white font-black text-medium">{item.strategi}</p>
                <p className="text-white/55 text-medium mt-1 leading-relaxed">{item.deskripsi}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default App