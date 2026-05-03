import { useState, useEffect } from 'react';
import { ShoppingCart, LayoutGrid, Beef, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

export function Market() {
  const { addToCart } = useCart();
  const { products, categories } = useProducts();
  const [filter, setFilter] = useState('barchasi');
  const [animateGrid, setAnimateGrid] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFilterChange = (newFilter: string) => {
    setAnimateGrid(true);
    setFilter(newFilter);
    setTimeout(() => setAnimateGrid(false), 500);
  };

  const filteredProducts = filter === 'barchasi' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="market-page">
      <div className="market-header-premium">
        <img src="/images/hero.png" alt="Market Background" className="market-bg-image" />
        <div className="market-overlay"></div>
        <div className="container">
          <div className="market-header-content animate-fade-in">
            <h1 className="market-title">Premium Katalog</h1>
            <p className="market-desc">Eng sara va halol go'sht turlari sizning dasturxoningiz uchun</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="market-layout">
          <aside className="market-sidebar animate-fade-in delay-100">
            <div className="sidebar-box">
              <h3>Kategoriyalar</h3>
              <ul className="category-list">
                <li>
                  <button className={filter === 'barchasi' ? 'active' : ''} onClick={() => handleFilterChange('barchasi')}>
                    <LayoutGrid size={18} /> <span>Barcha Mahsulotlar</span>
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button className={filter === cat.id ? 'active' : ''} onClick={() => handleFilterChange(cat.id)}>
                      <Beef size={18} /> <span>{cat.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className={`market-content ${animateGrid ? 'fade-out' : 'fade-in'}`}>
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="product-card" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">{product.price.toLocaleString()} so'm <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>/ kg</span></span>
                      <button className="add-to-cart" title="Savatga qo'shish" onClick={() => addToCart(product)}>
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="no-products">Bu kategoriyada mahsulot topilmadi.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
