// CartContext.tsx
// This file creates a CartContext that wraps the useCart hook so that your entire app shares the same cart state.
// Components wrapped in the CartProvider will get the same cart data and methods.

import React, { createContext, useContext, ReactNode } from "react";
import { useCart, CartItem } from "../hooks/useCart";

// Define the shape of the cart context (same as the useCart return value)
interface CartContextType {
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
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  getSubtotal: () => number;
  getCartCount: () => number;
}

// Create the context with an initial undefined value.
const CartContext = createContext<CartContextType | undefined>(undefined);

// The CartProvider component wraps your app and uses the useCart hook once, so all children share its state.
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};

// Custom hook to easily access the cart context
export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
