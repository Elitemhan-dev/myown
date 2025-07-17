import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { database } from '@/database/database';
import EmptyState from '@/components/EmptyState';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react-native';

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      const items = await database.getUserWishlist(parseInt(user.id));
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (item: any) => {
    if (!user) return;

    Alert.alert(
      'Remove from Wishlist',
      `Remove ${item.product_name} from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await database.removeFromWishlist(parseInt(user.id), item.product_id);
            if (success) {
              setWishlistItems(prev => prev.filter(i => i.id !== item.id));
            }
          }
        }
      ]
    );
  };

  const handleAddToCart = (item: any) => {
    const product = {
      id: item.product_id.toString(),
      name: item.product_name,
      price: item.product_price,
      image: item.product_image,
      category: item.product_category,
      description: '',
      stock: 10,
      rating: 4.5,
      reviews: 0,
      seller: 'Store',
      tags: []
    };

    addToCart(product, 1);
    Alert.alert('Added to Cart', `${item.product_name} has been added to your cart.`);
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <View style={styles.wishlistItem}>
      <TouchableOpacity 
        style={styles.productContainer}
        onPress={() => router.push(`/product/${item.product_id}`)}
      >
        <Image source={{ uri: item.product_image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
          <Text style={styles.productCategory}>{item.product_category}</Text>
          <Text style={styles.productPrice}>₵{item.product_price.toFixed(2)}</Text>
          <Text style={styles.addedDate}>
            Added {new Date(item.added_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}
        >
          <ShoppingCart size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item)}
        >
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Wishlist</Text>
        </View>
        <EmptyState
          icon={Heart}
          title="Please Log In"
          subtitle="Log in to view your wishlist"
          buttonText="Go to Login"
          onButtonPress={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wishlist</Text>
        {wishlistItems.length > 0 && (
          <Text style={styles.itemCount}>{wishlistItems.length} items</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      ) : wishlistItems.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          subtitle="Save items you love to your wishlist"
          buttonText="Start Shopping"
          onButtonPress={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.wishlistList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  wishlistList: {
    padding: 16,
  },
  wishlistItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  addedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  cartButton: {
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});