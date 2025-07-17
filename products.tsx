import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Modal, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/database/database';
import { ArrowLeft, Plus, Search, CreditCard as Edit, Trash2, Package, X } from 'lucide-react-native';
import ImageUploader from '@/components/ImageUploader';

interface Product {
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

interface Category {
  id: number;
  name: string;
}

export default function ProductsManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    imageUrl: '',
    stock: '',
    isFeatured: false,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadProducts();
      loadCategories();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const allProducts = await database.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = await database.getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      imageUrl: '',
      stock: '',
      isFeatured: false,
    });
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || '',
      categoryId: product.category_id.toString(),
      imageUrl: product.image_url,
      stock: product.stock.toString(),
      isFeatured: product.is_featured,
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(productForm.price);
    const originalPrice = productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined;
    const stock = parseInt(productForm.stock) || 0;
    const categoryId = parseInt(productForm.categoryId);

    if (price <= 0) {
      Alert.alert('Error', 'Price must be greater than 0');
      return;
    }

    if (originalPrice && originalPrice <= price) {
      Alert.alert('Error', 'Original price must be greater than current price');
      return;
    }

    try {
      if (editingProduct) {
        // Update existing product
        const success = await database.updateProduct(editingProduct.id, {
          name: productForm.name,
          description: productForm.description,
          price,
          originalPrice,
          categoryId,
          imageUrl: productForm.imageUrl || 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400',
          stock,
          isFeatured: productForm.isFeatured,
        });

        if (success) {
          Alert.alert('Success', 'Product updated successfully');
          loadProducts();
          setShowAddModal(false);
          resetForm();
        } else {
          Alert.alert('Error', 'Failed to update product');
        }
      } else {
        // Add new product
        const productId = await database.addProduct({
          name: productForm.name,
          description: productForm.description,
          price,
          originalPrice,
          categoryId,
          imageUrl: productForm.imageUrl || 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400',
          stock,
          isFeatured: productForm.isFeatured,
        });

        if (productId) {
          Alert.alert('Success', 'Product added successfully');
          loadProducts();
          setShowAddModal(false);
          resetForm();
        } else {
          Alert.alert('Error', 'Failed to add product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'An error occurred while saving the product');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await database.deleteProduct(product.id.toString());
            if (success) {
              loadProducts();
              Alert.alert('Success', 'Product deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const category = categories.find(c => c.id === item.category_id);
    
    return (
      <View style={styles.productItem}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{category?.name || 'Unknown Category'}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.productPricing}>
            <Text style={styles.productPrice}>GH₵{item.price.toFixed(2)}</Text>
            {item.original_price && (
              <Text style={styles.originalPrice}>GH₵{item.original_price.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.productMeta}>
            <Text style={styles.productStock}>Stock: {item.stock}</Text>
            {item.is_featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProduct(item)}
          >
            <Edit size={16} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(item)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProductModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <X size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Product Name *</Text>
            <TextInput
              style={styles.formInput}
              value={productForm.name}
              onChangeText={(text) => setProductForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter product name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={productForm.description}
              onChangeText={(text) => setProductForm(prev => ({ ...prev, description: text }))}
              placeholder="Enter product description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.formLabel}>Price (GH₵) *</Text>
              <TextInput
                style={styles.formInput}
                value={productForm.price}
                onChangeText={(text) => setProductForm(prev => ({ ...prev, price: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.formLabel}>Original Price (GH₵)</Text>
              <TextInput
                style={styles.formInput}
                value={productForm.originalPrice}
                onChangeText={(text) => setProductForm(prev => ({ ...prev, originalPrice: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category *</Text>
            <View style={styles.categoryPicker}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    productForm.categoryId === category.id.toString() && styles.categoryOptionActive
                  ]}
                  onPress={() => setProductForm(prev => ({ ...prev, categoryId: category.id.toString() }))}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    productForm.categoryId === category.id.toString() && styles.categoryOptionTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Image URL</Text>
            <ImageUploader
              onImageUploaded={(url) => setProductForm(prev => ({ ...prev, imageUrl: url }))}
              currentImageUrl={productForm.imageUrl}
              placeholder="Upload Product Image"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Stock Quantity</Text>
            <TextInput
              style={styles.formInput}
              value={productForm.stock}
              onChangeText={(text) => setProductForm(prev => ({ ...prev, stock: text }))}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.formLabel}>Featured Product</Text>
              <Switch
                value={productForm.isFeatured}
                onValueChange={(value) => setProductForm(prev => ({ ...prev, isFeatured: value }))}
                trackColor={{ false: '#F3F4F6', true: '#10B981' }}
                thumbColor={productForm.isFeatured ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowAddModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProduct}
          >
            <Text style={styles.saveButtonText}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Products Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderProductModal()}
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
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  productsList: {
    padding: 16,
  },
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productStock: {
    fontSize: 12,
    color: '#10B981',
    marginRight: 8,
  },
  featuredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
});