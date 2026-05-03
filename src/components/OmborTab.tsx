import { useState } from 'react';
import { useInventory, EntryType } from '../context/InventoryContext';
import { useProducts } from '../context/ProductContext';
import {
  PackagePlus, PackageMinus, Scale, TrendingDown, TrendingUp,
  Trash2, Calendar, ChevronDown, AlertTriangle, CheckCircle
} from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);

export function OmborTab() {
  const { entries, addEntry, deleteEntry, getStock } = useInventory();
  const { categories } = useProducts();

  const [type, setType] = useState<EntryType>('kirim');
  const [category, setCategory] = useState<string>('');
  const [weight, setWeight] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today);
  const [filterDate, setFilterDate] = useState(today);
  const [filterCat, setFilterCat] = useState<string>('barchasi');
  const [notif, setNotif] = useState('');
  const [notifType, setNotifType] = useState<'ok' | 'err'>('ok');

  const showNotif = (msg: string, t: 'ok' | 'err' = 'ok') => {
    setNotif(msg); setNotifType(t);
    setTimeout(() => setNotif(''), 3000);
  };

  const handleSubmit = async () => {
    const w = parseFloat(weight);
    if (!weight || isNaN(w) || w <= 0) {
      showNotif("To'g'ri og'irlik kiriting (kg).", 'err'); return;
    }
    if (!category && categories.length > 0) {
      showNotif("Go'sht turini tanlang", 'err'); return;
    }
    const catToUse = category || categories[0]?.id;
    const stock = getStock(categories).find(s => s.category === catToUse);
    if (type === 'chiqim' && stock && w > stock.remaining) {
      showNotif(`Omborda faqat ${stock.remaining} kg bor! Chiqim ${w} kg dan ko'p bo'la olmaydi.`, 'err');
      return;
    }
    await addEntry({
      type, category: catToUse, weight: w,
      pricePerKg: pricePerKg ? parseFloat(pricePerKg) : undefined,
      note, date,
    });
    setWeight(''); setPricePerKg(''); setNote('');
    showNotif(type === 'kirim' ? `✅ ${w} kg kirim yozildi!` : `📤 ${w} kg chiqim yozildi!`);
  };

  const allStock = getStock(categories);

  const filtered = entries.filter(e => {
    const dateOk = filterDate ? e.date === filterDate : true;
    const catOk = filterCat === 'barchasi' ? true : e.category === filterCat;
    return dateOk && catOk;
  });

  const totalRevenue = entries
    .filter(e => e.type === 'chiqim' && e.pricePerKg)
    .reduce((s, e) => s + e.weight * (e.pricePerKg ?? 0), 0);

  return (
    <div className="ombor-wrap">
      {notif && (
        <div className={`ombor-notif ${notifType}`}>
          {notifType === 'ok' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {notif}
        </div>
      )}

      {/* Stock summary cards */}
      <div className="ombor-stock-grid">
        {allStock.map(s => (
          <div
            key={s.category}
            className={`ombor-stock-card ${s.remaining < 5 && s.totalKirim > 0 ? 'low-stock' : ''}`}
          >
            <div className="ombor-stock-label">
              <Scale size={18} />
              {s.label}
              {s.remaining < 5 && s.totalKirim > 0 && (
                <span className="low-badge"><AlertTriangle size={12} /> Kam</span>
              )}
            </div>
            <div className="ombor-stock-remaining">
              {s.remaining.toFixed(1)} <span>kg</span>
            </div>
            <div className="ombor-stock-meta">
              <span className="meta-in">
                <TrendingUp size={13} /> {s.totalKirim.toFixed(1)} kg kirim
              </span>
              <span className="meta-out">
                <TrendingDown size={13} /> {s.totalChiqim.toFixed(1)} kg chiqim
              </span>
            </div>
          </div>
        ))}

        {totalRevenue > 0 && (
          <div className="ombor-stock-card revenue-card">
            <div className="ombor-stock-label">
              <TrendingUp size={18} /> Jami Daromad
            </div>
            <div className="ombor-stock-remaining" style={{ color: '#4CAF50' }}>
              {totalRevenue.toLocaleString()}
            </div>
            <div className="ombor-stock-meta">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>so'm</span>
            </div>
          </div>
        )}
      </div>

      {/* Main area: form + history */}
      <div className="ombor-main">
        {/* Entry Form */}
        <div className="ombor-form-card">
          <h3 className="ombor-section-title">
            <PackagePlus size={20} /> Yangi Yozuv
          </h3>

          {/* Type toggle */}
          <div className="ombor-type-toggle">
            <button
              className={`type-btn kirim-btn ${type === 'kirim' ? 'active' : ''}`}
              onClick={() => setType('kirim')}
            >
              <TrendingUp size={18} /> Kirim
            </button>
            <button
              className={`type-btn chiqim-btn ${type === 'chiqim' ? 'active' : ''}`}
              onClick={() => setType('chiqim')}
            >
              <TrendingDown size={18} /> Chiqim (Sotuv)
            </button>
          </div>

          {/* Category */}
          <div className="ombor-field">
            <label>Go'sht turi</label>
            <div className="ombor-cat-btns">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-btn ${category === cat.id || (!category && categories[0]?.id === cat.id) ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.name}
                  <span className="cat-remaining">
                    {(allStock.find(s => s.category === cat.id)?.remaining ?? 0).toFixed(0)} kg
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Weight & Price */}
          <div className="ombor-row">
            <div className="ombor-field">
              <label>Og'irlik (kg)</label>
              <div className="ombor-input-wrap">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0.0"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="ombor-input"
                />
                <span className="ombor-unit">kg</span>
              </div>
            </div>
            <div className="ombor-field">
              <label>Narxi (so'm/kg) <span style={{color:'var(--text-muted)',fontWeight:400}}>ixtiyoriy</span></label>
              <div className="ombor-input-wrap">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={pricePerKg}
                  onChange={e => setPricePerKg(e.target.value)}
                  className="ombor-input"
                />
                <span className="ombor-unit">so'm</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="ombor-field">
            <label><Calendar size={14} /> Sana</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="ombor-input"
              max={today}
            />
          </div>

          {/* Note */}
          <div className="ombor-field">
            <label>Izoh <span style={{color:'var(--text-muted)',fontWeight:400}}>ixtiyoriy</span></label>
            <textarea
              placeholder="Masalan: Bozordan keldi, sifati yaxshi..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="ombor-input ombor-textarea"
              rows={2}
            />
          </div>

          {/* Preview */}
          {weight && parseFloat(weight) > 0 && pricePerKg && parseFloat(pricePerKg) > 0 && (
            <div className="ombor-preview">
              <span>Jami summa:</span>
              <strong>{(parseFloat(weight) * parseFloat(pricePerKg)).toLocaleString()} so'm</strong>
            </div>
          )}

          <button
            className={`ombor-submit ${type}`}
            onClick={handleSubmit}
          >
            {type === 'kirim'
              ? <><PackagePlus size={18} /> Kirim Yozish</>
              : <><PackageMinus size={18} /> Chiqim (Sotuv) Yozish</>
            }
          </button>
        </div>

        {/* History */}
        <div className="ombor-history-card">
          <h3 className="ombor-section-title">
            <Calendar size={20} /> Tarix
          </h3>

          {/* Filters */}
          <div className="ombor-filters">
            <div className="ombor-filter-field">
              <label>Sana bo'yicha</label>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="ombor-input"
              />
            </div>
            <div className="ombor-filter-field">
              <label>Kategoriya</label>
              <div className="ombor-select-wrap">
                <select
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                  className="ombor-input"
                >
                  <option value="barchasi">Barchasi</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-chevron" />
              </div>
            </div>
          </div>

          {/* Summary for filtered date */}
          {filterDate && (
            <div className="ombor-day-summary">
              {categories.map(cat => {
                const dayIn = filtered.filter(e => e.type === 'kirim' && e.category === cat.id).reduce((s, e) => s + e.weight, 0);
                const dayOut = filtered.filter(e => e.type === 'chiqim' && e.category === cat.id).reduce((s, e) => s + e.weight, 0);
                if (dayIn === 0 && dayOut === 0) return null;
                return (
                  <div key={cat.id} className="day-summary-item">
                    <span className="day-cat">{cat.name}</span>
                    <span className="day-in">+{dayIn.toFixed(1)} kg</span>
                    <span className="day-out">-{dayOut.toFixed(1)} kg</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Entries list */}
          <div className="ombor-entries">
            {filtered.length === 0 ? (
              <div className="ombor-empty">
                <Scale size={40} />
                <p>Bu sana uchun yozuv yo'q</p>
              </div>
            ) : (
              filtered.map(e => (
                <div key={e.id} className={`ombor-entry ${e.type}`}>
                  <div className="entry-icon">
                    {e.type === 'kirim'
                      ? <TrendingUp size={20} />
                      : <TrendingDown size={20} />
                    }
                  </div>
                  <div className="entry-body">
                    <div className="entry-top">
                      <span className="entry-cat">{categories.find(c => c.id === e.category)?.name || e.category}</span>
                      <span className={`entry-type-badge ${e.type}`}>
                        {e.type === 'kirim' ? 'Kirim' : 'Sotuv'}
                      </span>
                    </div>
                    <div className="entry-weight">
                      {e.type === 'kirim' ? '+' : '-'}{e.weight} kg
                      {e.pricePerKg && (
                        <span className="entry-price">
                          · {(e.weight * e.pricePerKg).toLocaleString()} so'm
                          <span style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>
                            {' '}({e.pricePerKg.toLocaleString()}/kg)
                          </span>
                        </span>
                      )}
                    </div>
                    {e.note && <div className="entry-note">{e.note}</div>}
                    <div className="entry-date">{e.date}</div>
                  </div>
                  <button className="entry-del" onClick={async () => {
                    if(window.confirm('Yozuvni o\'chirmoqchimisiz?')) await deleteEntry(e.id);
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
