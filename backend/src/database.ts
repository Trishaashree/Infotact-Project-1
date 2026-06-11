// export interface Product {
//   id: string;
//   sku: string;
//   name: string;
//   price: number;
// }

// export interface Inventory {
//   productId: string;
//   storeLocation: string;
//   quantity: number;
// }

// export interface OrderItem {
//   productId: string;
//   sku: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
// }

// export interface Order {
//   id: string;
//   storeLocation: string;
//   items: OrderItem[];
//   subtotal: number;
//   tax: number;
//   finalTotal: number;
//   paymentMethod: string;
//   createdAt: Date;
// }

// // Global RAM Storage State Tables (Resets on server restart)
// export const ProductsTable: Product[] = [
//   { id: "prod_01", sku: "880101", name: "Premium Barcode Wireless Scanner", price: 89.99 },
//   { id: "prod_02", sku: "880102", name: "High-Speed Thermal Receipt Printer", price: 124.50 },
//   { id: "prod_03", sku: "880103", name: "Heavy Duty Cash Drawer Drawer-X", price: 45.00 },
//   { id: "prod_04", sku: "880104", name: "Omnidirectional Desktop Scanner USB", price: 155.00 },
//   { id: "prod_05", sku: "880105", name: "Touchscreen POS Merchant Terminal Mount", price: 320.00 }
// ];

// export const InventoryTable: Inventory[] = [
//   { productId: "prod_01", storeLocation: "Main Branch", quantity: 25 },
//   { productId: "prod_02", storeLocation: "Main Branch", quantity: 12 },
//   { productId: "prod_03", storeLocation: "Main Branch", quantity: 5 },
//   { productId: "prod_04", storeLocation: "Main Branch", quantity: 8 },
//   { productId: "prod_05", storeLocation: "Main Branch", quantity: 3 }
// ];

// export const OrdersTable: Order[] = [];

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
}

export interface Inventory {
  productId: string;
  storeLocation: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  storeLocation: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  finalTotal: number;
  paymentMethod: string;
  createdAt: Date;
}

// 🔐 ADDED FOR LOGIN CAPABILITIES
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Cashier' | 'Manager';
}

// Global RAM Storage State Tables (Resets on server restart)
export const ProductsTable: Product[] = [
  { id: "prod_01", sku: "880101", name: "Premium Barcode Wireless Scanner", price: 89.99 },
  { id: "prod_02", sku: "880102", name: "High-Speed Thermal Receipt Printer", price: 124.50 },
  { id: "prod_03", sku: "880103", name: "Heavy Duty Cash Drawer Drawer-X", price: 45.00 },
  { id: "prod_04", sku: "880104", name: "Omnidirectional Desktop Scanner USB", price: 155.00 },
  { id: "prod_05", sku: "880105", name: "Touchscreen POS Merchant Terminal Mount", price: 320.00 }
];

export const InventoryTable: Inventory[] = [
  { productId: "prod_01", storeLocation: "Main Branch", quantity: 25 },
  { productId: "prod_02", storeLocation: "Main Branch", quantity: 12 },
  { productId: "prod_03", storeLocation: "Main Branch", quantity: 5 },
  { productId: "prod_04", storeLocation: "Main Branch", quantity: 8 },
  { productId: "prod_05", storeLocation: "Main Branch", quantity: 3 }
];

export const OrdersTable: Order[] = [];

// 🔐 ADDED MOCK USER ENTRIES (Resets on server restart)
export const UsersTable: User[] = [
  { id: "u_01", email: "cashier@retail.com", name: "Sarah Jenkins", role: "Cashier" },
  { id: "u_02", email: "manager@retail.com", name: "Alex Mercer", role: "Manager" }
];