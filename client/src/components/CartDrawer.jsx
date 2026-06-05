import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services';
import toast from 'react-hot-toast';
import {
  X, Minus, Plus, Trash2, ShoppingCart, ChevronRight,
  Truck, UtensilsCrossed, ShoppingBag, ChevronLeft,
  CheckCircle, MessageSquare
} from 'lucide-react';

const ORDER_TYPES = [
  { value: 'dine-in', label: 'Dine In', icon: <UtensilsCrossed size={20} />, desc: 'Eat at the restaurant' },
  { value: 'takeaway', label: 'Takeaway', icon: <ShoppingBag size={20} />, desc: 'Pick up your order' },
  { value: 'delivery', label: 'Delivery', icon: <Truck size={20} />, desc: 'Delivered to your door' },
];

const DELIVERY_FEE = 3.50;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, updateInstructions, clearCart, totalItems, subtotal, tax } = useCart();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const activeOrderTypes = isAdmin 
    ? ORDER_TYPES.filter(t => t.value !== 'delivery')
    : ORDER_TYPES.filter(t => t.value === 'delivery');

  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'confirmed'
  const [orderType, setOrderType] = useState('dine-in');

  useEffect(() => {
    setOrderType(isAdmin ? 'dine-in' : 'delivery');
  }, [isAdmin]);
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({ street: '', city: '', postalCode: '' });
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  const handleClose = () => {
    closeCart();
    // Reset to cart step after closing animation
    setTimeout(() => {
      if (step === 'confirmed') {
        setStep('cart');
        setConfirmedOrder(null);
      }
    }, 300);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Validate required fields
    if (orderType === 'dine-in') {
      if (!tableNumber) {
        toast.error('Please enter your table number');
        return;
      }
    }
    if (orderType === 'delivery') {
      if (!deliveryAddress.street || !deliveryAddress.city) {
        toast.error('Please enter your delivery address');
        return;
      }
    }
    if (!isAuthenticated) {
      if (!guestInfo.name || !guestInfo.email) {
        toast.error('Please enter your name and email');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({
          menuItem: i._id,
          name: i.selectedSize ? `${i.name} (${i.selectedSize})` : i.name,
          price: i.price,
          quantity: i.qty,
          specialInstructions: i.specialInstructions || '',
        })),
        orderType,
        paymentMethod,
        notes,
        ...(orderType === 'delivery' && { deliveryAddress }),
        ...(orderType === 'dine-in' && { tableNumber: parseInt(tableNumber) }),
        ...(!isAuthenticated && {
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          guestPhone: guestInfo.phone,
        }),
      };

      const { data } = await orderService.create(payload);
      setConfirmedOrder(data.order);
      setStep('confirmed');
      clearCart();
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        {/* ── CONFIRMED STEP ── */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="cart-confirmed">
            <button className="cart-close" onClick={handleClose}><X size={20} /></button>
            <div className="confirmed-icon"><CheckCircle size={56} strokeWidth={1.5} /></div>
            <h2>Order Placed!</h2>
            <p>Your order has been received and is being processed.</p>
            <div className="confirmed-details">
              <div><span>Order ID</span><strong>#{confirmedOrder._id?.slice(-8).toUpperCase()}</strong></div>
              <div><span>Total</span><strong>${confirmedOrder.grandTotal?.toFixed(2)}</strong></div>
              <div><span>Type</span><strong style={{ textTransform: 'capitalize' }}>{confirmedOrder.orderType}</strong></div>
              <div><span>Status</span><span className="status-badge status-pending">{confirmedOrder.status}</span></div>
            </div>
            <p className="confirmed-eta">⏱ Estimated time: ~{confirmedOrder.estimatedTime || 30} minutes</p>
            <button className="btn btn-primary btn-full" onClick={handleClose}>
              Continue Browsing
            </button>
          </div>
        )}

        {/* ── CHECKOUT STEP ── */}
        {step === 'checkout' && (
          <>
            <div className="cart-header">
              <button className="cart-back-btn" onClick={() => setStep('cart')}>
                <ChevronLeft size={18} /> Back
              </button>
              <h2>Checkout</h2>
              <button className="cart-close" onClick={handleClose}><X size={20} /></button>
            </div>

            <div className="cart-body">
              {/* Order Type */}
              <div className="checkout-section">
                <h3>Order Type</h3>
                <div className="order-type-grid">
                  {activeOrderTypes.map((t) => (
                    <button
                      key={t.value}
                      className={`order-type-btn ${orderType === t.value ? 'active' : ''}`}
                      onClick={() => setOrderType(t.value)}
                    >
                      <span className="order-type-icon">{t.icon}</span>
                      <span className="order-type-label">{t.label}</span>
                      <span className="order-type-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dine-in table number */}
              {orderType === 'dine-in' && (
                <div className="checkout-section">
                  <h3>Table Number *</h3>
                  <input
                    type="number" placeholder="e.g. 5" min="1" required
                    value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}
                    className="checkout-input"
                  />
                </div>
              )}

              {/* Delivery address */}
              {orderType === 'delivery' && (
                <div className="checkout-section">
                  <h3>Delivery Address</h3>
                  <input placeholder="Street address *" value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className="checkout-input" />
                  <input placeholder="City *" value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    className="checkout-input" style={{ marginTop: 8 }} />
                  <input placeholder="Postal code" value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                    className="checkout-input" style={{ marginTop: 8 }} />
                </div>
              )}

              {/* Guest info */}
              {!isAuthenticated && (
                <div className="checkout-section">
                  <h3>Your Details</h3>
                  <input placeholder="Full name *" value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="checkout-input" />
                  <input placeholder="Email *" type="email" value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="checkout-input" style={{ marginTop: 8 }} />
                  <input placeholder="Phone" type="tel" value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="checkout-input" style={{ marginTop: 8 }} />
                </div>
              )}

              {/* Payment */}
              <div className="checkout-section">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  {(isAdmin ? ['cash', 'card'] : ['cash', 'online']).map((m) => (
                    <button key={m} className={`payment-btn ${paymentMethod === m ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(m)}>
                      {m === 'cash' ? '💵' : m === 'card' ? '💳' : '📱'}
                      <span style={{ textTransform: 'capitalize' }}>
                        {m === 'cash' ? (isAdmin ? 'cash' : 'cash on delivery') : m}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="checkout-section">
                <h3>Order Notes (optional)</h3>
                <textarea placeholder="Any special requests for the kitchen..." rows={2}
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="checkout-input checkout-textarea" />
              </div>

              {/* Order summary */}
              <div className="checkout-section">
                <h3>Order Summary</h3>
                <div className="checkout-summary">
                  {items.map((item) => (
                    <div key={item._id} className="summary-row">
                      <span>{item.qty}× {item.name}</span>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="summary-divider" />
                  <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
                  {deliveryFee > 0 && <div className="summary-row"><span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>}
                  <div className="summary-row summary-total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div className="cart-footer">
              <button className="btn btn-primary btn-full" onClick={handleCheckout} disabled={loading}>
                {loading ? 'Placing Order...' : `Place Order · $${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </>
        )}

        {/* ── CART STEP ── */}
        {step === 'cart' && (
          <>
            <div className="cart-header">
              <h2>
                <ShoppingCart size={20} />
                Your Order
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </h2>
              <button className="cart-close" onClick={handleClose}><X size={20} /></button>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add items from the menu to get started</p>
                <button className="btn btn-primary" onClick={handleClose}>Browse Menu</button>
              </div>
            ) : (
              <>
                <div className="cart-body">
                  <div className="cart-items">
                    {items.map((item) => (
                      <div key={item.cartId} className="cart-item">
                        <div className="cart-item-main">
                          <div className="cart-item-info">
                            <h4>{item.name}</h4>
                            {item.selectedSize && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'capitalize', marginTop: 2 }}>
                                Size: {item.selectedSize}
                              </div>
                            )}
                            <span className="cart-item-price">${item.price.toFixed(2)} each</span>
                          </div>
                          <div className="cart-item-actions">
                            <div className="qty-control">
                              <button className="qty-btn" onClick={() => item.qty === 1 ? removeItem(item.cartId) : updateQty(item.cartId, item.qty - 1)}>
                                {item.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                              </button>
                              <span className="qty-value">{item.qty}</span>
                              <button className="qty-btn" onClick={() => updateQty(item.cartId, item.qty + 1)}>
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="cart-item-subtotal">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Special instructions toggle */}
                        <button
                          className="instructions-toggle"
                          onClick={() => setExpandedItem(expandedItem === item.cartId ? null : item.cartId)}
                        >
                          <MessageSquare size={12} />
                          {item.specialInstructions ? 'Edit note' : 'Add note'}
                        </button>
                        {expandedItem === item.cartId && (
                          <textarea
                            className="instructions-input"
                            placeholder="e.g. No onions, extra spicy..."
                            rows={2}
                            value={item.specialInstructions}
                            onChange={(e) => updateInstructions(item.cartId, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="cart-totals">
                    <div className="totals-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="totals-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="totals-row totals-grand"><span>Estimated Total</span><span>${(subtotal + tax).toFixed(2)}</span></div>
                  </div>

                  <button className="clear-cart-btn" onClick={() => { if (confirm('Clear all items?')) clearCart(); }}>
                    <Trash2 size={14} /> Clear cart
                  </button>
                </div>

                <div className="cart-footer">
                  <button className="btn btn-primary btn-full" onClick={() => setStep('checkout')}>
                    Proceed to Checkout <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
