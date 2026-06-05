import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((menuItem) => {
    const cartId = `${menuItem._id}-${menuItem.selectedSize || 'default'}`;
    setItems((prev) => {
      const exists = prev.find((i) => i.cartId === cartId);
      if (exists) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...menuItem, cartId, qty: 1, specialInstructions: '' }];
    });
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const updateQty = useCallback((cartId, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, qty } : i)));
  }, []);

  const updateInstructions = useCallback((cartId, specialInstructions) => {
    setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, specialInstructions } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.1 * 100) / 100;

  return (
    <CartContext.Provider value={{
      items, isOpen,
      addItem, removeItem, updateQty, updateInstructions, clearCart,
      openCart, closeCart,
      totalItems, subtotal, tax,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
