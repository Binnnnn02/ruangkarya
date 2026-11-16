import React from 'react';
import { ArrowRight, ArrowUpRight, Feather } from 'lucide-react';

export default function AboutPage() {
  return (
      <main className="about-page">
        <header className="about-page-header">
          <a className="brand" href="/"><span className="brand-mark"><Feather size={18} /></span> ruang<span>karya</span></a>
          <a className="about-back" href="/">← Beranda</a>
        </header>
        <section className="about-page-hero">
          <div className="eyebrow"><span className="eyebrow-dash" /> TENTANG RUANG KARYA</div>
          <h1>Tempat bagi tulisan untuk menemukan pembacanya.</h1>
          <p>Ruang Karya adalah ruang publikasi terkurasi untuk naskah pentas, jurnal, makalah, puisi, esai, dan cerita pendek—tempat gagasan dibaca dengan tenang dan diberi kesempatan untuk tinggal lebih lama.</p>
          <div className="about-page-actions"><a className="btn btn-primary" href="/kirim-karya">Kirim karyamu <ArrowRight size={16} /></a><a className="about-browse" href="/#jelajahi">Jelajahi bacaan <ArrowUpRight size={15} /></a></div>
          <span className="about-hero-mark">RK</span>
        </section>
        <section className="about-page-section">
          <div className="about-section-intro"><span className="eyebrow">KENAPA RUANG INI ADA</span><h2>Tidak semua tulisan harus ramai untuk menjadi berarti.</h2></div>
          <p className="about-section-copy">Kami percaya tulisan yang jujur, gagasan yang dirawat, dan cerita dari sudut pandang yang berbeda layak mendapat ruang. Ruang Karya mempertemukan penulis yang ingin berbagi dengan pembaca yang bersedia berhenti sejenak dan menyimak.</p>
        </section>
        <section className="about-editorial">
          <div className="eyebrow"><span className="eyebrow-dash" /> CARA KAMI MEMILIH</div>
          <h2>Setiap naskah dibaca dengan rasa ingin tahu.</h2>
          <p className="about-editorial-lead">Semua kiriman ditinjau sebelum terbit. Kami mencari karya yang terasa punya suara dan alasan untuk dibagikan.</p>
          <div className="about-principles">
            <article><span>01</span><h3>Gagasan yang hidup</h3><p>Ada hal yang ingin disampaikan, ditanyakan, atau dilihat dari cara yang berbeda.</p></article>
            <article><span>02</span><h3>Suara yang terasa</h3><p>Karya menunjukkan perhatian dan pilihan kata yang membuatnya terasa milik penulisnya.</p></article>
            <article><span>03</span><h3>Layak dibaca bersama</h3><p>Tulisan disampaikan dengan utuh, jelas, dan menghargai pembaca.</p></article>
          </div>
        </section>
        <section className="about-process">
          <div><span className="eyebrow">DARI NASKAH KE PEMBACA</span><h2>Ruangnya terbuka. Terbitnya tetap lewat kurasi.</h2></div>
          <ol>
            <li><span>1</span><div><b>Penulis mengirim</b><p>Naskah masuk ke antrean privat redaksi.</p></div></li>
            <li><span>2</span><div><b>Redaksi meninjau</b><p>Karya dibaca dan dipilih untuk diterbitkan.</p></div></li>
            <li><span>3</span><div><b>Karya tayang</b><p>Jika disetujui, tulisan muncul di situs dan bisa disorot di media sosial Ruang Karya.</p></div></li>
          </ol>
        </section>
        <section className="about-page-cta"><Feather size={22} /><h2>Punya tulisan yang ingin dibagikan?</h2><p>Kami menunggu cerita dan gagasan dari berbagai sudut pandang.</p><a className="btn btn-primary" href="/kirim-karya">Kirim karya untuk ditinjau <ArrowRight size={15} /></a></section>
        <div className="privacy-foot">© 2026 Ruang Karya · Ditulis dengan hati, dibaca dengan rasa.</div>
      </main>
    );
}
