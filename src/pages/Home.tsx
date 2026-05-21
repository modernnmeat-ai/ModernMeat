import { useEffect } from 'react';
import { ShoppingCart, Beef, ChefHat, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

export function Home() {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const popularProducts = products.slice(0, 3);

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
  }, [products]);

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
            {popularProducts.map((product, index) => (
              <div key={product.id} className={`product-card scroll-anim ${index > 0 ? `delay-${index * 100}` : ''}`}>
                <div className="product-image-container">
                  {index === 0 && <div className="product-badge">Premium</div>}
                  {index === 2 && <div className="product-badge">Yangi</div>}
                  <img src={product.image} alt={product.name} className="product-image" />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{product.price.toLocaleString()} so'm <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>/ kg</span></span>
                    <button className="add-to-cart" title="Savatga qo'shish" onClick={() => addToCart(product)}>
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
