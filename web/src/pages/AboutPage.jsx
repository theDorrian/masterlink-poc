import { Link } from 'react-router-dom';
import { ShieldCheck, Star, CreditCard, Users } from 'lucide-react';
import './AboutPage.css';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Safety first',
    desc: 'Every tradesman on our platform is identity-verified and reviewed by real clients before appearing in search results.',
  },
  {
    icon: Star,
    title: 'Transparent reviews',
    desc: 'Ratings and reviews are written by verified clients only — no fake or paid testimonials, ever.',
  },
  {
    icon: CreditCard,
    title: 'Secure payments',
    desc: 'Payments are held in escrow and only released when you confirm the job is complete.',
  },
  {
    icon: Users,
    title: 'Fair for tradesmen',
    desc: 'We believe skilled tradesmen deserve fair compensation. Our low-fee model ensures more money reaches the people doing the work.',
  },
];

const TEAM = [
  { initials: 'MT', name: 'Muqaddas Tojibaeva',  role: 'Team Lead & Backend'   },
  { initials: 'KA', name: 'Khusrav Akdodov',     role: 'Frontend Developer'    },
  { initials: 'NE', name: 'Nilufar Ergasheva',   role: 'UI/UX & Design'        },
  { initials: 'AM', name: 'Akbar Muhammadiev',   role: 'Backend Developer'     },
  { initials: 'AS', name: 'Amir Shabozov',       role: 'Full-Stack Developer'  },
];

export default function AboutPage() {
  return (
    <div className="about">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-inner page-wrap">
          <span className="about-eyebrow">Our mission</span>
          <h1>Building trust between<br />people and tradesmen</h1>
          <p>
            MasterLink was founded with a single goal: make it safe, simple and fast
            to find a reliable skilled tradesman anywhere in Tajikistan.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="about-story page-wrap">
        <div className="story-grid">
          <div className="story-text">
            <h2>Why we built this</h2>
            <p>
              Finding a plumber, electrician or carpenter in Tajikistan used to mean
              asking friends for a referral, hoping for the best, and having no
              recourse if something went wrong. Prices were never clear, quality was
              unpredictable, and too many people ended up paying for work that was
              never finished.
            </p>
            <p>
              We experienced this firsthand — and we knew technology could fix it.
              MasterLink gives clients a vetted directory of professionals with real
              reviews and upfront pricing, while giving tradesmen a professional
              profile that helps them grow their business without cold calls or
              expensive advertising.
            </p>
            <p>
              We are a team of five students at MDISD University, and MasterLink
              is our answer to a problem we see every day. We operate in Dushanbe
              and Khujand today, with plans to expand across Tajikistan and beyond.
            </p>
          </div>
          <div className="story-stat-stack">
            {[
              { value: '500+',   label: 'Verified tradesmen'    },
              { value: '2,400+', label: 'Jobs completed'        },
              { value: '4.8',    label: 'Average client rating', star: true },
              { value: '2',      label: 'Cities, growing fast'  },
            ].map(s => (
              <div key={s.label} className="story-stat card">
                <span className="story-stat-value">
                  {s.value}
                  {s.star && <Star size={18} fill="currentColor" className="story-stat-star" />}
                </span>
                <span className="story-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values">
        <div className="page-wrap">
          <h2 className="about-section-title">What we stand for</h2>
          <div className="values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="value-card card">
                <div className="value-icon-wrap">
                  <v.icon size={24} strokeWidth={1.75} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="about-team page-wrap">
        <h2 className="about-section-title">The team</h2>
        <p className="about-section-sub">
          A team of five students from MDISD University in Tajikistan, driven by a
          shared belief that technology can make everyday life safer and easier for
          everyone around us.
        </p>
        <div className="team-grid">
          {TEAM.map(m => (
            <div key={m.name} className="team-card card">
              <div className="team-avatar">{m.initials}</div>
              <p className="team-name">{m.name}</p>
              <p className="team-role">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="page-wrap about-cta-inner">
          <h2>Ready to get started?</h2>
          <p>Browse verified tradesmen near you — no account required.</p>
          <div className="about-cta-btns">
            <Link to="/search" className="btn btn-primary btn-lg">Browse Tradesmen →</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Create an Account</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
