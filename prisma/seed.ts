import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Women's Clothing", slug: "womens-clothing" },
  { name: "Men's Clothing", slug: "mens-clothing" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
  { name: "Accessories", slug: "accessories" },
];

const PRODUCTS = [
  // --- Women's Clothing (4 products) ---
  {
    id: 'prod_1',
    name: 'Embroidered Georgette Anarkali Kurta Set with Dupatta',
    categoryName: "Women's Clothing",
    price: 849,
    originalPrice: 2499,
    discountPercentage: 66,
    rating: 4.4,
    ratingsCount: 1842,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Elevate your festive wardrobe with this breathtaking Georgette Anarkali Kurta Set. Features intricate golden zari embroidery on the yoke, flared hemline, soft inner lining, matching churidar pants, and a sheer dupatta with laced borders.',
    features: ['Fabric: Premium Georgette with Butter Crepe Lining', 'Pattern: Zari & Resham Thread Work', 'Sleeve Length: Three-Quarter Sleeves', 'Includes: Kurta, Churidar & Dupatta'],
    inStock: true,
    stockQuantity: 120,
    freeDelivery: true,
    deliveryDays: 3,
  },
  {
    id: 'prod_2',
    name: 'Floral Printed Pure Cotton Straight Kurti with Palazzo',
    categoryName: "Women's Clothing",
    price: 499,
    originalPrice: 1299,
    discountPercentage: 62,
    rating: 4.2,
    ratingsCount: 954,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    description: 'Stay effortlessly stylish in this everyday pure cotton straight kurti. Adorned with delicate Jaipuri block floral prints, mandarin V-neckline, side slits, and comfortable elasticated palazzo pants.',
    features: ['Fabric: 100% Breathable Cotton', 'Fit: Straight Regular Fit', 'Occasion: Daily Casual & Workwear', 'Wash Care: Machine Wash Cold'],
    inStock: true,
    stockQuantity: 85,
    freeDelivery: true,
    deliveryDays: 2,
  },
  {
    id: 'prod_3',
    name: 'Traditional Banarasi Art Silk Woven Saree with Blouse Piece',
    categoryName: "Women's Clothing",
    price: 1199,
    originalPrice: 3499,
    discountPercentage: 65,
    rating: 4.5,
    ratingsCount: 2410,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    description: 'Classic heritage Banarasi art silk saree in rich dual-tone weave. Features an opulent jacquard woven golden zari floral border, richly detailed pallu, and an unstitched blouse piece.',
    features: ['Fabric: High Density Banarasi Art Silk', 'Saree Length: 5.5 meters', 'Blouse Piece: 0.8 meters unstitched', 'Weave: Jacquard Floral Motifs'],
    inStock: true,
    stockQuantity: 40,
    freeDelivery: true,
    deliveryDays: 4,
  },
  {
    id: 'prod_4',
    name: 'Rayon Printed Flared Festive Ethnic Gown Dress',
    categoryName: "Women's Clothing",
    price: 649,
    originalPrice: 1699,
    discountPercentage: 61,
    rating: 4.3,
    ratingsCount: 672,
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80',
    description: 'Flattering floor-length rayon flared gown featuring foil prints, gold border detailing, and 3/4 sleeves. Perfect for festive celebrations, sangeet parties, and festive family dinners.',
    features: ['Fabric: 140 GSM Rayon Blend', 'Flare: 3.5 Meters Full Gher', 'Length: 52 inches Floor Length', 'Style: Round Neck with Tassels'],
    inStock: true,
    stockQuantity: 95,
    freeDelivery: true,
    deliveryDays: 3,
  },

  // --- Men's Clothing (3 products) ---
  {
    id: 'prod_5',
    name: 'Pure Cotton Solid Mandarin Collar Casual Shirt',
    categoryName: "Men's Clothing",
    price: 449,
    originalPrice: 999,
    discountPercentage: 55,
    rating: 4.1,
    ratingsCount: 1320,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Minimalist mandarin collar casual shirt crafted in lightweight breathable slub cotton. Features rolled-up sleeve tabs, curved hemline, and tonal buttons.',
    features: ['Fabric: 100% Slub Cotton', 'Collar: Mandarin / Chinese Collar', 'Sleeve: Full Sleeve with Roll-up tabs', 'Fit: Slim Fit'],
    inStock: true,
    stockQuantity: 150,
    freeDelivery: true,
    deliveryDays: 2,
  },
  {
    id: 'prod_6',
    name: 'Silk Blend Jacquard Kurta with Churidar Pyjama Set',
    categoryName: "Men's Clothing",
    price: 999,
    originalPrice: 2799,
    discountPercentage: 64,
    rating: 4.4,
    ratingsCount: 889,
    image: 'https://images.unsplash.com/photo-1610030469668-932d0c64c7f0?auto=format&fit=crop&w=800&q=80',
    description: 'Look royal at festive occasions with this silk-blend self-design kurta pyjama set. Intricate woven motifs across the chest, side pockets, and matching drawstring churidar.',
    features: ['Fabric: Dupion Silk Blend', 'Pattern: Woven Jacquard', 'Includes: Long Kurta and White Churidar', 'Care: Dry Clean Recommended'],
    inStock: true,
    stockQuantity: 60,
    freeDelivery: true,
    deliveryDays: 3,
  },
  {
    id: 'prod_7',
    name: 'Slim Fit Washed Denim Trucker Jacket',
    categoryName: "Men's Clothing",
    price: 799,
    originalPrice: 1999,
    discountPercentage: 60,
    rating: 4.3,
    ratingsCount: 745,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    description: 'Rugged washed blue denim jacket with flap chest pockets, metallic rivet buttons, and waist cinch adjusters.',
    features: ['Fabric: 98% Cotton, 2% Elastane Denim', 'Wash: Vintage Mid-Blue Stone Wash', 'Closure: Button Front', 'Pockets: 2 Chest Flap, 2 Welt Pockets'],
    inStock: true,
    stockQuantity: 70,
    freeDelivery: true,
    deliveryDays: 3,
  },

  // --- Home & Kitchen (3 products) ---
  {
    id: 'prod_8',
    name: '100% Cotton Double King Size Bedsheet with 2 Pillow Covers',
    categoryName: "Home & Kitchen",
    price: 529,
    originalPrice: 1499,
    discountPercentage: 65,
    rating: 4.3,
    ratingsCount: 3120,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    description: 'Transform your bedroom aesthetics with this vibrant printed king size bedsheet. 210 Thread Count glaze cotton ensures a smooth skin-friendly touch.',
    features: ['Thread Count: 210 TC Breathable Glaze Cotton', 'Size: 108 x 108 inches King Size', 'Includes: 1 Flat Sheet + 2 Pillow Covers', 'Color Fastness Guaranteed'],
    inStock: true,
    stockQuantity: 200,
    freeDelivery: true,
    deliveryDays: 2,
  },
  {
    id: 'prod_9',
    name: 'Heavy Gauge Stainless Steel Cookware Set (3-Piece Induction Base)',
    categoryName: "Home & Kitchen",
    price: 1299,
    originalPrice: 2999,
    discountPercentage: 57,
    rating: 4.6,
    ratingsCount: 1540,
    image: 'https://images.unsplash.com/photo-1584990347449-399a9b70b533?auto=format&fit=crop&w=800&q=80',
    description: 'High-grade SS-304 food-grade stainless steel tri-ply bottom cookware set. Includes a Kadai with Glass Lid, Saucepan, and Flat Fry Pan.',
    features: ['Material: Food Grade SS-304 Tri-Ply', 'Base: Induction & Gas Stove Compatible', 'Handles: Heat-Resistant Stay-Cool Riveted Handles', 'Warranty: 5 Years Brand Warranty'],
    inStock: true,
    stockQuantity: 45,
    freeDelivery: true,
    deliveryDays: 3,
  },
  {
    id: 'prod_10',
    name: 'Nordic Ceramic Matte Finish Donut Flower Vase Set (2-Piece)',
    categoryName: "Home & Kitchen",
    price: 399,
    originalPrice: 899,
    discountPercentage: 56,
    rating: 4.5,
    ratingsCount: 620,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    description: 'Chic minimalist hollow circular donut vases handcrafted from premium ceramic with textured matte finish. Ideal for dry flowers, pampas grass, or centerpieces.',
    features: ['Material: 100% High-Fired Ceramic', 'Finish: Matte Textured Beige / Off-White', 'Set: 2 Complementary Sizes (8 inch & 6 inch)', 'Base: Anti-Scratch Padded Base'],
    inStock: true,
    stockQuantity: 110,
    freeDelivery: true,
    deliveryDays: 2,
  },

  // --- Beauty & Personal Care (3 products) ---
  {
    id: 'prod_11',
    name: 'Vitamin C 10% Face Glow Serum with Hyaluronic Acid (30ml)',
    categoryName: "Beauty & Personal Care",
    price: 349,
    originalPrice: 699,
    discountPercentage: 50,
    rating: 4.4,
    ratingsCount: 4210,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    description: 'Dermatologically formulated lightweight facial serum packed with Ethyl Ascorbic Acid, Niacinamide, and Hyaluronic Acid. Fades dark spots and boosts natural luminosity.',
    features: ['Key Actives: 10% Ethyl Ascorbic Acid + 1% HA', 'Skin Type: Suitable for All Skin Types', 'Free From: Parabens, Silicones & Artificial Fragrances', 'Volume: 30ml Dropper Bottle'],
    inStock: true,
    stockQuantity: 300,
    freeDelivery: true,
    deliveryDays: 2,
  },
  {
    id: 'prod_12',
    name: 'Ayurvedic Bhringraj & Amla Hair Growth Oil with Comb Applicator (200ml)',
    categoryName: "Beauty & Personal Care",
    price: 279,
    originalPrice: 499,
    discountPercentage: 44,
    rating: 4.3,
    ratingsCount: 1980,
    image: 'https://images.unsplash.com/photo-1608248597359-00f890c2394e?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional slow-cooked Kshirpak herbal hair oil formulated with pure cold-pressed sesame oil, fresh Bhringraj leaves, Amla, and Brahmi extracts.',
    features: ['Key Herbs: Bhringraj, Amla, Shikakai, Methi Seeds', 'Applicator: Built-in Root Comb Applicator', 'Usage: Apply twice weekly for scalp nourishment', 'Volume: 200ml'],
    inStock: true,
    stockQuantity: 240,
    freeDelivery: true,
    deliveryDays: 2,
  },
  {
    id: 'prod_13',
    name: 'Velvet Matte Long-Wear Non-Transfer Liquid Lipstick Set (Pack of 4)',
    categoryName: "Beauty & Personal Care",
    price: 399,
    originalPrice: 899,
    discountPercentage: 56,
    rating: 4.2,
    ratingsCount: 1475,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    description: 'High-pigment ultra-smooth liquid lipsticks that dry down into a waterproof, smudge-proof, and transfer-resistant velvety matte finish lasting up to 12 hours.',
    features: ['Pack: 4 Nude & Berry Indian Skin-tone Shades', 'Finish: Feather-Light Velvet Matte', 'Stay: Up to 12 Hours Transfer-Proof Wear', 'Enriched with: Vitamin E and Almond Oil'],
    inStock: true,
    stockQuantity: 180,
    freeDelivery: true,
    deliveryDays: 2,
  },

  // --- Accessories (2 products) ---
  {
    id: 'prod_14',
    name: 'Traditional Kundan & Pearl Gold-Plated Choker Necklace Set',
    categoryName: "Accessories",
    price: 499,
    originalPrice: 1599,
    discountPercentage: 69,
    rating: 4.5,
    ratingsCount: 2890,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    description: 'Exquisite bridal and festive jewelry set featuring handcrafted green and white kundan stones, faux pearl droplets, and 24K micron gold plating.',
    features: ['Material: Brass with 24K Gold Plating', 'Stones: Handset Kundan & Shell Pearls', 'Set Includes: 1 Choker Necklace + 1 Pair Matching Jhumkas + Maang Tikka', 'Closure: Adjustable Dori / Cord'],
    inStock: true,
    stockQuantity: 120,
    freeDelivery: true,
    deliveryDays: 3,
  },
  {
    id: 'prod_15',
    name: 'Structured Vegan Leather Women Handbag & Shoulder Tote',
    categoryName: "Accessories",
    price: 699,
    originalPrice: 1899,
    discountPercentage: 63,
    rating: 4.4,
    ratingsCount: 1640,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    description: 'Chic dual-compartment top handle shoulder bag crafted from scratch-resistant textured PU vegan leather. Comes with a detachable adjustable shoulder strap.',
    features: ['Material: High-Grade Textured PU Leather', 'Compartments: 2 Main Zipped Compartments + 1 Center Magnetic Pocket', 'Dimensions: 32cm (W) x 24cm (H) x 12cm (D)', 'Hardware: Premium Gold-Tone Polish'],
    inStock: true,
    stockQuantity: 80,
    freeDelivery: true,
    deliveryDays: 2,
  },
];

async function main() {
  console.log('[Prisma Seed] Starting PostgreSQL seeding...');

  // 1. Seed Categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { slug: cat.slug },
      create: { name: cat.name, slug: cat.slug },
    });
  }
  console.log('[Prisma Seed] Seeded Categories.');

  // 2. Seed Products
  for (const prod of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        categoryName: prod.categoryName,
        price: prod.price,
        originalPrice: prod.originalPrice,
        discountPercentage: prod.discountPercentage,
        rating: prod.rating,
        ratingsCount: prod.ratingsCount,
        image: prod.image,
        description: prod.description,
        features: prod.features,
        inStock: prod.inStock,
        stockQuantity: prod.stockQuantity,
        freeDelivery: prod.freeDelivery,
        deliveryDays: prod.deliveryDays,
      },
      create: {
        id: prod.id,
        name: prod.name,
        categoryName: prod.categoryName,
        price: prod.price,
        originalPrice: prod.originalPrice,
        discountPercentage: prod.discountPercentage,
        rating: prod.rating,
        ratingsCount: prod.ratingsCount,
        image: prod.image,
        description: prod.description,
        features: prod.features,
        inStock: prod.inStock,
        stockQuantity: prod.stockQuantity,
        freeDelivery: prod.freeDelivery,
        deliveryDays: prod.deliveryDays,
      },
    });
  }
  console.log('[Prisma Seed] Seeded 15 Curated Products.');

  // 3. Seed Demo User
  const demoUser = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      gender: 'female',
      memberSince: 'March 2024',
    },
    create: {
      id: 'usr_demo_101',
      phone: '9876543210',
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      gender: 'female',
      memberSince: 'March 2024',
      addresses: {
        create: {
          street: 'Flat 402, Lotus Greens, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          isDefault: true,
        },
      },
    },
  });
  console.log('[Prisma Seed] Seeded Demo User:', demoUser.phone);

  // 4. Seed Initial Orders and Shipments
  const now = Date.now();
  const initialOrders = [
    {
      orderId: 'BB-89410291',
      date: new Date(now - 4 * 24 * 60 * 60 * 1000),
      status: 'Delivered',
      customerName: 'Ananya Verma',
      customerEmail: 'ananya.verma@example.com',
      customerPhone: '9845123980',
      streetAddress: 'Flat 402, Lotus Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      paymentMethod: 'upi',
      items: [
        { productId: 'prod_1', quantity: 1, unitPrice: 849, totalPrice: 849, productName: 'Embroidered Georgette Anarkali Kurta Set', productImage: PRODUCTS[0].image },
        { productId: 'prod_14', quantity: 1, unitPrice: 499, totalPrice: 499, productName: 'Traditional Kundan & Pearl Gold-Plated Choker Set', productImage: PRODUCTS[13].image },
      ],
      subtotal: 1348,
      discount: 2750,
      deliveryFee: 0,
      total: 1348,
      awb: 'BB-EXP-89102',
    },
    {
      orderId: 'BB-78192043',
      date: new Date(now - 1.5 * 24 * 60 * 60 * 1000),
      status: 'Shipped',
      customerName: 'Rohit Malhotra',
      customerEmail: 'rohit.m@example.com',
      customerPhone: '9711203491',
      streetAddress: 'B-12, Sector 15, Vashi',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      postalCode: '400703',
      paymentMethod: 'cod',
      items: [
        { productId: 'prod_5', quantity: 2, unitPrice: 449, totalPrice: 898, productName: 'Pure Cotton Solid Mandarin Collar Casual Shirt', productImage: PRODUCTS[4].image },
      ],
      subtotal: 898,
      discount: 1100,
      deliveryFee: 0,
      total: 898,
      awb: 'BB-EXP-78192',
    },
    {
      orderId: 'BB-91024855',
      date: new Date(now - 2 * 60 * 60 * 1000),
      status: 'Processing',
      customerName: 'Pooja Sharma',
      customerEmail: 'pooja.sharma@example.com',
      customerPhone: '9876543210',
      streetAddress: 'Flat 402, Lotus Greens, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201301',
      paymentMethod: 'upi',
      items: [
        { productId: 'prod_11', quantity: 1, unitPrice: 349, totalPrice: 349, productName: 'Vitamin C 10% Face Glow Serum', productImage: PRODUCTS[10].image },
      ],
      subtotal: 349,
      discount: 350,
      deliveryFee: 0,
      total: 349,
      awb: 'BB-EXP-91024',
    },
  ];

  for (const ord of initialOrders) {
    const existing = await prisma.order.findUnique({ where: { orderId: ord.orderId } });
    if (!existing) {
      const order = await prisma.order.create({
        data: {
          orderId: ord.orderId,
          userId: ord.customerPhone === '9876543210' ? demoUser.id : null,
          customerName: ord.customerName,
          customerEmail: ord.customerEmail,
          customerPhone: ord.customerPhone,
          streetAddress: ord.streetAddress,
          city: ord.city,
          state: ord.state,
          postalCode: ord.postalCode,
          paymentMethod: ord.paymentMethod,
          status: ord.status,
          subtotal: ord.subtotal,
          discount: ord.discount,
          deliveryFee: ord.deliveryFee,
          total: ord.total,
          createdAt: ord.date,
          items: {
            create: ord.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              productImage: i.productImage,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              totalPrice: i.totalPrice,
            })),
          },
        },
      });

      // Create shipment for order
      const stage = ord.status === 'Delivered' ? 'delivered' : ord.status === 'Shipped' ? 'shipped' : 'placed';
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          awbNumber: ord.awb,
          carrier: 'Bharat Express Logistics',
          currentStage: stage,
          timeline: [
            { stage: 'Order Placed', timestamp: new Date(ord.date.getTime() + 10 * 60000).toISOString(), location: 'Fulfillment Hub, Surat', description: 'Package barcoded and verified.' },
            { stage: 'Shipped', timestamp: new Date(ord.date.getTime() + 12 * 3600000).toISOString(), location: 'National Sorting Center, Delhi NCR', description: 'Dispatched via express linehaul.' },
            ...(ord.status === 'Delivered' ? [
              { stage: 'Out for Delivery', timestamp: new Date(ord.date.getTime() + 48 * 3600000).toISOString(), location: 'Delivery Hub, Bengaluru', description: 'Courier out for doorstep delivery.' },
              { stage: 'Delivered', timestamp: new Date(ord.date.getTime() + 52 * 3600000).toISOString(), location: 'Customer Doorstep', description: 'Delivered with OTP signature.' },
            ] : []),
          ],
        },
      });
    }
  }
  console.log('[Prisma Seed] Seeded Initial Orders & Shipments.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
