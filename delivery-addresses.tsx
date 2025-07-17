import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { database, DeliveryAddress } from '@/database/database';
import DeliveryAddressForm from '@/components/DeliveryAddressForm';
import { ArrowLeft, Plus, MapPin, Phone, CreditCard as Edit, Trash2, Star } from 'lucide-react-native';

export default function DeliveryAddressesScreen() {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      const userAddresses = await database.getUserDeliveryAddresses(parseInt(user.id));
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = (address: DeliveryAddress) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this address?\n\n${address.full_name}\n${address.street_address}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await database.deleteDeliveryAddress(address.id, parseInt(user!.id));
            if (success) {
              loadAddresses();
            } else {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (address: DeliveryAddress) => {
    if (address.is_default) return;

    const success = await database.setDefaultDeliveryAddress(address.id, parseInt(user!.id));
    if (success) {
      loadAddresses();
    } else {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleSubmitForm = async (formData: any) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const addressData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        regionId: formData.regionId,
        regionName: formData.regionId, // You might want to get the actual region name
        cityId: formData.cityId,
        cityName: formData.cityId, // You might want to get the actual city name
        streetAddress: formData.streetAddress,
        postalCode: formData.postalCode,
        deliveryNotes: formData.deliveryNotes,
        label: formData.label,
        isDefault: formData.isDefault
      };

      let success = false;

      if (editingAddress) {
        success = await database.updateDeliveryAddress(
          editingAddress.id,
          parseInt(user.id),
          addressData
        );
      } else {
        const addressId = await database.createDeliveryAddress(parseInt(user.id), addressData);
        success = !!addressId;
      }

      if (success) {
        setShowForm(false);
        setEditingAddress(null);
        loadAddresses();
        Alert.alert('Success', `Address ${editingAddress ? 'updated' : 'added'} successfully`);
      } else {
        Alert.alert('Error', `Failed to ${editingAddress ? 'update' : 'add'} address`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'An error occurred while saving the address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAddressItem = ({ item }: { item: DeliveryAddress }) => (
    <View style={[styles.addressCard, item.is_default && styles.defaultAddressCard]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{item.full_name}</Text>
          {item.label && (
            <View style={styles.labelBadge}>
              <Text style={styles.labelText}>{item.label}</Text>
            </View>
          )}
        </View>
        {item.is_default && (
          <View style={styles.defaultBadge}>
            <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.addressDetails}>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.street_address}, {item.city_name}, {item.region_name}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.phone_number}</Text>
        </View>
        {item.delivery_notes && (
          <Text style={styles.deliveryNotes}>Note: {item.delivery_notes}</Text>
        )}
      </View>

      <View style={styles.addressActions}>
        {!item.is_default && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(item)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditAddress(item)}
        >
          <Edit size={16} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAddress(item)}
        >
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MapPin size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Delivery Addresses</Text>
      <Text style={styles.emptySubtitle}>Add your first delivery address to get started</Text>
      <TouchableOpacity style={styles.addFirstButton} onPress={handleAddAddress}>
        <Text style={styles.addFirstButtonText}>Add Address</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.addressList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
          </View>
          <DeliveryAddressForm
            initialData={editingAddress ? {
              fullName: editingAddress.full_name,
              phoneNumber: editingAddress.phone_number,
              regionId: editingAddress.region_id,
              cityId: editingAddress.city_id,
              streetAddress: editingAddress.street_address,
              postalCode: editingAddress.postal_code || '',
              deliveryNotes: editingAddress.delivery_notes || '',
              label: editingAddress.label || '',
              isDefault: editingAddress.is_default
            } : undefined}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
            isLoading={isSubmitting}
            submitButtonText={editingAddress ? 'Update Address' : 'Add Address'}
          />
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  addressList: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultAddressCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  labelBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  labelText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addressDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  deliveryNotes: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setDefaultButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setDefaultText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginLeft: 8,
  },
  emptyState: {
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
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
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
    textAlign: 'center',
  },
});