import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench, Zap, Hammer, Paintbrush, Building2, LayoutGrid,
  Search, Star, ClipboardList, CheckCircle2, Check,
} from 'lucide-react';
import './LandingPage.css';

const CATEGORIES = [
  { icon: Wrench,     label: 'Plumber',     color: 'cat-blue'   },
  { icon: Zap,        label: 'Electrician', color: 'cat-yellow' },
  { icon: Hammer,     label: 'Carpenter',   color: 'cat-orange' },
  { icon: Paintbrush, label: 'Painter',     color: 'cat-purple' },
  { icon: Building2,  label: 'Builder',     color: 'cat-gray'   },
  { icon: LayoutGrid, label: 'Tiler',       color: 'cat-teal'   },
];

const STATS = [
  { value: '500+',   label: 'Verified tradesmen' },
  { value: '4.8',    label: 'Average rating', star: true },
  { value: '2,400+', label: 'Jobs completed'      },
  { value: '2',      label: 'Cities covered'       },
];

const STEPS = [
  { icon: Search,        n: '1', title: 'Search',  desc: 'Find a tradesman by trade, city and availability.' },
  { icon: Star,          n: '2', title: 'Compare', desc: 'Read ratings, reviews and compare hourly rates.'   },
  { icon: ClipboardList, n: '3', title: 'Book',    desc: 'Send a job request with details and preferred time.' },
  { icon: CheckCircle2,  n: '4', title: 'Done',    desc: 'Tradesman accepts and gets the job done.'            },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    navigate('/search');
  }

  return (
    <div className="landing">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-body">
          <p className="hero-eyebrow">Trusted tradesmen, on demand</p>
          <h1 className="hero-title">
            Find the right person<br />
            for the <span>job</span>
          </h1>
          <p className="hero-sub">
            Plumbers, electricians, carpenters and painters in Dushanbe &amp; Khujand — fast, reliable, reviewed.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              className="hero-search-input"
              placeholder="What do you need? e.g. Plumber…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary hero-search-btn">
              Search
            </button>
          </form>
          <p className="hero-login">
            Already have an account?{' '}
            <Link to="/login" className="hero-login-link">Log in</Link>
          </p>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="stats-strip">
        {STATS.map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-value">
              {s.value}
              {s.star && <Star size={20} fill="currentColor" className="stat-star" />}
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Browse by trade ── */}
      <section className="section page-wrap">
        <h2 className="section-title">Browse by trade</h2>
        <p className="section-sub">Pick a specialty and see available tradesmen near you.</p>
        <div className="cat-grid">
          {CATEGORIES.map(c => (
            <Link to="/search" key={c.label} className={`cat-card ${c.color}`}>
              <c.icon size={32} strokeWidth={1.75} />
              <span className="cat-label">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section how-section">
        <div className="page-wrap">
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">Book a professional in four simple steps.</p>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.n} className="step-card card">
                <div className="step-icon-wrap">
                  <s.icon size={20} strokeWidth={2} />
                </div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Register as Client ── */}
      <section className="client-cta-section">
        <div className="page-wrap client-cta-inner">
          <div className="client-cta-text">
            <span className="client-cta-eyebrow">For clients</span>
            <h2>Need work done at home?</h2>
            <p>
              Create a free account, post a job and receive offers from verified local
              tradesmen — no haggling, no guesswork.
            </p>
            <ul className="client-cta-list">
              <li><Check size={15} strokeWidth={2.5} className="cta-check" /> Verified &amp; reviewed professionals</li>
              <li><Check size={15} strokeWidth={2.5} className="cta-check" /> Transparent pricing upfront</li>
              <li><Check size={15} strokeWidth={2.5} className="cta-check" /> Secure in-app payments</li>
            </ul>
          </div>
          <div className="client-cta-action">
            <Link to="/register" className="btn btn-white btn-lg">
              Create a free account →
            </Link>
            <p className="client-cta-note">No credit card required</p>
          </div>
        </div>
      </section>

      {/* ── Tradesman CTA ── */}
      <section className="tradesman-section page-wrap">
        <div className="tradesman-card card">
          <div className="tradesman-card-body">
            <span className="tradesman-eyebrow">For tradesmen</span>
            <h2>Grow your business with MasterLink</h2>
            <p>
              Get listed, showcase your work, and receive job requests from clients
              who are ready to hire — no cold calls, no wasted time.
            </p>
          </div>
          <Link to="/register" className="btn btn-primary btn-lg tradesman-btn">
            Join as a Tradesman →
          </Link>
        </div>
      </section>

    </div>
  );
}
