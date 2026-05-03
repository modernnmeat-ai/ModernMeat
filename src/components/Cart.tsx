import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function Cart() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'naqt' | 'click' | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Temporary random card number for test
  const TEST_CARD_NUMBER = "8600 1234 5678 9012";

  const proceedToCheckout = () => {
    if (!isLoggedIn) {
      setIsCartOpen(false);
      navigate('/login');
      return;
    }
    if (items.length === 0) return;
    setShowPaymentModal(true);
  };

  const handleOrder = () => {
    if (paymentMethod === 'click' && !screenshot) {
      alert("Iltimos, to'lov skrinshotini yuklang");
      return;
    }

    addOrder({
      userId: user?.id || '',
      userName: `${user?.firstName} ${user?.lastName}`,
      userPhone: user?.phone || '',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: totalPrice,
      paymentMethod: paymentMethod,
      // We would normally upload the screenshot to the server and pass the URL here
      hasScreenshot: !!screenshot
    });

    setIsSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsSuccess(false);
      setShowPaymentModal(false);
      setPaymentMethod(null);
      setScreenshot(null);
      setIsCartOpen(false);
    }, 2000);
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)} />
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Savatchangiz</h3>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} color="var(--text-muted)" />
              <p>Savatchangiz bo'sh</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <div className="item-price">{item.price.toLocaleString()} so'm</div>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                  <X size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {!isSuccess && items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Jami:</span>
              <span>{totalPrice.toLocaleString()} so'm</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={proceedToCheckout}>
              Buyurtma Berish
            </button>
          </div>
        )}
      </div>

      {/* Animated Payment Modal */}
      <div className={`payment-modal-overlay ${showPaymentModal ? 'open' : ''}`} onClick={() => setShowPaymentModal(false)}>
        <div className="payment-modal" onClick={e => e.stopPropagation()}>
          <div className="payment-modal-header">
            <h3>To'lov uslubini tanlang</h3>
            <button className="payment-modal-close" onClick={() => setShowPaymentModal(false)}>
              <X size={24} />
            </button>
          </div>
          
          <div className="payment-modal-content">
            {isSuccess ? (
              <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 10px' }}>
                <CheckCircle size={80} color="#4CAF50" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#4CAF50', fontSize: '1.8rem', marginBottom: '10px', fontFamily: 'Playfair Display, serif' }}>Muvaffaqiyatli!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.5' }}>
                  Buyurtmangiz qabul qilindi.<br/>Tez orada siz bilan bog'lanamiz.
                </p>
              </div>
            ) : (
              <>
                <div 
                  className={`payment-option-card ${paymentMethod === 'naqt' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('naqt')}
                >
                  <div className="payment-option-header">
                    <input type="radio" checked={paymentMethod === 'naqt'} readOnly />
                    <span>Naqt to'lov</span>
                  </div>
                  {paymentMethod === 'naqt' && (
                    <div className="payment-option-details animate-fade-in">
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Siz o'zingiz kelib olib ketishingiz kerak bo'ladi (Borib oladigan bo'ladi).
                      </p>
                    </div>
                  )}
                </div>

                <div 
                  className={`payment-option-card ${paymentMethod === 'click' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('click')}
                >
                  <div className="payment-option-header">
                    <input type="radio" checked={paymentMethod === 'click'} readOnly />
                    <span>Click orqali to'lov</span>
                  </div>
                  {paymentMethod === 'click' && (
                    <div className="payment-option-details animate-fade-in">
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Iltimos, quyidagi karta raqamiga to'lov qiling va muvaffaqiyatli to'lov skrinshotini yuklang:
                      </p>
                      <div className="card-number-display">
                        {TEST_CARD_NUMBER}
                      </div>
                      <div className="screenshot-upload">
                        <label>Tasdiqlovchi skrinshotni yuklash</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '20px', padding: '14px' }} 
                  onClick={handleOrder}
                  disabled={!paymentMethod}
                >
                  Tasdiqlash
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
