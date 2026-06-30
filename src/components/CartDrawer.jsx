import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={toggleCart} />
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer__head">
          <h3>Your Cart</h3>
          <button className="cart-drawer__close" onClick={toggleCart} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="cart-drawer__body">
          {cart.length === 0 ? (
            <div className="cart-drawer__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <p>Your cart is empty</p>
              <button className="btn btn-outline" onClick={toggleCart}>Continue Shopping</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item__img" />
                <div className="cart-item__details">
                  <h4>{item.name}</h4>
                  <span className="cart-item__price">{item.currency} {item.price.toLocaleString()}</span>
                  <div className="cart-item__qty">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item__remove" onClick={() => removeFromCart(item.id)} aria-label="Remove">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer__foot">
            <div className="cart-drawer__total">
              <span>Subtotal</span>
              <span>KSh {cartTotal.toLocaleString()}</span>
            </div>
            <p className="cart-drawer__note">Shipping & taxes calculated at checkout</p>
            <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleCheckout}>Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
