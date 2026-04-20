import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-content">
          <div className="landing-badge">500+ tradesmen across Tajikistan</div>
          <h1 className="landing-title">
            Find a trusted<br />
            <span>tradesman</span> fast
          </h1>
          <p className="landing-subtitle">
            Plumbers, electricians, carpenters and painters in Dushanbe &amp; Khujand.
            Fast, reliable, and reviewed.
          </p>
          <div className="landing-btns">
            <Link to="/register" className="btn btn-primary btn-lg">
              I need a tradesman →
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              I'm a tradesman
            </Link>
          </div>
          <p className="landing-login">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Log In</Link>
          </p>
        </div>
      </div>

      <div className="landing-features page-wrap">
        <h2 className="section-title">How it works</h2>
        <div className="features-grid">
          {[
            { icon: '🔍', title: 'Search',  desc: 'Find a tradesman by trade, city and availability' },
            { icon: '⭐', title: 'Compare', desc: 'Browse ratings, reviews and hourly rates' },
            { icon: '📋', title: 'Book',    desc: 'Send a request with details, address and preferred time' },
            { icon: '✅', title: 'Done',    desc: 'Tradesman accepts and gets the job done' },
          ].map(f => (
            <div key={f.title} className="feature-card card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-trades page-wrap">
        <h2 className="section-title">Specialties</h2>
        <div className="trades-grid">
          {['🔧 Plumber', '⚡ Electrician', '🪚 Carpenter', '🖌️ Painter', '🧱 Builder', '🪣 Tiler'].map(t => (
            <Link key={t} to="/search" className="trade-chip">{t}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
