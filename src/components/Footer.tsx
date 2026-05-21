import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-col">
            <Link to="/" className="logo" style={{ marginBottom: '24px' }}>
              <Flame color="#D4AF37" size={28} />
              MODERN MEAT
            </Link>
            <p>Biz eng yaxshi sifatli, xavfsiz va halol go'sht mahsulotlarini xaridorlarimizga yetkazib berishdan faxrlanamiz.</p>
            <div className="social-links">
              <a href="#">Instagram</a>
              <a href="#">Facebook</a>
              <a href="#">Telegram</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Tezkor Havolalar</h4>
            <p><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Asosiy</Link></p>
            <p><Link to="/market" style={{ color: 'inherit', textDecoration: 'none' }}>Market</Link></p>
            <p><a href="/#about" style={{ color: 'inherit', textDecoration: 'none' }}>Biz haqimizda</a></p>
            <p><a href="/#contact" style={{ color: 'inherit', textDecoration: 'none' }}>Aloqa</a></p>
          </div>
          <div className="footer-col" id="contact">
            <h4>Aloqa</h4>
            <p>Farxod dehqon bozori. 1chi darvoza (yer osti yo'li) oldida</p>
            <p>Telefon: +998 95 113 99 88</p>
            <p>Email: modernnmeat@gmail.com</p>
            <p>Ish vaqti: Har kuni 08:00 - 20:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Modern Meat. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}
