import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function CartFab() {
  const { totalItems, subtotal, openCart } = useCart();

  if (totalItems === 0) return null;

  return (
    <button className="cart-fab" onClick={openCart} aria-label="Open cart">
      <ShoppingCart size={20} />
      <span className="cart-fab-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      <span className="cart-fab-divider" />
      <span className="cart-fab-total">${subtotal.toFixed(2)}</span>
    </button>
  );
}
