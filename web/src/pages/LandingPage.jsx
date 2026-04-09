import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-content">
          <div className="landing-badge">Trusted by 10,000+ customers</div>
          <h1 className="landing-title">
            Find Reliable<br />
            <span>Tradesmen</span> Instantly
          </h1>
          <p className="landing-subtitle">
            Connect with verified plumbers, electricians, carpenters and more.
            Get the job done right, fast.
          </p>
          <div className="landing-btns">
            <Link to="/register?role=customer" className="btn btn-primary btn-lg">
              Join as Customer →
            </Link>
            <Link to="/register?role=tradesman" className="btn btn-secondary btn-lg">
              Join as Tradesman
            </Link>
          </div>
          <p className="landing-login">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 700 }}>Log in</Link>
          </p>
        </div>
      </div>

      <div className="landing-features page-wrap">
        <h2 className="section-title">How it works</h2>
        <div className="features-grid">
          {[
            { icon: '🔍', title: 'Search', desc: 'Find tradesmen by trade, location and availability' },
            { icon: '⭐', title: 'Compare', desc: 'View ratings, reviews and hourly rates side by side' },
            { icon: '📋', title: 'Request', desc: 'Send a job request with photos, address and urgency' },
            { icon: '✅', title: 'Done', desc: 'Tradesman accepts and gets the job done' },
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
        <h2 className="section-title">Available Trades</h2>
        <div className="trades-grid">
          {['🔧 Plumber', '⚡ Electrician', '🪚 Carpenter', '🖌️ Painter', '🧱 Builder', '🪣 Tiler'].map(t => (
            <Link key={t} to="/search" className="trade-chip">{t}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
