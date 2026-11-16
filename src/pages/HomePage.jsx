import React from 'react';
import { ArrowRight, ArrowUpRight, Bookmark, BookOpen, Check, Clock3, Download, Feather, FileText, Menu, Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { supabase } from '../supabase.js';
export default function HomePage() {
  const { works, category, setCategory, query, setQuery, filtered, selected, setSelected, saved, toggleSave, showSaved, setShowSaved, searchRef, mobile, setMobile, notify, toast, cats } = useApp();
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
            <a href="/tentang-kami" onClick={() => setMobile(false)}>
              Tentang
            </a>
          </nav>
          <div className="nav-end">
            <a className="nav-submit" href="/kirim-karya">
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
              {works.length ? <Search size={22} /> : <Feather size={22} />}
              <h3>{works.length ? "Belum menemukan yang cocok." : "Belum ada karya terbit."}</h3>
              <p>{works.length ? "Coba kata kunci atau kategori yang berbeda." : "Jadilah penulis pertama yang mengisi Ruang Karya."}</p>
              {works.length ? (
                <button className="text-button" onClick={() => { setQuery(""); setCategory("Semua karya"); }}>Lihat semua karya <ArrowRight size={15} /></button>
              ) : <a className="text-button" href="/kirim-karya">Kirim karya pertama <ArrowRight size={15} /></a>}
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
            <a href="/tentang-kami">Tentang kami</a>
            <a href="mailto:ganendrakaivansemeru@gmail.com">Hubungi redaksi</a>
          </div>
          <span className="footer-flower">✳</span>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Ruang Karya. Dirangkai dengan sepenuh hati.</span>
          <span>This website was developed by Bibin with help from ChatGPT by OpenAI.</span>
          <div>
            <a href="/kebijakan-privasi">Kebijakan privasi</a>
            <a href="https://www.instagram.com/ruangkarya.id._/" target="_blank" rel="noreferrer">Instagram</a>
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
