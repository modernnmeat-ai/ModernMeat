import { useEffect } from 'react';
import { ShoppingCart, Beef, ChefHat, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Home() {
  const { addToCart } = useCart();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-anim').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero */}
      <section id="home" className="hero">
        <img src="/images/hero.png" alt="Premium Steak" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-subtitle animate-fade-in">Premium Sifat, Halol Mahsulot</span>
            <h1 className="hero-title animate-fade-in delay-100">
              Haqiqiy Ta'm Va Sifat <br/><span style={{ color: 'var(--gold)' }}>Uyg'unligi</span>
            </h1>
            <p className="hero-desc animate-fade-in delay-200">
              Biz faqat eng sara, halol va yangi so'yilgan go'sht mahsulotlarini taklif etamiz. Oilangiz dasturxoni uchun eng yaxshisi.
            </p>
            <div className="hero-actions animate-fade-in delay-300">
              <Link to="/market" className="btn btn-primary">
                Katalogga O'tish <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Link>
              <a href="#about" className="btn btn-outline">Biz Haqimizda</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card scroll-anim">
              <div className="feature-icon">
                <ShieldCheck size={48} />
              </div>
              <h3 className="feature-title">100% Halol</h3>
              <p className="feature-desc">Barcha mahsulotlarimiz qat'iy islomiy qoidalarga muvofiq so'yilgan va tayyorlangan.</p>
            </div>
            <div className="feature-card scroll-anim delay-100">
              <div className="feature-icon">
                <Beef size={48} />
              </div>
              <h3 className="feature-title">Har Kuni Yangi</h3>
              <p className="feature-desc">Bizda doimo yangi so'yilgan va maxsus tekshiruvdan o'tgan sifatli go'sht mahsulotlari.</p>
            </div>
            <div className="feature-card scroll-anim delay-200">
              <div className="feature-icon">
                <ChefHat size={48} />
              </div>
              <h3 className="feature-title">Maxsus Kesimlar</h3>
              <p className="feature-desc">Sizning xohishingizga qarab steyk va boshqa taomlar uchun maxsus kesimlar tayyorlab beramiz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section id="products" className="products">
        <div className="container">
          <div className="section-header scroll-anim">
            <span className="section-subtitle">Eng Xaridorgir</span>
            <h2 className="section-title">Ommabop Mahsulotlar</h2>
          </div>
          
          <div className="products-grid">
            <div className="product-card scroll-anim">
              <div className="product-image-container">
                <div className="product-badge">Premium</div>
                <img src="/images/wagyu.png" alt="Wagyu Mol Go'shti" className="product-image" />
              </div>
              <div className="product-info">
                <h3 className="product-title">Wagyu Mol Go'shti</h3>
                <p className="product-desc">Oliy navli, og'izda eriydigan marmar go'sht. Maxsus taomlar uchun mukammal tanlov.</p>
                <div className="product-footer">
                  <span className="product-price">250,000 so'm <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>/ kg</span></span>
                  <button className="add-to-cart" title="Savatga qo'shish" onClick={() => addToCart({id: 'p1', name: 'Wagyu Mol Go\'shti', price: 250000, category: 'mol', image: '/images/wagyu.png', description: ''})}>
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="product-card scroll-anim delay-100">
              <div className="product-image-container">
                <img src="/images/tbone.png" alt="T-Bone Steyk" className="product-image" />
              </div>
              <div className="product-info">
                <h3 className="product-title">T-Bone Steyk (Lahm)</h3>
                <p className="product-desc">Klassik steyk ixlosmandlari uchun maxsus suyakli lahm. Qalin va sersuv kesim.</p>
                <div className="product-footer">
                  <span className="product-price">180,000 so'm <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>/ kg</span></span>
                  <button className="add-to-cart" title="Savatga qo'shish" onClick={() => addToCart({id: 'p2', name: 'T-Bone Steyk (Lahm)', price: 180000, category: 'mol', image: '/images/tbone.png', description: ''})}>
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="product-card scroll-anim delay-200">
              <div className="product-image-container">
                <div className="product-badge">Yangi</div>
                <img src="/images/lamb.png" alt="Qo'y Qovurg'asi" className="product-image" />
              </div>
              <div className="product-info">
                <h3 className="product-title">Qo'y Qovurg'asi (Kare)</h3>
                <p className="product-desc">Yumshoq va xushbo'y qo'y go'shti qovurg'asi. Kabob va tandir uchun ajoyib tanlov.</p>
                <div className="product-footer">
                  <span className="product-price">140,000 so'm <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>/ kg</span></span>
                  <button className="add-to-cart" title="Savatga qo'shish" onClick={() => addToCart({id: 'p3', name: 'Qo\'y Qovurg\'asi (Kare)', price: 140000, category: 'qoy', image: '/images/lamb.png', description: ''})}>
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/market" className="btn btn-outline scroll-anim delay-300">
              Barcha Mahsulotlarni Ko'rish
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
