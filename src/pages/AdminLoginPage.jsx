import React from 'react';
import { ArrowRight, Feather, LockKeyhole } from 'lucide-react';
import { useApp } from '../AppContext.jsx';

export default function AdminLoginPage() {
  const { auth, login, setLogin, pass, setPass, error } = useApp();
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
}
