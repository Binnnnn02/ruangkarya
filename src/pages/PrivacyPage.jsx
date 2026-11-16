import React from 'react';
import { Feather, LockKeyhole } from 'lucide-react';

export default function PrivacyPage() {
  return (
      <main className="privacy-page">
        <a className="brand privacy-brand" href="/">
          <span className="brand-mark"><Feather size={18} /></span> ruang<span>karya</span>
        </a>
        <article className="privacy-card">
          <a className="privacy-back" href="/">← Kembali ke beranda</a>
          <div className="eyebrow"><LockKeyhole size={13} /> PRIVASI PEMBACA</div>
          <h1>Kebijakan Privasi</h1>
          <p className="privacy-updated">Terakhir diperbarui: 16 November 2026</p>
          <p>Ruang Karya menjaga informasi yang kamu berikan dan menggunakannya hanya untuk menjalankan layanan publikasi ini. Kebijakan ini menjelaskan data yang disimpan dan cara mengajukan permintaan perubahan atau penghapusan.</p>
          <h2>Data yang kami simpan</h2>
          <ul>
            <li>Karya yang diterbitkan beserta judul, nama penulis, kategori, pengantar, dan lampirannya.</li>
            <li>Naskah kiriman yang masih ditinjau redaksi, termasuk nama penulis dan email kontak bila diberikan.</li>
            <li>Alamat email yang dimasukkan ke formulir newsletter.</li>
            <li>Data akun dan sesi admin yang diproses oleh Supabase Auth.</li>
            <li>Daftar bacaan tersimpan pada penyimpanan lokal browser dan tidak dikirim ke server.</li>
          </ul>
          <h2>Bagaimana data digunakan</h2>
          <p>Data karya digunakan untuk menampilkan publikasi. Naskah yang dikirim tetap hanya dapat dilihat redaksi sampai disetujui. Email kontak pada formulir kiriman digunakan bila redaksi perlu menghubungi penulis; email newsletter digunakan untuk mengelola langganan. Data autentikasi digunakan untuk melindungi dashboard admin. Kami tidak menjual data pribadi atau menggunakannya untuk iklan.</p>
          <h2>Karya dan lampiran</h2>
          <p>Karya dan file yang diterbitkan dapat dibaca atau diunduh oleh publik. Jangan unggah dokumen berisi informasi rahasia atau data pribadi yang tidak ingin dibagikan.</p>
          <h2>Penyimpanan dan layanan pihak ketiga</h2>
          <p>Database, autentikasi, dan file disimpan melalui Supabase sesuai pengaturan proyek Ruang Karya. Situs juga memuat font dari Google Fonts. Bacaan tersimpan tetap berada di browser yang kamu gunakan.</p>
          <h2>Retensi dan permintaan privasi</h2>
          <p>Karya, kiriman, dan lampiran disimpan sampai dihapus oleh admin. Kamu dapat meminta penghapusan alamat email atau naskah kiriman, atau menghubungi kami untuk pertanyaan privasi melalui <a href="mailto:ganendrakaivansemeru@gmail.com">ganendrakaivansemeru@gmail.com</a>.</p>
        </article>
        <div className="privacy-foot">© 2026 Ruang Karya · Ditulis dengan hati, dibaca dengan rasa.</div>
      </main>
    );
}
