# BharatBazaar - Meesho-Style E-commerce Application

A modern, responsive e-commerce frontend inspired by the shopping experience of Meesho, built with Next.js/React, TypeScript, and Tailwind CSS. The application provides an authentic Indian online shopping experience with wholesale pricing, free delivery, Cash on Delivery (COD), category filtering, search, cart, wishlist, and mock checkout.

## 🚀 Features

- **Header & Branding**:
  - Original branding ("BharatBazaar") with vibrant Indian e-commerce styling.
  - Responsive search bar with quick query filtering.
  - Account drawer with profile details and order status.
  - Live wishlist and shopping cart badges with real-time count updates.

- **Product Catalog (15 Curated Products)**:
  - **Women's Clothing (4)**: Georgette Anarkali Kurta Set, Pure Cotton Straight Kurti with Palazzo, Banarasi Silk Saree, Rayon Flared Festive Gown.
  - **Men's Clothing (3)**: Pure Cotton Mandarin Collar Casual Shirt, Silk Blend Kurta Pyjama Set, Washed Denim Trucker Jacket.
  - **Home & Kitchen (3)**: 100% Cotton Double King Bedsheet, Heavy Gauge Stainless Steel Cookware Set, Ceramic Donut Flower Vase Set.
  - **Beauty & Personal Care (3)**: Vitamin C 10% Glow Serum, Ayurvedic Bhringraj & Amla Hair Oil, Matte Liquid Lipstick Set.
  - **Accessories (2)**: Kundan & Pearl Gold-Plated Choker Set, Structured Vegan Leather Shoulder Tote.

- **Dynamic Product Details (`/products/[id]`)**:
  - Large product image preview with zero-broken SVG fallbacks.
  - Price, M.R.P., discount percentage, customer ratings count, and bulleted specifications.
  - Interactive quantity stepper (1-10).
  - "Add to Cart" and "Buy Now" actions.
  - Wishlist toggle heart button.
  - Related items recommendation from the same category.

- **Shopping Cart (`/cart`)**:
  - Live quantity adjustment and item removal.
  - Price breakdown (Subtotal, Savings, Free Delivery, Order Total).
  - Empty cart state with direct link to shop.
  - Persisted in `LocalStorage`.

- **Wishlist (`/wishlist`)**:
  - Save items from product cards or detail views.
  - "Move to Cart" one-click action.
  - Persisted in `LocalStorage`.

- **Mock Checkout & Order Confirmation (`/checkout` & `/order-success`)**:
  - Form validation for Indian customer name, email, 10-digit mobile number, street address, city, state, and 6-digit PIN code.
  - Payment method options: Cash on Delivery (COD, recommended), UPI (GPay/PhonePe), Credit/Debit Card.
  - Generates custom Order Reference ID (`BB-XXXXXXXX`) and stores receipt summary.
  - Instant cart clearance upon order placement.

- **Order History & Tracking (`/order-history`)**:
  - Lists all past orders retrieved from `LocalStorage` in reverse chronological order.
  - Color-coded badges for **Delivered** (emerald), **Shipped** (blue), and **Processing** (amber) with live count filter tabs.
  - Real-time package tracking modal displaying progress for Order Placed, Shipped, Out for Delivery, and Delivered.
  - **'Request Return'** action on delivered orders to initiate 7-day doorstep return/exchange with reason and UPI refund option.
  - One-click "Reorder All" to repopulate cart.

- **Microservices Architecture & System Console (`/architecture`)**:
  - **API Gateway (`/api/*`)**: Single entry-point routing requests with latency monitoring and health telemetry.
  - **5 Decoupled Microservices**:
    1. **Catalog & Search Microservice (`/api/catalog`)**: Manages products, categories, search ranking, and inventory.
    2. **Cart & Pricing Engine Microservice (`/api/cart`)**: Authoritative calculation of taxes, discounts, and order subtotals.
    3. **Order & Checkout Microservice (`/api/orders`)**: Manages order creation, customer records, and lifecycle status.
    4. **Logistics & Tracking Microservice (`/api/tracking`)**: AWB generation, delivery milestones, and timeline stages.
    5. **Reverse Logistics & Returns Microservice (`/api/returns`)**: 7-day policy validation, reverse pickup scheduling, and refund routing.
  - **Event-Driven Pub/Sub Broker**: Decoupled asynchronous messaging (`ORDER_PLACED`, `SHIPMENT_CREATED`, `RETURN_REQUESTED`).
  - **Live Architecture Console**: Real-time service topology, latency counters, and interactive REST tester.

## 🛠️ Project Structure

```
├── server/
│   ├── events/
│   │   └── eventBus.ts               # In-process asynchronous Pub/Sub Event Broker
│   ├── services/
│   │   ├── catalogService.ts         # Catalog & Search Microservice
│   │   ├── cartPricingService.ts     # Cart & Pricing Engine Microservice
│   │   ├── orderService.ts           # Order Management Microservice
│   │   ├── logisticsService.ts       # Logistics & Tracking Microservice
│   │   └── returnsService.ts         # Reverse Logistics & Returns Microservice
│   └── gateway.ts                    # API Gateway router, service registry & telemetry
├── server.ts                         # Full-stack Express server mounting API Gateway & Vite
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Shared header/footer layout
│   │   ├── page.tsx                  # Homepage & product catalog
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Dynamic product detail view
│   │   ├── cart/
│   │   │   └── page.tsx              # Shopping cart view
│   │   ├── wishlist/
│   │   │   └── page.tsx              # Saved items view
│   │   ├── checkout/
│   │   │   └── page.tsx              # Mock checkout form & validation
│   │   ├── order-history/
│   │   │   └── page.tsx              # Past orders list from LocalStorage
│   │   ├── returns/
│   │   │   └── page.tsx              # 7-day return policy & process guidelines
│   │   └── order-success/
│   │       └── page.tsx              # Order confirmation receipt
│   ├── components/
│   │   ├── Header.tsx                # Top navigation & search bar
│   │   ├── Footer.tsx                # Trust badges, links & customer support
│   │   ├── CategoryNav.tsx           # Category tabs navigation
│   │   ├── HeroBanner.tsx            # Promotional hero banner
│   │   ├── ProductCard.tsx           # Grid product card with wishlist & cart
│   │   ├── ProductGrid.tsx           # Responsive 2 to 5 columns grid & empty state
│   │   ├── ProductFilters.tsx        # Search, category, and sort controls
│   │   ├── SearchBar.tsx             # Search input with clear button
│   │   ├── CartItem.tsx              # Item row with stepper & remove action
│   │   ├── QuantitySelector.tsx      # Min/max quantity controls
│   │   ├── ProductImage.tsx          # Resilient image with category SVG fallback
│   │   └── Navigation.tsx            # Next.js App Router compatible router & Link
│   ├── context/
│   │   ├── CartContext.tsx           # Cart state & LocalStorage sync
│   │   ├── WishlistContext.tsx       # Wishlist state & LocalStorage sync
│   │   └── SearchContext.tsx         # Search query, category, and sorting state
│   ├── data/
│   │   └── products.ts               # 15 sample products with Indian prices
│   ├── hooks/
│   │   └── useLocalStorage.ts        # Client-safe localStorage hook
│   ├── types/
│   │   ├── product.ts                # Product, Category & Sort types
│   │   └── cart.ts                   # CartItem, Checkout & Order types
│   ├── lib/
│   │   └── utils.ts                  # Indian Rupee formatting (₹) and utilities
│   ├── App.tsx                       # App router integration
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Tailwind CSS v4 configuration
├── package.json
└── README.md
```

## 💻 Installation & Running Locally

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open the browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Build for production**:
   ```bash
   npm run build
   ```
