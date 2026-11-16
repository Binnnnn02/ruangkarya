import React from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, Feather, FileText, LayoutDashboard, LogOut, Paperclip, Plus, Send, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useApp } from '../AppContext.jsx';

export default function AdminPage() {
  const { works, submissions, form, setForm, editingId, setEditingId, attachmentFile, setAttachmentFile, currentAttachment, setCurrentAttachment, removeAttachment, setRemoveAttachment, attachmentInputRef, uploading, supabase, WORK_FILE_BUCKET, fetchWorks, notify, approveSubmission, rejectSubmission, copySocialCaption, cats } = useApp();
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
          <section className="admin-section review-section">
            <div className="section-head">
              <div><span className="eyebrow">MODERASI</span><h2>Antrean kiriman penulis</h2></div>
              <span className="count-pill">{submissions.length} menunggu</span>
            </div>
            {submissions.length ? (
              <div className="submission-list">
                {submissions.map((item) => (
                  <article className="submission-item" key={item.id}>
                    <div className="submission-item-top"><span className="table-category">{item.category}</span><time>{new Date(item.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</time></div>
                    <h3>{item.title}</h3><p className="submission-byline">oleh <b>{item.author}</b>{item.contact_email && <> · <a href={`mailto:${item.contact_email}`}>{item.contact_email}</a></>}</p>
                    <p>{item.excerpt}</p>
                    <details><summary>Baca naskah lengkap</summary><div className="submission-manuscript">{item.body.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></details>
                    <div className="submission-actions"><button className="btn btn-primary" onClick={() => approveSubmission(item)}><Check size={15} /> Setujui & terbitkan</button><button className="btn btn-light" onClick={() => rejectSubmission(item)}><X size={15} /> Tolak</button></div>
                  </article>
                ))}
              </div>
            ) : <div className="queue-empty"><Send size={18} /><span>Belum ada kiriman baru. Kiriman penulis akan muncul di sini untuk ditinjau.</span></div>}
          </section>
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
                    title="Salin caption untuk Instagram"
                    aria-label={`Salin caption untuk ${w.title}`}
                    onClick={() => copySocialCaption(w)}
                  ><ClipboardCopy size={15} /></button>
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
}
