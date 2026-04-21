import { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { tradesmensApi } from '../api/client';
import TradesmanCard from '../components/TradesmanCard';
import './SearchPage.css';

var TRADES = ['All', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Builder', 'Tiler'];
var CITIES = ['All', 'Dushanbe', 'Khujand'];
var PER_PAGE = 8;

export default function SearchPage() {
  var [allTradesmen, setAllTradesmen] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [trade, setTrade] = useState('');
  var [city, setCity] = useState('');
  var [minRate, setMinRate] = useState('');
  var [maxRate, setMaxRate] = useState('');
  var [minRating, setMinRating] = useState('');
  var [availableOnly, setAvailableOnly] = useState(false);
  var [sortKey, setSortKey] = useState('rating_desc');
  var [page, setPage] = useState(1);

  function fetchTradesmen() {
    setLoading(true);

    var params = {};
    if (trade) params.trade = trade;
    if (city) params.city = city;
    if (minRate) params.min_rate = minRate;
    if (maxRate) params.max_rate = maxRate;
    if (minRating) params.min_rating = minRating;
    if (availableOnly) params.available = 'true';

    tradesmensApi.list(params)
      .then(function(res) {
        var data = res.data.tradesmen || [];

        // Sort the results
        if (sortKey === 'rating_desc') {
          data.sort(function(a, b) { return b.avg_rating - a.avg_rating; });
        } else if (sortKey === 'rate_asc') {
          data.sort(function(a, b) { return a.hourly_rate - b.hourly_rate; });
        } else if (sortKey === 'rate_desc') {
          data.sort(function(a, b) { return b.hourly_rate - a.hourly_rate; });
        } else if (sortKey === 'available') {
          data.sort(function(a, b) { return b.is_available - a.is_available; });
        }

        setAllTradesmen(data);
        setPage(1);
      })
      .finally(function() {
        setLoading(false);
      });
  }

  useEffect(function() {
    fetchTradesmen();
  }, [sortKey]);

  function handleSearch(e) {
    e.preventDefault();
    fetchTradesmen();
  }

  function handleReset() {
    setTrade('');
    setCity('');
    setMinRate('');
    setMaxRate('');
    setMinRating('');
    setAvailableOnly(false);
    setSearch('');
    setPage(1);
    // re-fetch with no filters
    setLoading(true);
    tradesmensApi.list({}).then(function(res) {
      var data = res.data.tradesmen || [];
      data.sort(function(a, b) { return b.avg_rating - a.avg_rating; });
      setAllTradesmen(data);
      setPage(1);
    }).finally(function() {
      setLoading(false);
    });
  }

  // Filter by name search (client-side)
  var filtered = allTradesmen;
  if (search.trim()) {
    var searchLower = search.trim().toLowerCase();
    filtered = allTradesmen.filter(function(t) {
      return t.name.toLowerCase().includes(searchLower);
    });
  }

  // Pagination
  var totalPages = Math.ceil(filtered.length / PER_PAGE);
  if (totalPages < 1) totalPages = 1;
  var startIdx = (page - 1) * PER_PAGE;
  var visible = filtered.slice(startIdx, startIdx + PER_PAGE);

  function goToPage(p) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo(0, 0);
  }

  var ratingOptions = [
    { val: '5', label: '5.0', stars: 5 },
    { val: '4', label: '4.0+', stars: 4 },
    { val: '3', label: '3.0+', stars: 3 },
  ];

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
              <label>Search</label>
              <input
                className="form-control"
                placeholder="Tradesman name..."
                value={search}
                onChange={function(e) { setSearch(e.target.value); }}
              />
            </div>

            <div className="filter-section">
              <label>City</label>
              <div className="trade-filter-grid">
                {CITIES.map(function(c) {
                  var isActive = (city === c) || (c === 'All' && !city);
                  return (
                    <button key={c} type="button"
                      className={'trade-filter-btn ' + (isActive ? 'active' : '')}
                      onClick={function() { setCity(c === 'All' ? '' : c); }}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-section">
              <label>Jobs</label>
              <div className="trade-filter-grid">
                {TRADES.map(function(t) {
                  var isActive = (trade === t) || (t === 'All' && !trade);
                  return (
                    <button key={t} type="button"
                      className={'trade-filter-btn ' + (isActive ? 'active' : '')}
                      onClick={function() { setTrade(t === 'All' ? '' : t); }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-section">
              <label>Rate (TJS/hr)</label>
              <div className="rate-row">
                <input className="form-control" type="number" placeholder="Min"
                  value={minRate} onChange={function(e) { setMinRate(e.target.value); }} />
                <span>–</span>
                <input className="form-control" type="number" placeholder="Max"
                  value={maxRate} onChange={function(e) { setMaxRate(e.target.value); }} />
              </div>
            </div>

            <div className="filter-section">
              <label>Min. Rating</label>
              <div className="rating-filter-group">
                {ratingOptions.map(function(opt) {
                  var isActive = minRating === opt.val;
                  var stars = [];
                  for (var i = 0; i < 5; i++) {
                    stars.push(
                      <Star key={i} size={13} fill={i < opt.stars ? 'currentColor' : 'none'} strokeWidth={1.5} />
                    );
                  }
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      className={'rating-chip ' + (isActive ? 'rating-chip-active' : '')}
                      onClick={function() {
                        setMinRating(isActive ? '' : opt.val);
                      }}
                    >
                      <span className="rating-chip-stars">{stars}</span>
                      <span className="rating-chip-label">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-section">
              <label className="checkbox-label">
                <input type="checkbox" checked={availableOnly}
                  onChange={function(e) { setAvailableOnly(e.target.checked); }} />
                Available now only
              </label>
            </div>

            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>
              Apply
            </button>
          </form>
        </aside>

        {/* Results */}
        <main className="search-results">
          <div className="results-header">
            <span className="results-count">
              {loading ? 'Loading...' : 'Found ' + filtered.length + ' tradesman' + (filtered.length !== 1 ? 's' : '')}
            </span>
            <select className="form-control sort-select" value={sortKey}
              onChange={function(e) { setSortKey(e.target.value); }}>
              <option value="rating_desc">By Rating</option>
              <option value="rate_asc">By Price (low first)</option>
              <option value="rate_desc">By Price (high first)</option>
              <option value="available">Available first</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={48} className="empty-state-icon" />
              <h3>No tradesmen found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="results-list">
                {visible.map(function(t) {
                  return <TradesmanCard key={t.id} tradesman={t} />;
                })}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={function() { goToPage(page - 1); }}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button
                    className="page-btn"
                    onClick={function() { goToPage(page + 1); }}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
