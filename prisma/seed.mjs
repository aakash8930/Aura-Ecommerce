import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean slate
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const admin = await prisma.user.create({
    data: { email: 'admin@aura.com', name: 'Admin', password: 'admin123', role: 'ADMIN' },
  });
  const customer = await prisma.user.create({
    data: { email: 'john@example.com', name: 'John Doe', password: 'password123', role: 'USER' },
  });
  console.log('✅ Users created');

  // Categories
  const cats = await Promise.all([
    prisma.category.create({ data: { name: 'UI Kits', slug: 'ui-kits', description: 'Professional user interface component kits and design systems for web and mobile apps.', imageUrl: '/images/dashboard.png' } }),
    prisma.category.create({ data: { name: '3D Assets', slug: '3d-assets', description: 'High-resolution 3D models, renders, and abstract art for modern design projects.', imageUrl: '/images/bundle.png' } }),
    prisma.category.create({ data: { name: 'Motion Graphics', slug: 'motion-graphics', description: 'Premium video templates, motion trails, and animated backgrounds.', imageUrl: '/images/motion.png' } }),
    prisma.category.create({ data: { name: 'Templates', slug: 'templates', description: 'Ready-to-use website templates, landing pages, and presentation decks.', imageUrl: '/images/dashboard.png' } }),
    prisma.category.create({ data: { name: 'Icons & Illustrations', slug: 'icons-illustrations', description: 'Hand-crafted icon packs and illustration bundles for stunning visuals.', imageUrl: '/images/bundle.png' } }),
    prisma.category.create({ data: { name: 'Sound Effects', slug: 'sound-effects', description: 'Royalty-free sound effects and ambient audio for video and game projects.', imageUrl: '/images/motion.png' } }),
  ]);
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  console.log('✅ Categories created');

  // Products — 18 total
  const productsData = [
    // UI Kits
    { name: 'Nexus Dashboard UI Kit', slug: 'nexus-dashboard-ui-kit', description: 'A premium, dark-mode focused admin dashboard UI kit designed for modern SaaS applications. Includes 50+ glassmorphic components, responsive layouts, and dark/light theme support.', price: 49.99, comparePrice: 79.99, imageUrl: '/images/dashboard.png', categoryId: catMap['ui-kits'], badge: 'BESTSELLER', isFeatured: true, rating: 4.9, reviewCount: 127, stock: 999, tags: 'dashboard,saas,admin,dark-mode' },
    { name: 'Prism Design System', slug: 'prism-design-system', description: 'Complete design system with 200+ components, auto-layout constraints, and comprehensive documentation for scalable product development.', price: 89.99, comparePrice: 129.99, imageUrl: '/images/dashboard.png', categoryId: catMap['ui-kits'], badge: 'NEW', isFeatured: true, rating: 4.8, reviewCount: 43, stock: 999, tags: 'design-system,components,figma' },
    { name: 'Mobile Commerce Kit', slug: 'mobile-commerce-kit', description: 'E-commerce focused mobile UI kit with 80+ screens, product cards, checkout flows, and payment integrations.', price: 39.99, imageUrl: '/images/dashboard.png', categoryId: catMap['ui-kits'], rating: 4.7, reviewCount: 89, stock: 999, tags: 'mobile,ecommerce,ios,android' },

    // 3D Assets
    { name: 'Aura Creative 3D Bundle', slug: 'aura-creative-3d-bundle', description: 'Elevate your design projects with 100+ high-resolution 3D abstract asset renders. Iridescent materials, transparent backgrounds, and multiple angles.', price: 39.00, comparePrice: 59.99, imageUrl: '/images/bundle.png', categoryId: catMap['3d-assets'], badge: 'SALE', isFeatured: true, rating: 4.8, reviewCount: 201, stock: 999, tags: '3d,abstract,iridescent,renders' },
    { name: 'Geometric Shapes Pack', slug: 'geometric-shapes-pack', description: 'Modern geometric 3D shapes with metallic and glass materials. Perfect for hero sections and marketing materials.', price: 29.99, imageUrl: '/images/bundle.png', categoryId: catMap['3d-assets'], rating: 4.6, reviewCount: 67, stock: 999, tags: '3d,geometric,metallic,glass' },
    { name: 'Abstract Blob Collection', slug: 'abstract-blob-collection', description: 'Organic blob shapes with gradient materials. 50+ unique renders in 4K resolution with alpha channel support.', price: 24.99, imageUrl: '/images/bundle.png', categoryId: catMap['3d-assets'], badge: 'HOT', rating: 4.5, reviewCount: 34, stock: 50, tags: '3d,blob,organic,gradient' },

    // Motion Graphics
    { name: 'Neon Flow Motion Pack', slug: 'neon-flow-motion-pack', description: 'A stunning collection of 4K neon motion trails and abstract light waves. Ideal for video editing, streaming backgrounds, and high-energy content creation.', price: 59.99, comparePrice: 89.99, imageUrl: '/images/motion.png', categoryId: catMap['motion-graphics'], badge: 'BESTSELLER', isFeatured: true, rating: 5.0, reviewCount: 312, stock: 999, tags: 'neon,motion,4k,animation' },
    { name: 'Cinematic Transitions', slug: 'cinematic-transitions', description: '40 smooth cinematic transitions for Premiere Pro, After Effects, and DaVinci Resolve. Includes light leaks, glitch effects, and film burns.', price: 34.99, imageUrl: '/images/motion.png', categoryId: catMap['motion-graphics'], rating: 4.7, reviewCount: 156, stock: 999, tags: 'transitions,cinematic,premiere,aftereffects' },
    { name: 'Particle Effects Bundle', slug: 'particle-effects-bundle', description: 'Dynamic particle systems and effects. Snow, rain, fire, sparks, and magic dust in 4K with alpha channel.', price: 44.99, imageUrl: '/images/motion.png', categoryId: catMap['motion-graphics'], badge: 'NEW', rating: 4.9, reviewCount: 28, stock: 200, tags: 'particles,effects,vfx,4k' },

    // Templates
    { name: 'SaaS Landing Page Kit', slug: 'saas-landing-page-kit', description: 'High-converting SaaS landing page templates with 12 unique layouts, pricing tables, feature sections, and CTA components.', price: 29.99, comparePrice: 49.99, imageUrl: '/images/dashboard.png', categoryId: catMap['templates'], badge: 'SALE', isFeatured: true, rating: 4.6, reviewCount: 94, stock: 999, tags: 'saas,landing-page,conversion,marketing' },
    { name: 'Portfolio Starter Pack', slug: 'portfolio-starter-pack', description: 'Elegant portfolio templates for creatives, developers, and designers. 8 unique layouts with dark and light modes.', price: 19.99, imageUrl: '/images/dashboard.png', categoryId: catMap['templates'], rating: 4.4, reviewCount: 78, stock: 999, tags: 'portfolio,creative,developer,designer' },
    { name: 'Pitch Deck Pro', slug: 'pitch-deck-pro', description: '100-slide investor pitch deck template with data visualization, financial projections, and team bios.', price: 24.99, imageUrl: '/images/dashboard.png', categoryId: catMap['templates'], badge: 'HOT', rating: 4.8, reviewCount: 112, stock: 999, tags: 'pitch-deck,investor,startup,presentation' },

    // Icons & Illustrations
    { name: 'Luminous Icon Pack', slug: 'luminous-icon-pack', description: '1000+ pixel-perfect icons in multiple styles: outlined, filled, and duotone. SVG and PNG formats included.', price: 19.99, comparePrice: 34.99, imageUrl: '/images/bundle.png', categoryId: catMap['icons-illustrations'], badge: 'BESTSELLER', isFeatured: true, rating: 4.9, reviewCount: 445, stock: 999, tags: 'icons,svg,duotone,outlined' },
    { name: 'Isometric Scene Builder', slug: 'isometric-scene-builder', description: 'Build custom isometric scenes with 300+ modular elements. Office, city, nature, and tech themed components.', price: 34.99, imageUrl: '/images/bundle.png', categoryId: catMap['icons-illustrations'], rating: 4.7, reviewCount: 67, stock: 999, tags: 'isometric,scene,modular,illustration' },
    { name: 'Hand-Drawn Sticker Set', slug: 'hand-drawn-sticker-set', description: 'Playful hand-drawn sticker illustrations. 200+ elements for social media, presentations, and UI accents.', price: 14.99, imageUrl: '/images/bundle.png', categoryId: catMap['icons-illustrations'], badge: 'NEW', rating: 4.3, reviewCount: 19, stock: 500, tags: 'stickers,hand-drawn,social-media,playful' },

    // Sound Effects
    { name: 'Ambient Soundscapes Vol.1', slug: 'ambient-soundscapes-vol1', description: 'Immersive ambient audio loops for meditation apps, games, and videos. Forest, ocean, rain, and cosmic themes.', price: 24.99, imageUrl: '/images/motion.png', categoryId: catMap['sound-effects'], rating: 4.6, reviewCount: 88, stock: 999, tags: 'ambient,soundscape,meditation,audio' },
    { name: 'UI Sound Effects Pro', slug: 'ui-sound-effects-pro', description: 'Clean, modern UI sound effects for apps and websites. Click, hover, success, error, and notification sounds.', price: 14.99, comparePrice: 24.99, imageUrl: '/images/motion.png', categoryId: catMap['sound-effects'], badge: 'SALE', rating: 4.5, reviewCount: 56, stock: 999, tags: 'ui,sounds,notification,click' },
    { name: 'Epic Cinematic SFX', slug: 'epic-cinematic-sfx', description: 'Dramatic sound effects for trailers, intros, and cinematic content. Impacts, risers, whooshes, and drones.', price: 39.99, imageUrl: '/images/motion.png', categoryId: catMap['sound-effects'], badge: 'HOT', rating: 4.8, reviewCount: 134, stock: 300, tags: 'cinematic,sfx,epic,trailer' },
  ];

  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }
  console.log('✅ 18 products created');

  // Sample Reviews
  const products = await prisma.product.findMany();
  const reviewNames = ['Alex M.', 'Sarah K.', 'Mike R.', 'Emily W.', 'Chris D.', 'Jessica T.', 'David L.', 'Anna P.'];
  const reviewComments = [
    'Absolutely stunning quality! Worth every penny.',
    'Great assets, saved me hours of work on my project.',
    'The attention to detail is incredible. Highly recommend.',
    'Perfect for my portfolio redesign. Love the dark mode support.',
    'Good value for money. Could use a few more variations.',
    'Professional grade assets. My clients love the results.',
    'Easy to customize and integrate. Documentation is great.',
    'Exceeded my expectations. Will definitely buy more.',
  ];

  for (const product of products) {
    const numReviews = Math.min(product.reviewCount, 3);
    for (let i = 0; i < numReviews; i++) {
      await prisma.review.create({
        data: {
          rating: Math.max(3, Math.min(5, Math.round(product.rating - 0.5 + Math.random()))),
          comment: reviewComments[i % reviewComments.length],
          userName: reviewNames[i % reviewNames.length],
          productId: product.id,
          userId: customer.id,
        },
      });
    }
  }
  console.log('✅ Reviews created');

  // Sample orders
  const sampleProducts = products.slice(0, 3);
  await prisma.order.create({
    data: {
      userId: customer.id,
      email: 'john@example.com',
      totalAmount: sampleProducts.reduce((sum, p) => sum + p.price, 0),
      status: 'DELIVERED',
      items: {
        create: sampleProducts.map(p => ({
          productId: p.id,
          quantity: 1,
          price: p.price,
        })),
      },
    },
  });
  await prisma.order.create({
    data: {
      email: 'guest@example.com',
      totalAmount: 59.99,
      status: 'PROCESSING',
      items: {
        create: [{ productId: products[6].id, quantity: 1, price: products[6].price }],
      },
    },
  });
  console.log('✅ Sample orders created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
