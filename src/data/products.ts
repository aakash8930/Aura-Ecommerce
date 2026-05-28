export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  features: string[];
}

export const products: Product[] = [
  {
    id: "p_1",
    name: "Nexus Dashboard UI Kit",
    description: "A premium, dark-mode focused admin dashboard UI kit designed for modern SaaS applications. Includes 50+ glassmorphic components and responsive layouts.",
    price: 49.99,
    image: "/images/dashboard.png",
    category: "UI Kits",
    rating: 4.9,
    features: ["50+ Components", "Framer & Figma Formats", "Auto-layout", "Dark Mode Optimized"]
  },
  {
    id: "p_2",
    name: "Aura Creative 3D Bundle",
    description: "Elevate your design projects with this high-resolution 3D abstract asset bundle. Perfect for landing pages, presentations, and digital art.",
    price: 39.00,
    image: "/images/bundle.png",
    category: "3D Assets",
    rating: 4.8,
    features: ["100+ High-Res Renders", "Transparent Backgrounds", "Iridescent Materials", "Multiple Angles"]
  },
  {
    id: "p_3",
    name: "Neon Flow Motion Pack",
    description: "A stunning collection of 4K neon motion trails and abstract light waves. Ideal for video editing, streaming backgrounds, and high-energy content.",
    price: 59.99,
    image: "/images/motion.png",
    category: "Motion Graphics",
    rating: 5.0,
    features: ["4K Resolution", "60fps Smooth Animation", "Alpha Channel Included", "Seamless Loops"]
  }
];
