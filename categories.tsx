import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { database } from '@/database/database';
import { ChevronRight } from 'lucide-react-native';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: number;
}

interface CategorySection {
  category: Category;
  products: Product[];
}

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryContent(selectedCategory.id);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const mainCategories = await database.getCategories();
      setCategories(mainCategories);
      if (mainCategories.length > 0) {
        setSelectedCategory(mainCategories[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryContent = async (categoryId: number) => {
    try {
      // Get subcategories
      const subcategories = await database.getCategories(categoryId);
      
      if (subcategories.length > 0) {
        // If has subcategories, show products for each subcategory
        const sections: CategorySection[] = [];
        
        for (const subcategory of subcategories) {
          const products = await database.getFeaturedProducts(subcategory.id, 4);
          sections.push({
            category: subcategory,
            products
          });
        }
        
        setCategorySections(sections);
      } else {
        // If no subcategories, show products directly for this category
        const products = await database.getFeaturedProducts(categoryId, 8);
        setCategorySections([{
          category: selectedCategory!,
          products
        }]);
      }
    } catch (error) {
      console.error('Error loading category content:', error);
    }
  };

  const handleProductPress = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  const handleSeeAllProducts = (categoryId: number) => {
    router.push(`/(tabs)?category=${categoryId}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item.id)}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>GH₵{item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderCategorySection = ({ item }: { item: CategorySection }) => (
    <View style={styles.categorySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{item.category.name.toUpperCase()}</Text>
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={() => handleSeeAllProducts(item.category.id)}
        >
          <Text style={styles.seeAllText}>SEE ALL</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={item.products}
        renderItem={renderProduct}
        keyExtractor={(product) => product.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>

      <View style={styles.content}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === category.id && styles.categoryItemActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory?.id === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
                <ChevronRight 
                  size={16} 
                  color={selectedCategory?.id === category.id ? '#FF6B35' : '#9CA3AF'} 
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Content */}
        <View style={styles.mainContent}>
          {selectedCategory && (
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>
              <TouchableOpacity 
                style={styles.seeAllProductsButton}
                onPress={() => handleSeeAllProducts(selectedCategory.id)}
              >
                <Text style={styles.seeAllProductsText}>SEE ALL PRODUCTS</Text>
                <ChevronRight size={16} color="#1F2937" />
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={categorySections}
            renderItem={renderCategorySection}
            keyExtractor={(item) => item.category.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sectionsContainer}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryItemActive: {
    backgroundColor: '#FFF7ED',
    borderRightWidth: 3,
    borderRightColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  categoryTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllProductsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  sectionsContainer: {
    paddingVertical: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
  },
});