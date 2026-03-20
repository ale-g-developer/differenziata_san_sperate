import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const apps = [
  {
    name: 'Rifiuti',
    icon: '♻️',
    desc: 'Calendario raccolta differenziata',
    path: '/rifiuti',
    color: '#5CB97A',
  },
  // Aggiungi qui le prossime app:
  // {
  //   name: 'Altra App',
  //   icon: '🚀',
  //   desc: 'Descrizione',
  //   path: '/altra-app',
  //   color: '#5C9FD4',
  // },
];

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1>Le Mie App</h1>
        <p>Scegli un'app per iniziare</p>
      </header>
      <div className="app-grid">
        {apps.map((app) => (
          <Link to={app.path} key={app.path} className="app-card">
            <div className="app-icon" style={{ background: app.color + '18', color: app.color }}>
              {app.icon}
            </div>
            <div className="app-info">
              <h2>{app.name}</h2>
              <p>{app.desc}</p>
            </div>
            <span className="app-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
