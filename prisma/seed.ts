import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create mock admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aura.com' },
    update: {},
    create: {
      email: 'admin@aura.com',
      name: 'Admin',
      password: 'password123', // In a real app, hash this!
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  // Categories mapping
  const categoriesData = [
    { name: 'UI Kits', slug: 'ui-kits', description: 'User interface components and templates.' },
    { name: '3D Assets', slug: '3d-assets', description: 'High-resolution 3D models and renders.' },
    { name: 'Motion Graphics', slug: 'motion-graphics', description: 'Video elements and motion templates.' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const categories = await prisma.category.findMany();
  const getCategoryId = (name: string) => categories.find((c: any) => c.name === name)?.id;

  // Products
  const productsData = [
    {
      name: "Nexus Dashboard UI Kit",
      slug: "nexus-dashboard-ui-kit",
      description: "A premium, dark-mode focused admin dashboard UI kit designed for modern SaaS applications. Includes 50+ glassmorphic components and responsive layouts.",
      price: 49.99,
      imageUrl: "/images/dashboard.png",
      categoryId: getCategoryId("UI Kits")!,
    },
    {
      name: "Aura Creative 3D Bundle",
      slug: "aura-creative-3d-bundle",
      description: "Elevate your design projects with this high-resolution 3D abstract asset bundle. Perfect for landing pages, presentations, and digital art.",
      price: 39.00,
      imageUrl: "/images/bundle.png",
      categoryId: getCategoryId("3D Assets")!,
    },
    {
      name: "Neon Flow Motion Pack",
      slug: "neon-flow-motion-pack",
      description: "A stunning collection of 4K neon motion trails and abstract light waves. Ideal for video editing, streaming backgrounds, and high-energy content.",
      price: 59.99,
      imageUrl: "/images/motion.png",
      categoryId: getCategoryId("Motion Graphics")!,
    }
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
