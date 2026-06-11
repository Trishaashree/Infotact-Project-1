// import { create } from 'zustand';

// export interface CartItem {
//   productId: string;
//   name: string;
//   price: number;
//   quantity: number;
// }

// interface POSState {
//   cart: CartItem[];
//   isOnline: boolean;
//   addToCart: (product: any) => void;
//   removeFromCart: (productId: string) => void;
//   clearCart: () => void;
//   setOnlineStatus: (status: boolean) => void;
// }

// export const usePOSStore = create<POSState>((set) => ({
//   cart: [],
//   isOnline: navigator.onLine,
//   addToCart: (product) => set((state) => {
//     const targetItem = state.cart.find(item => item.productId === product.id);
//     if (targetItem) {
//       return {
//         cart: state.cart.map(item =>
//           item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
//         )
//       };
//     }
//     return { cart: [...state.cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }] };
//   }),
//   removeFromCart: (productId) => set((state) => ({
//     cart: state.cart.filter(item => item.productId !== productId)
//   })),
//   clearCart: () => set({ cart: [] }),
//   setOnlineStatus: (status) => set({ isOnline: status })
// }));


import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface UserProfile {
  name: string;
  role: 'Cashier' | 'Manager';
  email: string;
}

interface POSState {
  cart: CartItem[];
  isOnline: boolean;
  user: UserProfile | null;
  token: string | null;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setOnlineStatus: (status: boolean) => void;
  loginUser: (user: UserProfile, token: string) => void;
  logoutUser: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],
  isOnline: navigator.onLine,
  user: JSON.parse(localStorage.getItem('pos_user') || 'null'),
  token: localStorage.getItem('pos_token') || null,
  
  addToCart: (product) => set((state) => {
    const targetItem = state.cart.find(item => item.productId === product.id);
    if (targetItem) {
      return {
        cart: state.cart.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    return { cart: [...state.cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }] };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.productId !== productId)
  })),
  clearCart: () => set({ cart: [] }),
  setOnlineStatus: (status) => set({ isOnline: status }),
  
  loginUser: (user, token) => {
    localStorage.setItem('pos_user', JSON.stringify(user));
    localStorage.setItem('pos_token', token);
    set({ user, token });
  },
  logoutUser: () => {
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_token');
    set({ user: null, token: null, cart: [] });
  }
}));