// Mock database implementation for demo purposes
// In a real app, this would connect to a real database

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  role: string;
  avatar?: string;
  date_of_birth?: string;
  country?: string;
  two_factor_enabled: boolean;
  last_login?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: number;
  image_url: string;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;
  delivery_phone: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  amount: number;
  status: string;
  transaction_id?: string;
  payment_details?: any;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
  added_at: string;
}

export interface DeliveryAddress {
  id: number;
  user_id: number;
  full_name: string;
  phone_number: string;
  region_id: number;
  region_name: string;
  city_id: number;
  city_name: string;
  street_address: string;
  postal_code?: string;
  delivery_notes?: string;
  label?: string;
  is_default: boolean;
  created_at: string;
}

export interface LoginHistory {
  id: number;
  user_id: number;
  login_time: string;
  ip_address?: string;
  user_agent?: string;
}

// Mock data storage
let users: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@elitebuy.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    two_factor_enabled: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    two_factor_enabled: false,
    created_at: new Date().toISOString()
  }
];

let categories: Category[] = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Fashion',
    slug: 'fashion',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Home & Garden',
    slug: 'home-garden',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

let products: Product[] = [
  {
    id: 1,
    name: 'Smartphone Pro Max',
    description: 'Latest flagship smartphone with advanced features',
    price: 999.99,
    original_price: 1199.99,
    category_id: 1,
    image_url: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 50,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones',
    price: 299.99,
    category_id: 1,
    image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 30,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

let orders: Order[] = [];
let orderItems: OrderItem[] = [];
let payments: Payment[] = [];
let wishlistItems: WishlistItem[] = [];
let deliveryAddresses: DeliveryAddress[] = [];
let loginHistory: LoginHistory[] = [];

// Auto-increment counters
let nextUserId = 3;
let nextProductId = 3;
let nextOrderId = 1;
let nextPaymentId = 1;
let nextWishlistId = 1;
let nextAddressId = 1;
let nextLoginId = 1;

export const database = {
  // User operations
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      // Update last login
      user.last_login = new Date().toISOString();
    }
    return user || null;
  },

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    country: string;
    role: string;
  }): Promise<number | null> {
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      return null;
    }

    const newUser: User = {
      id: nextUserId++,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      date_of_birth: userData.dateOfBirth,
      country: userData.country,
      role: userData.role,
      avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      two_factor_enabled: false,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    return newUser.id;
  },

  async getUserById(id: number): Promise<User | null> {
    return users.find(u => u.id === id) || null;
  },

  async updateUserProfile(id: number, updates: Partial<User>): Promise<boolean> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    users[userIndex] = { ...users[userIndex], ...updates };
    return true;
  },

  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    users[userIndex].password = newPassword;
    return true;
  },

  async deleteUser(id: number): Promise<boolean> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    // Also clean up related data
    orders = orders.filter(o => o.user_id !== id);
    wishlistItems = wishlistItems.filter(w => w.user_id !== id);
    deliveryAddresses = deliveryAddresses.filter(d => d.user_id !== id);
    loginHistory = loginHistory.filter(l => l.user_id !== id);
    return true;
  },

  async getAllUsers(): Promise<User[]> {
    return users;
  },

  async getUserStats(userId: number): Promise<{ totalOrders: number; totalSpent: number; wishlistCount: number }> {
    const userOrders = orders.filter(o => o.user_id === userId);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const wishlistCount = wishlistItems.filter(w => w.user_id === userId).length;

    return {
      totalOrders: userOrders.length,
      totalSpent,
      wishlistCount
    };
  },

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return products;
  },

  async getFeaturedProducts(categoryId?: number, limit?: number): Promise<Product[]> {
    let filtered = products.filter(p => p.is_featured && p.is_active);
    
    if (categoryId) {
      filtered = filtered.filter(p => p.category_id === categoryId);
    }
    
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  },

  async addProduct(productData: {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    categoryId: number;
    imageUrl: string;
    stock: number;
    isFeatured: boolean;
  }): Promise<number | null> {
    const newProduct: Product = {
      id: nextProductId++,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      original_price: productData.originalPrice,
      category_id: productData.categoryId,
      image_url: productData.imageUrl,
      stock: productData.stock,
      is_featured: productData.isFeatured,
      is_active: true,
      created_at: new Date().toISOString()
    };

    products.push(newProduct);
    return newProduct.id;
  },

  async updateProduct(id: number, updates: Partial<Product>): Promise<boolean> {
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) return false;

    products[productIndex] = { ...products[productIndex], ...updates };
    return true;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) return false;

    products.splice(productIndex, 1);
    return true;
  },

  // Category operations
  async getCategories(parentId?: number): Promise<Category[]> {
    if (parentId) {
      return categories.filter(c => c.parent_id === parentId && c.is_active);
    }
    return categories.filter(c => !c.parent_id && c.is_active);
  },

  // Order operations
  async createOrder(
    userId: number,
    items: Array<{
      productId: number;
      productName: string;
      productPrice: number;
      productImage: string;
      quantity: number;
    }>,
    deliveryInfo: {
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
    },
    paymentMethod: string
  ): Promise<number | null> {
    const totalAmount = items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

    const newOrder: Order = {
      id: nextOrderId++,
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending',
      payment_method: paymentMethod,
      delivery_address: deliveryInfo.address,
      delivery_city: deliveryInfo.city,
      delivery_state: deliveryInfo.state,
      delivery_zip: deliveryInfo.zip,
      delivery_phone: deliveryInfo.phone,
      created_at: new Date().toISOString()
    };

    orders.push(newOrder);

    // Create order items
    items.forEach(item => {
      const orderItem: OrderItem = {
        id: orderItems.length + 1,
        order_id: newOrder.id,
        product_id: item.productId,
        product_name: item.productName,
        product_price: item.productPrice,
        product_image: item.productImage,
        quantity: item.quantity,
        subtotal: item.productPrice * item.quantity
      };
      orderItems.push(orderItem);
    });

    return newOrder.id;
  },

  async getUserOrders(userId: number): Promise<(Order & { items: OrderItem[] })[]> {
    const userOrders = orders.filter(o => o.user_id === userId);
    return userOrders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    }));
  },

  // Payment operations
  async createPayment(
    orderId: number,
    paymentMethod: string,
    amount: number,
    paymentDetails: any
  ): Promise<number | null> {
    const newPayment: Payment = {
      id: nextPaymentId++,
      order_id: orderId,
      payment_method: paymentMethod,
      amount,
      status: 'pending',
      payment_details: paymentDetails,
      created_at: new Date().toISOString()
    };

    payments.push(newPayment);
    return newPayment.id;
  },

  async updatePaymentStatus(paymentId: number, status: string, transactionId?: string): Promise<boolean> {
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) return false;

    payments[paymentIndex].status = status;
    if (transactionId) {
      payments[paymentIndex].transaction_id = transactionId;
    }

    // Update order status if payment is completed
    if (status === 'completed') {
      const payment = payments[paymentIndex];
      const orderIndex = orders.findIndex(o => o.id === payment.order_id);
      if (orderIndex !== -1) {
        orders[orderIndex].status = 'processing';
      }
    }

    return true;
  },

  // Wishlist operations
  async addToWishlist(userId: number, productId: number): Promise<boolean> {
    // Check if already in wishlist
    if (wishlistItems.find(w => w.user_id === userId && w.product_id === productId)) {
      return false;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const category = categories.find(c => c.id === product.category_id);

    const wishlistItem: WishlistItem = {
      id: nextWishlistId++,
      user_id: userId,
      product_id: productId,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image_url,
      product_category: category?.name || 'Unknown',
      added_at: new Date().toISOString()
    };

    wishlistItems.push(wishlistItem);
    return true;
  },

  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    const itemIndex = wishlistItems.findIndex(w => w.user_id === userId && w.product_id === productId);
    if (itemIndex === -1) return false;

    wishlistItems.splice(itemIndex, 1);
    return true;
  },

  async getUserWishlist(userId: number): Promise<WishlistItem[]> {
    return wishlistItems.filter(w => w.user_id === userId);
  },

  // Delivery address operations
  async createDeliveryAddress(userId: number, addressData: any): Promise<number | null> {
    const newAddress: DeliveryAddress = {
      id: nextAddressId++,
      user_id: userId,
      full_name: addressData.fullName,
      phone_number: addressData.phoneNumber,
      region_id: addressData.regionId,
      region_name: addressData.regionName,
      city_id: addressData.cityId,
      city_name: addressData.cityName,
      street_address: addressData.streetAddress,
      postal_code: addressData.postalCode,
      delivery_notes: addressData.deliveryNotes,
      label: addressData.label,
      is_default: addressData.isDefault,
      created_at: new Date().toISOString()
    };

    // If this is set as default, unset other defaults
    if (newAddress.is_default) {
      deliveryAddresses.forEach(addr => {
        if (addr.user_id === userId) {
          addr.is_default = false;
        }
      });
    }

    deliveryAddresses.push(newAddress);
    return newAddress.id;
  },

  async getUserDeliveryAddresses(userId: number): Promise<DeliveryAddress[]> {
    return deliveryAddresses.filter(a => a.user_id === userId);
  },

  async updateDeliveryAddress(addressId: number, userId: number, updates: any): Promise<boolean> {
    const addressIndex = deliveryAddresses.findIndex(a => a.id === addressId && a.user_id === userId);
    if (addressIndex === -1) return false;

    deliveryAddresses[addressIndex] = { ...deliveryAddresses[addressIndex], ...updates };
    return true;
  },

  async deleteDeliveryAddress(addressId: number, userId: number): Promise<boolean> {
    const addressIndex = deliveryAddresses.findIndex(a => a.id === addressId && a.user_id === userId);
    if (addressIndex === -1) return false;

    deliveryAddresses.splice(addressIndex, 1);
    return true;
  },

  async setDefaultDeliveryAddress(addressId: number, userId: number): Promise<boolean> {
    // First, unset all defaults for this user
    deliveryAddresses.forEach(addr => {
      if (addr.user_id === userId) {
        addr.is_default = false;
      }
    });

    // Then set the specified address as default
    const addressIndex = deliveryAddresses.findIndex(a => a.id === addressId && a.user_id === userId);
    if (addressIndex === -1) return false;

    deliveryAddresses[addressIndex].is_default = true;
    return true;
  },

  // Login history operations
  async recordLogin(userId: number, ipAddress: string, userAgent: string): Promise<void> {
    const loginRecord: LoginHistory = {
      id: nextLoginId++,
      user_id: userId,
      login_time: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent
    };

    loginHistory.push(loginRecord);
  },

  async getLoginHistory(userId: number, limit: number = 10): Promise<LoginHistory[]> {
    return loginHistory
      .filter(l => l.user_id === userId)
      .sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())
      .slice(0, limit);
  },

  // Analytics operations
  async getAnalytics(): Promise<any> {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueGrowth: 12.5, // Mock growth percentage
      ordersGrowth: 8.3,
      usersGrowth: 15.2,
      topCategories: categories.map(cat => ({
        name: cat.name,
        count: products.filter(p => p.category_id === cat.id).length
      })),
      recentActivity: [
        { description: 'New user registered', time: '2 hours ago' },
        { description: 'Order #123 completed', time: '4 hours ago' },
        { description: 'Product added to inventory', time: '6 hours ago' }
      ]
    };
  }
};