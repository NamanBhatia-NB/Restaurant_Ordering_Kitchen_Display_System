import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "DumHouse | Hyderabad's Direct Food Ordering & Kitchen Display",
  description:
    "Direct food ordering platform for authentic Hyderabadi Dum Biryani, Haleem, and Mughlai cuisine with real-time Kitchen Display System and AI preparation time estimation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-cream-50 text-charcoal">
        <AuthProvider>
          <CartProvider>
            <RoleSwitcher />
            <Header />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
