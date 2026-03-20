import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Rifiuti.css';

const ICONS = { ORG: '🟤', CAR: '📦', PLA: '🟡', 'VE+MET': '🟢', SEC_A: '⚫', SEC_B: '⚫' };
const CSS_CLS = { ORG: 'org', CAR: 'car', PLA: 'pla', 'VE+MET': 'vet', SEC_A: 'sec', SEC_B: 'sec' };
const BREVI = { ORG: 'Organico', CAR: 'Carta', PLA: 'Plastica', 'VE+MET': 'Vetro/Met', SEC_A: 'Secco', SEC_B: 'Secco' };
const GIORNI_PANN = ['Martedì', 'Giovedì', 'Sabato'];

function pad(n) { return String(n).padStart(2, '0'); }
function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function formatDate(d) {
  return d.getDate() + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
}

function getTarget() {
  const now = new Date();
  if (now.getHours() < 13) {
    return { date: now, label: 'Oggi si raccoglie', when: 'oggi' };
  }
  return { date: addDays(now, 1), label: 'Domani si raccoglie', when: 'domani' };
}

function filtra(raccolte, zona) {
  const escludi = zona === 'A' ? 'SEC_B' : 'SEC_A';
  return (raccolte || []).filter(r => r !== escludi);
}

// --- Componente principale ---
function Rifiuti() {
  const [cal, setCal] = useState(null);
  const [zona, setZona] = useState('A');
  const [ora, setOra] = useState(new Date());
  const [error, setError] = useState(null);

  // Carica JSON
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/calendario_rifiuti_2026.json')
      .then(r => { if (!r.ok) throw new Error('File non trovato'); return r.json(); })
      .then(setCal)
      .catch(e => setError(e.message));
  }, []);

  // Aggiorna ora ogni 30s
  useEffect(() => {
    const t = setInterval(() => setOra(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  if (error) return <div className="rif-error">❌ {error}</div>;
  if (!cal) return <div className="rif-loading"><div className="spinner" /><span>Caricamento…</span></div>;

  const target = getTarget();
  const entry = cal.calendario[dateKey(target.date)];
  const raccolte = entry ? filtra(entry.raccolte, zona) : [];
  const giorno = entry ? entry.giorno : '';
  const statusLabel = target.when === 'oggi'
    ? 'Raccolta di oggi (fino alle 13:00)'
    : 'Raccolta di domani';

  return (
    <div className="rif-page">
      {/* HEADER */}
      <header className="rif-header">
        <div className="rif-header-top">
          <Link to="/" className="rif-back">← App</Link>
          <span className="rif-ora">{pad(ora.getHours())}:{pad(ora.getMinutes())}</span>
        </div>
        <h1 className="rif-title">♻️ <span>Rifiuti {cal.comune}</span></h1>
        <p className="rif-gestore">{cal.gestore} — {cal.anno}</p>
        <div className="rif-zone-switch">
          {['A', 'B'].map(z => (
            <button
              key={z}
              className={`rif-zone-btn ${zona === z ? 'active' : ''}`}
              onClick={() => setZona(z)}
            >
              Zona {z}
            </button>
          ))}
        </div>
      </header>

      <main className="rif-main">
        {/* CARD MESSAGGIO */}
        <div className="rif-msg-card">
          <div className="rif-msg-status">
            <div className="dot" />
            {statusLabel}
          </div>
          <div className="rif-msg-body">
            <div className="line-header">
              ♻️ RACCOLTA RIFIUTI — {cal.comune.toUpperCase()} — ZONA {zona}
            </div>
            <div className="line-date">
              📅 {giorno} {formatDate(target.date)}
            </div>
            <hr className="msg-sep" />

            {!entry ? (
              <div className="line-nulla"><span className="big">📅</span>Nessun dato disponibile</div>
            ) : entry.festa && raccolte.length === 0 ? (
              <div className="line-nulla"><span className="big">🎉</span>Festivo — nessuna raccolta</div>
            ) : raccolte.length === 0 ? (
              <div className="line-nulla"><span className="big">😴</span>Nessuna raccolta prevista</div>
            ) : (
              <>
                <div className="line-subtitle">🗑️ {target.label}:</div>
                {raccolte.map(r => (
                  <div key={r} className={`line-raccolta ${CSS_CLS[r] || ''}`}>
                    {ICONS[r] || '•'} {cal.legenda[r] || r}
                  </div>
                ))}
                <div className="line-nota">⏰ {cal.nota_esposizione}</div>
                {GIORNI_PANN.includes(giorno) && (
                  <div className="line-pannolini">🍼 {cal.servizio_pannolini.nota}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SETTIMANA */}
        <h2 className="rif-section-head">📋 Questa settimana</h2>
        <WeekGrid cal={cal} zona={zona} targetKey={dateKey(target.date)} />

        {/* CONTATTI */}
        <div className="rif-contatti">
          <strong>{cal.gestore}</strong> — {cal.anno}<br />
          📞 <a href={`tel:${cal.contatti.numero_verde}`}>{cal.contatti.numero_verde}</a> · {cal.contatti.cellulare}<br />
          💬 WhatsApp: <a href={`https://wa.me/${cal.contatti.whatsapp.replace(/\./g, '')}`}>{cal.contatti.whatsapp}</a><br />
          ✉️ <a href={`mailto:${cal.contatti.email}`}>{cal.contatti.email}</a> · <a href={`https://${cal.contatti.sito}`} target="_blank" rel="noreferrer">{cal.contatti.sito}</a>
        </div>
      </main>
    </div>
  );
}

// --- Componente settimana ---
function WeekGrid({ cal, zona, targetKey }) {
  const now = new Date();
  const dow = now.getDay();
  const lun = addDays(now, -((dow === 0 ? 7 : dow) - 1));

  return (
    <div className="rif-week-grid">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(lun, i);
        const key = dateKey(d);
        const entry = cal.calendario[key];
        const raccolte = entry ? filtra(entry.raccolte, zona) : [];
        const gShort = entry ? entry.giorno.slice(0, 3) : ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'][i];
        const isTarget = key === targetKey;

        return (
          <div key={key} className={`rif-week-row ${isTarget ? 'is-target' : ''}`}>
            <div className="rif-week-day">
              <span className="dow">{gShort}</span>
              <span className="num">{d.getDate()}/{d.getMonth() + 1}</span>
            </div>
            <div className="rif-week-items">
              {entry && entry.festa && raccolte.length === 0 ? (
                <span className="mini-tag festa">Festivo</span>
              ) : raccolte.length === 0 ? (
                <span className="week-empty">—</span>
              ) : (
                raccolte.map(r => (
                  <span key={r} className={`mini-tag ${CSS_CLS[r] || ''}`}>{BREVI[r] || r}</span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Rifiuti;
