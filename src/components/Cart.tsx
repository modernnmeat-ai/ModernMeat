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

  const handleOrder = () => {
    if (!isLoggedIn) {
      setIsCartOpen(false);
      navigate('/login');
      return;
    }

    if (items.length === 0) return;

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
      totalPrice: totalPrice
    });

    setIsSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsSuccess(false);
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
          {isSuccess ? (
            <div className="empty-cart" style={{ color: '#4CAF50' }}>
              <CheckCircle size={64} />
              <h3>Buyurtma Qabul Qilindi!</h3>
              <p>Tez orada siz bilan bog'lanamiz.</p>
            </div>
          ) : items.length === 0 ? (
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
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleOrder}>
              Buyurtma Berish
            </button>
          </div>
        )}
      </div>
    </>
  );
}
