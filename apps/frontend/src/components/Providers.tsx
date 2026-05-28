"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartSidebar from "@/components/CartSidebar";
import Toaster from "@/components/Toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
          <CartSidebar />
          <Toaster />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
