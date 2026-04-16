import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-content">
          <div className="landing-badge">Более 500 мастеров по Таджикистану</div>
          <h1 className="landing-title">
            Найдите надёжного<br />
            <span>мастера</span> быстро
          </h1>
          <p className="landing-subtitle">
            Сантехники, электрики, плотники и маляры в Душанбе и Хуҷанде.
            Быстро, надёжно, с отзывами.
          </p>
          <div className="landing-btns">
            <Link to="/register?role=customer" className="btn btn-primary btn-lg">
              Я ищу мастера →
            </Link>
            <Link to="/register?role=tradesman" className="btn btn-secondary btn-lg">
              Я мастер
            </Link>
          </div>
          <p className="landing-login">
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 700 }}>Войти</Link>
          </p>
        </div>
      </div>

      <div className="landing-features page-wrap">
        <h2 className="section-title">Как это работает</h2>
        <div className="features-grid">
          {[
            { icon: '🔍', title: 'Поиск', desc: 'Найдите мастера по специальности, городу и доступности' },
            { icon: '⭐', title: 'Сравнение', desc: 'Смотрите рейтинги, отзывы и почасовые ставки' },
            { icon: '📋', title: 'Заявка', desc: 'Отправьте заявку с описанием, адресом и удобным временем' },
            { icon: '✅', title: 'Готово', desc: 'Мастер принимает заказ и выполняет работу' },
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
        <h2 className="section-title">Специальности</h2>
        <div className="trades-grid">
          {['🔧 Сантехник', '⚡ Электрик', '🪚 Плотник', '🖌️ Маляр', '🧱 Строитель', '🪣 Плиточник'].map(t => (
            <Link key={t} to="/search" className="trade-chip">{t}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
