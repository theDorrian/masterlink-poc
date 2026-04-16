import { useState, useEffect } from 'react';
import { tradesmensApi } from '../api/client';
import TradesmanCard from '../components/TradesmanCard';
import './SearchPage.css';

const TRADES = ['Все', 'Сантехник', 'Электрик', 'Плотник', 'Маляр', 'Строитель', 'Плиточник'];

export default function SearchPage() {
  const [tradesmen, setTradesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ trade: '', city: '', min_rate: '', max_rate: '', min_rating: '', available: '' });
  const [sortKey, setSortKey] = useState('rating_desc');

  const fetchTradesmen = async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.trade) params.trade = f.trade;
      if (f.city) params.city = f.city;
      if (f.min_rate) params.min_rate = f.min_rate;
      if (f.max_rate) params.max_rate = f.max_rate;
      if (f.min_rating) params.min_rating = f.min_rating;
      if (f.available) params.available = 'true';
      const res = await tradesmensApi.list(params);
      let data = res.data.tradesmen || [];
      if (sortKey === 'rating_desc') data = [...data].sort((a, b) => b.avg_rating - a.avg_rating);
      if (sortKey === 'rate_asc') data = [...data].sort((a, b) => a.hourly_rate - b.hourly_rate);
      if (sortKey === 'rate_desc') data = [...data].sort((a, b) => b.hourly_rate - a.hourly_rate);
      if (sortKey === 'available') data = [...data].sort((a, b) => b.is_available - a.is_available);
      setTradesmen(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTradesmen(); }, [sortKey]);

  const set = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));

  const handleSearch = (e) => { e.preventDefault(); fetchTradesmen(); };
  const handleReset = () => {
    const empty = { trade: '', city: '', min_rate: '', max_rate: '', min_rating: '', available: '' };
    setFilters(empty);
    fetchTradesmen(empty);
  };

  return (
    <div className="search-page page-wrap">
      <div className="search-layout">

        {/* Sidebar Filters */}
        <aside className="search-sidebar">
          <form onSubmit={handleSearch}>
            <div className="sidebar-header">
              <h2>Filters</h2>
              <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
            </div>

            <div className="filter-section">
              <label>Город</label>
              <input className="form-control" placeholder="Душанбе или Хуҷанд" value={filters.city} onChange={set('city')} />
            </div>

            <div className="filter-section">
              <label>Специальность</label>
              <div className="trade-filter-grid">
                {TRADES.map(t => (
                  <button key={t} type="button"
                    className={`trade-filter-btn ${(filters.trade === t || (t === 'Все' && !filters.trade)) ? 'active' : ''}`}
                    onClick={() => setFilters(f => ({ ...f, trade: t === 'Все' ? '' : t }))}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label>Ставка (сомони/ч)</label>
              <div className="rate-row">
                <input className="form-control" type="number" placeholder="От" value={filters.min_rate} onChange={set('min_rate')} />
                <span>–</span>
                <input className="form-control" type="number" placeholder="До" value={filters.max_rate} onChange={set('max_rate')} />
              </div>
            </div>

            <div className="filter-section">
              <label>Мин. рейтинг</label>
              {[['⭐⭐⭐⭐⭐ 5.0', '5'], ['⭐⭐⭐⭐ 4.0+', '4'], ['⭐⭐⭐ 3.0+', '3']].map(([label, val]) => (
                <label key={val} className="radio-label">
                  <input type="radio" name="rating" value={val}
                    checked={filters.min_rating === val}
                    onChange={() => setFilters(f => ({ ...f, min_rating: val }))} />
                  {label}
                </label>
              ))}
            </div>

            <div className="filter-section">
              <label className="checkbox-label">
                <input type="checkbox" checked={!!filters.available}
                  onChange={e => setFilters(f => ({ ...f, available: e.target.checked ? '1' : '' }))} />
                Только доступные сейчас
              </label>
            </div>

            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>
              Применить
            </button>
          </form>
        </aside>

        {/* Results */}
        <main className="search-results">
          <div className="results-header">
            <span className="results-count">
              {loading ? 'Загрузка...' : `Найдено мастеров: ${tradesmen.length}`}
            </span>
            <select className="form-control sort-select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="rating_desc">По рейтингу</option>
              <option value="rate_asc">По цене (дешевле)</option>
              <option value="rate_desc">По цене (дороже)</option>
              <option value="available">Сначала доступные</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            </div>
          ) : tradesmen.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>🔍</div>
              <h3>No tradesmen found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="results-list">
              {tradesmen.map(t => <TradesmanCard key={t.id} tradesman={t} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
