import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from './AppContext.jsx';
import { cats, MAX_FILE_SIZE, fileTypes, acceptedFiles } from './constants.js';
import { fetchWorks, fetchSubmissions, hasAdminAccess, supabase, WORK_FILE_BUCKET } from './supabase.js';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import SubmitWorkPage from './pages/SubmitWorkPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

function getSaved() {
  try {
    return JSON.parse(localStorage.getItem("rk_saved")) || [];
  } catch {
    return [];
  }
}
function App() {
  const [works, setWorks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
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
  const [submittingWork, setSubmittingWork] = useState(false);
  const [submissionSent, setSubmissionSent] = useState(false);
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
            const pending = await fetchSubmissions();
            if (alive) { setWorks(adminWorks || []); setSubmissions(pending); setAdmin(true); }
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
      const pending = await fetchSubmissions();
      setWorks(adminWorks || []);
      setSubmissions(pending);
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
  async function submitWork(e) {
    e.preventDefault();
    if (!supabase) { notify("Formulir belum terhubung ke Supabase."); return; }
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const submission = {
      title: String(formData.get("title") || "").trim(),
      author: String(formData.get("author") || "").trim(),
      category: String(formData.get("category") || "Jurnal"),
      excerpt: String(formData.get("excerpt") || "").trim(),
      body: String(formData.get("body") || "").trim(),
      contact_email: String(formData.get("contact_email") || "").trim().toLowerCase() || null,
      consent: formData.get("consent") === "on",
      status: "pending",
    };
    setSubmittingWork(true);
    try {
      const { error: submissionError } = await supabase.from("submissions").insert(submission);
      if (submissionError) throw submissionError;
      formElement.reset();
      setSubmissionSent(true);
    } catch (err) {
      notify(err.message || "Karya belum berhasil dikirim.");
    } finally {
      setSubmittingWork(false);
    }
  }
  async function approveSubmission(submission) {
    const { error: approvalError } = await supabase.rpc("approve_submission", { submission_id: submission.id });
    if (approvalError) { notify(approvalError.message || "Karya belum berhasil diterbitkan."); return; }
    setWorks((await fetchWorks(true)) || []);
    setSubmissions(await fetchSubmissions());
    notify("Karya disetujui dan sudah tayang di web.");
  }
  async function rejectSubmission(submission) {
    const { error: rejectionError } = await supabase.from("submissions").update({ status: "rejected" }).eq("id", submission.id).eq("status", "pending");
    if (rejectionError) { notify(rejectionError.message); return; }
    setSubmissions(await fetchSubmissions());
    notify("Kiriman ditandai untuk tidak diterbitkan.");
  }
  async function copySocialCaption(work) {
    const caption = `${work.title}\n\n${work.excerpt}\n\nBaca karya lengkapnya di Ruang Karya: ${window.location.origin}\n\n#RuangKarya #KaryaTulis #Literasi`;
    try {
      await navigator.clipboard.writeText(caption);
      notify("Caption disalin. Tempel saat kamu membuat postingan di media sosial.");
    } catch {
      notify("Browser tidak mengizinkan penyalinan caption.");
    }
  }

  const appState = { works, setWorks, submissions, setSubmissions, category, setCategory, query, setQuery, selected, setSelected, saved, setSaved, showSaved, setShowSaved, admin, setAdmin, login, setLogin, pass, setPass, error, setError, mobile, setMobile, form, setForm, editingId, setEditingId, attachmentFile, setAttachmentFile, currentAttachment, setCurrentAttachment, removeAttachment, setRemoveAttachment, uploading, submittingWork, submissionSent, toast, searchRef, attachmentInputRef, filtered, notify, auth, addWork, toggleSave, submitWork, approveSubmission, rejectSubmission, copySocialCaption, cats, acceptedFiles, supabase, WORK_FILE_BUCKET, fetchWorks };
  return <AppContext.Provider value={appState}><PageRouter /></AppContext.Provider>;
}

function PageRouter() {
  const { admin } = React.useContext(AppContext);
  const path = window.location.pathname;
  if (path === '/tentang-kami') return <AboutPage />;
  if (path === '/kirim-karya') return <SubmitWorkPage />;
  if (path === '/kebijakan-privasi') return <PrivacyPage />;
  if (path.startsWith('/admin')) return admin ? <AdminPage /> : <AdminLoginPage />;
  return <HomePage />;
}

export default App;
