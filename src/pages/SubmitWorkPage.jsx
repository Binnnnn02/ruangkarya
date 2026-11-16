import React from 'react';
import { ArrowRight, Check, Feather, Send } from 'lucide-react';
import { useApp } from '../AppContext.jsx';

export default function SubmitWorkPage() {
  const { submissionSent, submittingWork, submitWork, cats } = useApp();
  return (
      <main className="submission-page">
        <a className="brand privacy-brand" href="/"><span className="brand-mark"><Feather size={18} /></span> ruang<span>karya</span></a>
        <section className="submission-card">
          <a className="privacy-back" href="/">← Kembali ke beranda</a>
          {submissionSent ? (
            <div className="submission-success"><span><Check size={24} /></span><h1>Karyamu sudah masuk.</h1><p>Terima kasih sudah berbagi. Redaksi Ruang Karya akan meninjau kirimanmu sebelum diterbitkan.</p><a className="btn btn-primary" href="/">Kembali ke beranda <ArrowRight size={15} /></a></div>
          ) : (
            <>
              <div className="eyebrow"><Send size={13} /> KIRIM KE RUANG KARYA</div>
              <h1>Punya tulisan yang ingin dibagikan?</h1>
              <p className="submission-intro">Kirim naskah, jurnal, makalah, puisi, esai, atau cerita pendek. Kirimanmu akan ditinjau redaksi dan tidak tampil sebelum disetujui.</p>
              <form className="submission-form" onSubmit={submitWork}>
                <label>Judul karya<input name="title" required maxLength="180" placeholder="Judul tulisanmu" /></label>
                <label>Nama penulis<input name="author" required maxLength="120" placeholder="Nama yang ingin ditampilkan" /></label>
                <label>Kategori<select name="category">{cats.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>Email untuk dihubungi <span className="optional-label">Opsional</span><input name="contact_email" type="email" maxLength="320" placeholder="email@contoh.com" /></label>
                <label>Pengantar singkat<textarea name="excerpt" required maxLength="400" rows="3" placeholder="Ceritakan sedikit tentang karyamu" /></label>
                <label className="submission-full">Naskah lengkap<textarea name="body" required maxLength="30000" rows="11" placeholder="Tempel tulisanmu di sini…" /></label>
                <label className="consent-label submission-full"><input type="checkbox" name="consent" required /><span>Saya adalah pemilik karya ini dan mengizinkan Ruang Karya meninjau serta menerbitkannya jika disetujui.</span></label>
                <button className="btn btn-primary" disabled={submittingWork}>{submittingWork ? "Mengirim…" : "Kirim untuk ditinjau"} <ArrowRight size={16} /></button>
              </form>
            </>
          )}
        </section>
        <div className="privacy-foot">© 2026 Ruang Karya · Terima kasih telah berbagi.</div>
      </main>
    );
}
