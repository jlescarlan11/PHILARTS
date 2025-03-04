import { useState, useEffect, Dispatch, SetStateAction } from "react";

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  saved?: boolean;
}

export const useCart = (): {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (item: CartItem) => void;
  updateQuantity: (
    id: string,
    name: string,
    size: string,
    newQuantity: number
  ) => void;
  removeItem: (id: string, name: string, size: string) => void;
  clearCart: () => void;
  saveForLater: (id: string, name: string, size: string) => void;
  applyCoupon: (coupon: string) => number;
  setCartItems: Dispatch<SetStateAction<CartItem[]>>;
  getSubtotal: () => number;
  getCartCount: () => number; // New function added here
} => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Updates quantity based on id, name, and size
  const updateQuantity = (
    id: string,
    name: string,
    size: string,
    newQuantity: number
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.name === name && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Removes item based on id, name, and size
  const removeItem = (id: string, name: string, size: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.name === name && item.size === size)
      )
    );
  };

  // Clears the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Saves an item for later based on id, name, and size
  const saveForLater = (id: string, name: string, size: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.name === name && item.size === size
          ? { ...item, saved: true }
          : item
      )
    );
  };

  // Coupon logic remains the same
  const applyCoupon = (coupon: string): number => {
    return coupon.trim().toUpperCase() === "MATCHA10" ? 0.1 : 0;
  };

  // Adds to cart, ensuring merging of identical id, name, and size
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (ci) =>
          ci.id === item.id && ci.name === item.name && ci.size === item.size
      );
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id && ci.name === item.name && ci.size === item.size
            ? { ...ci, quantity: ci.quantity + item.quantity }
            : ci
        );
      }
      return [...prev, item];
    });
  };

  // Computes subtotal based on item price and quantity
  const getSubtotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Computes and returns the total cart count by summing up quantities
  const getCartCount = () =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    applyCoupon,
    addToCart,
    setCartItems,
    getSubtotal,
    getCartCount, // Now available for import in Navbar
  };
};
