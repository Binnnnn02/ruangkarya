import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Feather,
  Bookmark,
  Menu,
  X,
  Clock3,
  Plus,
  LayoutDashboard,
  LogOut,
  LockKeyhole,
  Sparkles,
  Check,
  SlidersHorizontal,
  Paperclip,
  FileText,
  Download,
} from "lucide-react";
import { fetchWorks, hasAdminAccess, supabase, WORK_FILE_BUCKET } from "./supabase.js";
import "./style.css";
const cats = [
  "Semua karya",
  "Naskah Pentas",
  "Jurnal",
  "Makalah",
  "Puisi",
  "Esai",
  "Cerita Pendek",
];
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const fileTypes = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  odt: "application/vnd.oasis.opendocument.text",
  rtf: "application/rtf",
  txt: "text/plain",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  epub: "application/epub+zip",
};
const acceptedFiles = Object.keys(fileTypes).map((ext) => `.${ext}`).join(",");
function getSaved() {
  try {
    return JSON.parse(localStorage.getItem("rk_saved")) || [];
  } catch {
    return [];
  }
}
function App() {
  const [works, setWorks] = useState([]);
  const [category, setCategory] = useState("Semua karya");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(getSaved);
  const [showSaved, setShowSaved] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "Jurnal",
    excerpt: "",
    body: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const searchRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const isAdminPath = window.location.pathname.startsWith("/admin");
  useEffect(() => {
    let alive = true;
    const initialize = async () => {
      if (!supabase) return;
      try {
        const publicWorks = await fetchWorks();
        if (alive && publicWorks) setWorks(publicWorks);
      } catch (err) {
        console.error("Tidak dapat memuat karya dari Supabase:", err.message);
      }
      if (isAdminPath) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && await hasAdminAccess(session.user.id)) {
          try {
            const adminWorks = await fetchWorks(true);
            if (alive) { setWorks(adminWorks || []); setAdmin(true); }
          } catch (err) {
            console.error("Tidak dapat memuat dashboard:", err.message);
          }
        }
      }
    };
    initialize();
    return () => { alive = false; };
  }, [isAdminPath]);
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    localStorage.setItem("rk_saved", JSON.stringify(saved));
  }, [saved]);
  const filtered = useMemo(
    () =>
      works.filter(
        (w) =>
          (!showSaved || saved.includes(w.id)) &&
          (category === "Semua karya" || w.category === category) &&
          `${w.title} ${w.author} ${w.category} ${w.excerpt}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [works, category, query, showSaved, saved],
  );
  function notify(s) {
    setToast(s);
    setTimeout(() => setToast(""), 2400);
  }
  async function auth(e) {
    e.preventDefault();
    setError("");
    try {
      if (!supabase) throw new Error("Konfigurasi Supabase belum diisi.");
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: login, password: pass });
      if (loginError) throw loginError;
      if (!(await hasAdminAccess(data.user.id))) {
        await supabase.auth.signOut();
        throw new Error("Akun ini belum memiliki akses admin.");
      }
      const adminWorks = await fetchWorks(true);
      setWorks(adminWorks || []);
      setAdmin(true);
    } catch (err) {
      setError(err.message || "Tidak dapat terhubung ke Supabase.");
    }
  }
  async function addWork(e) {
    e.preventDefault();
    if (!form.title || !form.author || !form.excerpt || !form.body) return;
    if (attachmentFile && attachmentFile.size > MAX_FILE_SIZE) {
      notify("Ukuran file maksimal 25 MB.");
      return;
    }
    const work = {
      ...form,
      date: new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
      read: Math.max(1, Math.ceil(form.body.split(" ").length / 180)),
      views: "0",
      tag: form.category.toUpperCase(),
      color: ["sky", "lavender", "mint", "gold"][works.length % 4],
    };
    let uploadedPath = null;
    try {
      if (!supabase) throw new Error("Konfigurasi Supabase belum diisi.");
      setUploading(true);
      let attachment = removeAttachment ? null : currentAttachment;
      if (attachmentFile) {
        const ext = attachmentFile.name.split(".").pop()?.toLowerCase();
        const contentType = fileTypes[ext];
        if (!contentType) throw new Error("Format file ini belum didukung.");
        const safeName = attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        uploadedPath = `${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(WORK_FILE_BUCKET)
          .upload(uploadedPath, attachmentFile, { contentType, upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicFile } = supabase.storage.from(WORK_FILE_BUCKET).getPublicUrl(uploadedPath);
        attachment = {
          file_url: publicFile.publicUrl,
          file_path: uploadedPath,
          file_name: attachmentFile.name,
          file_type: contentType,
          file_size: attachmentFile.size,
        };
      }
      const values = {
        ...work,
        file_url: attachment?.file_url || null,
        file_path: attachment?.file_path || null,
        file_name: attachment?.file_name || null,
        file_type: attachment?.file_type || null,
        file_size: attachment?.file_size || null,
      };
      const result = editingId
        ? await supabase.from("works").update(values).eq("id", editingId)
        : await supabase.from("works").insert(values);
      if (result.error) throw result.error;
      uploadedPath = null;
      if (currentAttachment?.file_path && currentAttachment.file_path !== attachment?.file_path) {
        await supabase.storage.from(WORK_FILE_BUCKET).remove([currentAttachment.file_path]);
      }
      setWorks((await fetchWorks(true)) || []);
      setEditingId(null);
      setAttachmentFile(null);
      setCurrentAttachment(null);
      setRemoveAttachment(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      setForm({
        title: "",
        author: "",
        category: "Jurnal",
        excerpt: "",
        body: "",
      });
      notify(editingId ? "Perubahan karya berhasil disimpan." : "Karya berhasil diterbitkan.");
    } catch (err) {
      if (uploadedPath) await supabase?.storage.from(WORK_FILE_BUCKET).remove([uploadedPath]);
      notify(err.message || "Gagal menyimpan karya.");
    } finally {
      setUploading(false);
    }
  }
  function toggleSave(id) {
    setSaved((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
    notify(
      saved.includes(id)
        ? "Dihapus dari bacaan tersimpan."
        : "Disimpan untuk dibaca nanti.",
    );
  }
  if (window.location.pathname === "/kebijakan-privasi")
    return (
      <main className="privacy-page">
        <a className="brand privacy-brand" href="/">
          <span className="brand-mark"><Feather size={18} /></span> ruang<span>karya</span>
        </a>
        <article className="privacy-card">
          <a className="privacy-back" href="/">← Kembali ke beranda</a>
          <div className="eyebrow"><LockKeyhole size={13} /> PRIVASI PEMBACA</div>
          <h1>Kebijakan Privasi</h1>
          <p className="privacy-updated">Terakhir diperbarui: 13 November 2026</p>
          <p>Ruang Karya menjaga informasi yang kamu berikan dan menggunakannya hanya untuk menjalankan layanan publikasi ini. Kebijakan ini menjelaskan data yang disimpan dan cara mengajukan permintaan perubahan atau penghapusan.</p>
          <h2>Data yang kami simpan</h2>
          <ul>
            <li>Karya yang diterbitkan beserta judul, nama penulis, kategori, pengantar, dan lampirannya.</li>
            <li>Alamat email yang dimasukkan ke formulir newsletter.</li>
            <li>Data akun dan sesi admin yang diproses oleh Supabase Auth.</li>
            <li>Daftar bacaan tersimpan pada penyimpanan lokal browser dan tidak dikirim ke server.</li>
          </ul>
          <h2>Bagaimana data digunakan</h2>
          <p>Data karya digunakan untuk menampilkan publikasi. Email digunakan untuk mengelola langganan newsletter. Data autentikasi digunakan untuk melindungi dashboard admin. Kami tidak menjual data pribadi atau menggunakannya untuk iklan.</p>
          <h2>Karya dan lampiran</h2>
          <p>Karya dan file yang diterbitkan dapat dibaca atau diunduh oleh publik. Jangan unggah dokumen berisi informasi rahasia atau data pribadi yang tidak ingin dibagikan.</p>
          <h2>Penyimpanan dan layanan pihak ketiga</h2>
          <p>Database, autentikasi, dan file disimpan melalui Supabase sesuai pengaturan proyek Ruang Karya. Situs juga memuat font dari Google Fonts. Bacaan tersimpan tetap berada di browser yang kamu gunakan.</p>
          <h2>Retensi dan permintaan privasi</h2>
          <p>Karya dan lampiran disimpan sampai dihapus oleh admin. Kamu dapat meminta penghapusan alamat email newsletter atau menghubungi kami untuk pertanyaan privasi melalui <a href="mailto:ganendrakaivansemeru@gmail.com">ganendrakaivansemeru@gmail.com</a>.</p>
        </article>
        <div className="privacy-foot">© 2026 Ruang Karya · Ditulis dengan hati, dibaca dengan rasa.</div>
      </main>
    );
  if (isAdminPath && !admin)
    return (
      <main className="auth-page">
        <div className="auth-orb orb-a" />
        <div className="auth-orb orb-b" />
        <a className="brand auth-brand" href="/">
          <span className="brand-mark">
            <Feather size={19} />
          </span>{" "}
          ruang<span>karya</span>
        </a>
        <form className="auth-card" onSubmit={auth}>
          <span className="eyebrow">AREA TERBATAS</span>
          <div className="auth-icon">
            <LockKeyhole size={24} />
          </div>
          <h1>Selamat datang kembali.</h1>
          <p>Masuk untuk mengelola karya dan publikasi.</p>
          <label>
            Email admin Supabase
            <input
              required
              type="email"
              autoComplete="email"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="nama@email.com"
            />
          </label>
          <label>
            Kata sandi
            <input
              required
              type="password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Masukkan kata sandi"
            />
          </label>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary auth-submit">
            Masuk ke dashboard <ArrowRight size={16} />
          </button>
          <a className="back-home" href="/">
            ← Kembali ke beranda
          </a>
        </form>
        <div className="auth-foot">
          Ruang Karya · Tempat ide menemukan pembacanya
        </div>
      </main>
    );
  if (isAdminPath && admin)
    return (
      <div className="admin-shell">
        <aside className="admin-side">
          <a className="brand" href="/">
            <span className="brand-mark">
              <Feather size={18} />
            </span>{" "}
            ruang<span>karya</span>
          </a>
          <small>RUANG ADMIN</small>
          <div className="side-active">
            <LayoutDashboard size={17} /> Ringkasan
          </div>
          <button
            className="side-link"
            onClick={() =>
              document
                .getElementById("publish-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Plus size={17} /> Tulis karya
          </button>
          <button
            className="side-link"
            onClick={async () => {
              await supabase?.auth.signOut();
              setAdmin(false);
              window.location.href = "/";
            }}
          >
            <LogOut size={17} /> Keluar
          </button>
          <div className="side-note">
            <Sparkles size={17} />
            <b>Setiap karya berarti.</b>
            <span>Terima kasih sudah mengisi ruang ini dengan ide.</span>
          </div>
        </aside>
        <main className="admin-main">
          <div className="admin-top">
            <div>
              <div className="eyebrow">RUANG ADMIN</div>
              <h1>
                Selamat datang, Admin <span>✦</span>
              </h1>
              <p>Berikut yang sedang terjadi di Ruang Karya.</p>
            </div>
            <a href="/" className="btn btn-light">
              Lihat situs <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="stat-grid">
            <div className="stat-card">
              <span>Total karya terbit</span>
              <b>{works.length.toString().padStart(2, "0")}</b>
              <small>
                <BookOpen size={14} /> Koleksi yang terus bertumbuh
              </small>
            </div>
            <div className="stat-card">
              <span>Kategori aktif</span>
              <b>
                {new Set(works.map((w) => w.category)).size
                  .toString()
                  .padStart(2, "0")}
              </b>
              <small>
                <SlidersHorizontal size={14} /> Ragam cara bercerita
              </small>
            </div>
            <div className="stat-card blue-stat">
              <span>Ruang untuk cerita baru</span>
              <b>
                Terbuka <span>↗</span>
              </b>
              <small>Tambahkan karya saat siap</small>
            </div>
          </div>
          <section className="admin-section">
            <div className="section-head">
              <div>
                <span className="eyebrow">PERPUSTAKAAN</span>
                <h2>Karya terbaru</h2>
              </div>
              <span className="count-pill">{works.length} karya</span>
            </div>
            <div className="work-table">
              {works.map((w) => (
                <div className="work-row" key={w.id}>
                  <div className={`work-thumb ${w.color}`}>
                    <BookOpen size={18} />
                  </div>
                  <div className="row-title">
                    <b>{w.title}</b>
                    <span>{w.author}</span>
                  </div>
                  <span className="table-category">{w.category}</span>
                  <span className="table-date">{w.date}</span>
                  <button
                    className="icon-button"
                    title="Ubah karya"
                    aria-label={`Ubah ${w.title}`}
                    onClick={() => {
                      setEditingId(w.id);
                      setForm({ title: w.title, author: w.author, category: w.category, excerpt: w.excerpt, body: w.body });
                      setCurrentAttachment(w.file_url ? { file_url: w.file_url, file_path: w.file_path, file_name: w.file_name, file_type: w.file_type, file_size: w.file_size } : null);
                      setAttachmentFile(null);
                      setRemoveAttachment(false);
                      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
                      document.getElementById("publish-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <Feather size={15} />
                  </button>
                  <button
                    className="icon-button"
                    title="Hapus karya"
                    onClick={async () => {
                      const { error: deleteError } = await supabase.from("works").delete().eq("id", w.id);
                      if (deleteError) notify(deleteError.message);
                      else {
                        if (w.file_path) await supabase.storage.from(WORK_FILE_BUCKET).remove([w.file_path]);
                        setWorks((await fetchWorks(true)) || []);
                      }
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="admin-section publish-section" id="publish-form">
            <div className="section-head">
              <div>
                <span className="eyebrow">PENERBITAN</span>
                <h2>{editingId ? "Ubah karya" : "Terbitkan karya baru"}</h2>
              </div>
            </div>
            <form className="publish-form" onSubmit={addWork}>
              <div className="form-grid">
                <label>
                  Judul karya
                  <input
                    required
                    placeholder="Tuliskan judul yang memikat"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </label>
                <label>
                  Nama penulis
                  <input
                    required
                    placeholder="Nama penulis"
                    value={form.author}
                    onChange={(e) =>
                      setForm({ ...form, author: e.target.value })
                    }
                  />
                </label>
                <label>
                  Kategori
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {cats.slice(1).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Pengantar
                  <textarea
                    required
                    rows="2"
                    placeholder="Satu atau dua kalimat tentang karya ini"
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm({ ...form, excerpt: e.target.value })
                    }
                  />
                </label>
                <label className="full-field">
                  Isi karya
                  <textarea
                    required
                    rows="5"
                    placeholder="Mulai menulis di sini…"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                  />
                </label>
                <label className="full-field file-upload">
                  Lampiran karya <span>Opsional · PDF, Word, PowerPoint, Excel, EPUB, dan teks · Maks. 25 MB</span>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept={acceptedFiles}
                    onChange={(e) => {
                      const nextFile = e.target.files?.[0] || null;
                      if (nextFile && nextFile.size > MAX_FILE_SIZE) {
                        notify("Ukuran file maksimal 25 MB.");
                        e.target.value = "";
                        return;
                      }
                      setAttachmentFile(nextFile);
                      if (nextFile) setRemoveAttachment(false);
                    }}
                  />
                  {attachmentFile && <span className="attachment-preview"><FileText size={15} /> {attachmentFile.name} · {(attachmentFile.size / (1024 * 1024)).toFixed(1)} MB</span>}
                  {!attachmentFile && currentAttachment && !removeAttachment && (
                    <span className="attachment-preview"><Paperclip size={15} /> {currentAttachment.file_name}
                      <button type="button" className="text-button" onClick={() => setRemoveAttachment(true)}>Hapus lampiran</button>
                    </span>
                  )}
                  {removeAttachment && <span className="attachment-preview">Lampiran akan dihapus saat karya disimpan.</span>}
                </label>
              </div>
              <button className="btn btn-primary" disabled={uploading}>
                {uploading ? <span className="loading-dot" /> : editingId ? <Check size={16} /> : <Plus size={16} />} {uploading ? "Mengunggah…" : editingId ? "Simpan perubahan" : "Terbitkan karya"}
              </button>
              {editingId && <button type="button" className="text-button" onClick={() => { setEditingId(null); setForm({ title: "", author: "", category: "Jurnal", excerpt: "", body: "" }); setCurrentAttachment(null); setAttachmentFile(null); setRemoveAttachment(false); if (attachmentInputRef.current) attachmentInputRef.current.value = ""; }}>Batal mengubah</button>}
            </form>
          </section>
        </main>
      </div>
    );
  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <a className="brand" href="#top">
            <span className="brand-mark">
              <Feather size={18} />
            </span>{" "}
            ruang<span>karya</span>
          </a>
          <nav className={mobile ? "nav-open" : ""}>
            <a href="#jelajahi" onClick={() => setMobile(false)}>
              Jelajahi
            </a>
            <a href="#kategori" onClick={() => setMobile(false)}>
              Kategori
            </a>
            <a href="#tentang" onClick={() => setMobile(false)}>
              Tentang
            </a>
          </nav>
          <div className="nav-end">
            <a className="nav-submit" href="mailto:ganendrakaivansemeru@gmail.com">
              Kirim karyamu <ArrowUpRight size={15} />
            </a>
            <button
              className="mobile-toggle"
              onClick={() => setMobile(!mobile)}
              aria-label="Buka menu"
            >
              {mobile ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <main id="top">
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-content">
            <div className="hero-pill">
              <span /> SEBUAH RUANG UNTUK KARYA YANG BERARTI
            </div>
            <h1>
              Ide yang baik
              <br />
              layak <em>tinggal lebih lama.</em>
            </h1>
            <p>
              Naskah, jurnal, makalah, dan cerita dari berbagai sudut pandang.
              Temukan tulisan yang membuatmu berhenti sejenak.
            </p>
            <a className="btn btn-primary hero-cta" href="#jelajahi">
              Temukan bacaanmu <ArrowRight size={16} />
            </a>
            <div className="hero-proof">
              <span>Ditulis dengan hati, dibaca dengan rasa.</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-blob" />
            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />
            <div className="art-card card-back">
              <span className="fake-line short" />
              <span className="fake-line" />
              <span className="fake-line medium" />
              <span className="fake-line" />
              <span className="fake-line short" />
            </div>
            <div className="art-card card-front">
              <span className="card-label">SEBUAH CATATAN</span>
              <span className="card-title">
                Pada akhirnya,
                <br />
                <i>
                  kita selalu
                  <br />
                  pulang ke kata.
                </i>
              </span>
              <span className="card-sign">— N. Puspita</span>
              <div className="card-decoration">“</div>
            </div>
            <div className="float-note">
              <span>✳</span> tulisan punya daya
            </div>
            <div className="float-dot" />
          </div>
          <div className="hero-index">
            <span>01</span>
            <span className="index-line" /> BACA · RASA · BERTUMBUH
          </div>
        </section>
        <section id="jelajahi" className="discover">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dash" /> PERPUSTAKAAN KAMI
              </div>
              <h2>
                Cerita baru untuk
                <br className="desktop-break" /> <em>pikiran yang terbuka.</em>
              </h2>
            </div>
            <p>
              Setiap karya adalah undangan
              <br />
              untuk melihat dunia dari sisi lain.
            </p>
          </div>
          <div className="toolbar">
            <div id="kategori" className="category-list">
              {cats.map((c) => (
                <button
                  className={category === c ? "cat-active" : ""}
                  key={c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
              <button
                className={showSaved ? "cat-active" : ""}
                onClick={() => setShowSaved(!showSaved)}
              >
                <Bookmark size={12} /> Tersimpan
                {saved.length ? ` · ${saved.length}` : ""}
              </button>
            </div>
            <label className="search-box">
              <Search size={17} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari karya atau penulis…"
              />
              <span>⌘ K</span>
            </label>
          </div>
          {filtered.length > 0 ? (
            <>
              <div className="featured-grid">
                {filtered.slice(0, 2).map((w, i) => (
                  <article
                    className={`featured-card ${i === 0 ? "feature-main" : ""}`}
                    key={w.id}
                    onClick={() => setSelected(w)}
                  >
                    <div className={`feature-art ${w.color}`}>
                      {i === 0 ? (
                        <>
                          <div className="feature-sun" />
                          <div className="feature-window">
                            <div />
                            <div />
                          </div>
                          <span className="feature-art-caption">
                            ADEGAN I · RUANG TENGAH
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="paper-shape">
                            <span />
                            <span />
                            <span />
                            <span />
                            <i>“</i>
                          </div>
                          <div className="feature-orbit" />
                        </>
                      )}
                      <span className="feature-tag">{w.tag}</span>
                      <button
                        className="save-button"
                        aria-label="Simpan karya"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(w.id);
                        }}
                      >
                        {saved.includes(w.id) ? (
                          <Check size={16} />
                        ) : (
                          <Bookmark size={16} />
                        )}
                      </button>
                    </div>
                    <div className="feature-info">
                      <div className="meta-line">
                        <span>{w.category.toUpperCase()}</span>
                        <span>·</span>
                        <span>{w.read} menit baca</span>
                      </div>
                      <h3>{w.title}</h3>
                      <p>{w.excerpt}</p>
                      <div className="byline">
                        <div className="author-avatar">{w.author[0]}</div>
                        <div>
                          <b>{w.author}</b>
                          <span>{w.date}</span>
                        </div>
                        <ArrowUpRight size={17} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="story-grid">
                {filtered.slice(2).map((w, i) => (
                  <article
                    className="story-card"
                    key={w.id}
                    onClick={() => setSelected(w)}
                  >
                    <div className={`story-art ${w.color}`}>
                      <span className="story-number">0{i + 1}</span>
                      <div className="story-glyph">
                        {w.category === "Makalah"
                          ? "✳"
                          : w.category === "Puisi"
                            ? "✺"
                            : w.category === "Esai"
                              ? "◌"
                              : w.category === "Cerita Pendek"
                                ? "↗"
                                : "❋"}
                      </div>
                      <span className="story-label">
                        {w.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="story-content">
                      <div className="meta-line">
                        <span>{w.date}</span>
                        <span>·</span>
                        <span>{w.read} menit</span>
                      </div>
                      <h3>{w.title}</h3>
                      <p>{w.excerpt}</p>
                      <div className="story-footer">
                        <span>{w.author}</span>
                        <button
                          className="icon-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(w.id);
                          }}
                          aria-label="Simpan karya"
                        >
                          {saved.includes(w.id) ? (
                            <Check size={16} />
                          ) : (
                            <Bookmark size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Search size={22} />
              <h3>Belum menemukan yang cocok.</h3>
              <p>Coba kata kunci atau kategori yang berbeda.</p>
              <button
                className="text-button"
                onClick={() => {
                  setQuery("");
                  setCategory("Semua karya");
                }}
              >
                Lihat semua karya <ArrowRight size={15} />
              </button>
            </div>
          )}
          <div className="library-bottom">
            <span>
              Menampilkan <b>{filtered.length}</b> dari <b>{works.length}</b>{" "}
              karya
            </span>
            <button
              onClick={() => {
                setCategory("Semua karya");
                setQuery("");
              }}
            >
              Jelajahi seluruh koleksi <ArrowRight size={15} />
            </button>
          </div>
        </section>
        <section className="quote-band">
          <div className="quote-mark">“</div>
          <blockquote>
            Menulis adalah cara kita
            <br /> <em>meninggalkan cahaya kecil</em>
            <br />
            di tempat yang pernah kita singgahi.
          </blockquote>
          <div className="quote-credit">
            <span /> NENDRA · RUANG KARYA
          </div>
          <div className="quote-decoration">RK</div>
        </section>
        <section id="tentang" className="about-section">
          <div className="about-emblem">
            <div>
              <Feather size={31} />
            </div>
            <span className="emblem-word">
              RUANG
              <br />
              UNTUK IDE
            </span>
          </div>
          <div className="about-copy">
            <div className="eyebrow">
              <span className="eyebrow-dash" /> KENALAN DULU
            </div>
            <h2>
              Tak semua hal harus
              <br />
              viral. Beberapa cukup
              <br />
              <em>berarti.</em>
            </h2>
          </div>
          <div className="about-note">
            <p>
              Ruang Karya adalah rumah bersama bagi tulisan yang lahir dari
              keingintahuan. Kami percaya gagasan paling sederhana sekalipun
              bisa mengubah cara seseorang memandang sesuatu.
            </p>
            <a href="mailto:ganendrakaivansemeru@gmail.com">
              Bercerita pada kami <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
        <section className="newsletter">
          <div>
            <span className="newsletter-icon">
              <Feather size={18} />
            </span>
            <div>
              <h3>Satu surat, beberapa bacaan baik.</h3>
              <p>
                Rekomendasi karya baru pilihan redaksi, langsung ke emailmu.
              </p>
            </div>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formElement = e.currentTarget;
              const email = new FormData(formElement).get("email");
              try {
                if (!supabase) throw new Error("Langganan belum aktif karena konfigurasi Supabase belum diisi.");
                const { error: subscribeError } = await supabase.from("subscribers").insert({ email: String(email).trim().toLowerCase() });
                if (subscribeError && subscribeError.code !== "23505") throw subscribeError;
                notify("Terima kasih, kamu sudah bergabung!");
                formElement.reset();
              } catch (err) {
                notify(err.message || "Langganan belum dapat disimpan.");
              }
            }}
          >
            <input name="email" type="email" required placeholder="Alamat email kamu" />
            <button aria-label="Berlangganan">
              <ArrowRight size={17} />
            </button>
          </form>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-main">
          <a className="brand" href="#top">
            <span className="brand-mark">
              <Feather size={18} />
            </span>{" "}
            ruang<span>karya</span>
          </a>
          <p>
            Sebuah ruang untuk gagasan
            <br />
            yang pantas didengar.
          </p>
          <div className="footer-links">
            <a href="#jelajahi">Jelajahi karya</a>
            <a href="#tentang">Tentang kami</a>
            <a href="mailto:ganendrakaivansemeru@gmail.com">Hubungi redaksi</a>
          </div>
          <span className="footer-flower">✳</span>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Ruang Karya. Dirangkai dengan sepenuh hati.</span>
          <span>This website was developed by Bibin with help from ChatGPT by OpenAI.</span>
          <div>
            <a href="/kebijakan-privasi">Kebijakan privasi</a>
            <a href="https://www.instagram.com/biibiinn._/" target="_blank" rel="noreferrer">Instagram ↗</a>
          </div>
        </div>
      </footer>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <article
            className="reading-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Tutup"
            >
              <X size={19} />
            </button>
            <div className={`modal-art ${selected.color}`}>
              <span>
                {selected.category.toUpperCase()} · {selected.date}
              </span>
              <BookOpen size={35} />
            </div>
            <div className="modal-copy">
              <div className="meta-line">
                <span>{selected.category.toUpperCase()}</span>
                <span>·</span>
                <span>
                  <Clock3 size={13} /> {selected.read} menit baca
                </span>
              </div>
              <h2>{selected.title}</h2>
              <p className="modal-excerpt">{selected.excerpt}</p>
              <div className="modal-author">
                Oleh <b>{selected.author}</b>
              </div>
              <div className="reading-body">
                {selected.body.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {selected.file_url && (
                <a className="attachment-download" href={selected.file_url} target="_blank" rel="noreferrer">
                  <FileText size={17} />
                  <span><b>{selected.file_name || "Lampiran karya"}</b><small>Buka atau unduh dokumen</small></span>
                  <Download size={17} />
                </a>
              )}
              <button
                className="text-button"
                onClick={() => toggleSave(selected.id)}
              >
                {saved.includes(selected.id)
                  ? "Tersimpan"
                  : "Simpan untuk dibaca nanti"}{" "}
                <Bookmark size={15} />
              </button>
            </div>
          </article>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
