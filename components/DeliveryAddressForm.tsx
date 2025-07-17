import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';

interface DeliveryAddressFormProps {
  initialData?: {
    fullName: string;
    phoneNumber: string;
    regionId: number;
    cityId: number;
    streetAddress: string;
    postalCode: string;
    deliveryNotes: string;
    label: string;
    isDefault: boolean;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  submitButtonText: string;
}

const regions = [
  { id: 1, name: 'Greater Accra' },
  { id: 2, name: 'Ashanti' },
  { id: 3, name: 'Western' },
  { id: 4, name: 'Eastern' },
  { id: 5, name: 'Northern' },
];

const cities = [
  { id: 1, name: 'Accra', regionId: 1 },
  { id: 2, name: 'Tema', regionId: 1 },
  { id: 3, name: 'Kumasi', regionId: 2 },
  { id: 4, name: 'Obuasi', regionId: 2 },
  { id: 5, name: 'Takoradi', regionId: 3 },
];

export default function DeliveryAddressForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  submitButtonText
}: DeliveryAddressFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    phoneNumber: initialData?.phoneNumber || '',
    regionId: initialData?.regionId || 1,
    cityId: initialData?.cityId || 1,
    streetAddress: initialData?.streetAddress || '',
    postalCode: initialData?.postalCode || '',
    deliveryNotes: initialData?.deliveryNotes || '',
    label: initialData?.label || '',
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCities = cities.filter(city => city.regionId === formData.regionId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => updateFormData('fullName', text)}
            placeholder="Enter full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => updateFormData('phoneNumber', text)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Region *</Text>
          <View style={styles.pickerContainer}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.pickerOption,
                  formData.regionId === region.id && styles.pickerOptionActive
                ]}
                onPress={() => {
                  updateFormData('regionId', region.id);
                  // Reset city when region changes
                  const firstCity = cities.find(c => c.regionId === region.id);
                  if (firstCity) {
                    updateFormData('cityId', firstCity.id);
                  }
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.regionId === region.id && styles.pickerOptionTextActive
                ]}>
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          <View style={styles.pickerContainer}>
            {filteredCities.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.pickerOption,
                  formData.cityId === city.id && styles.pickerOptionActive
                ]}
                onPress={() => updateFormData('cityId', city.id)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.cityId === city.id && styles.pickerOptionTextActive
                ]}>
                  {city.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.streetAddress}
            onChangeText={(text) => updateFormData('streetAddress', text)}
            placeholder="Enter street address"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            value={formData.postalCode}
            onChangeText={(text) => updateFormData('postalCode', text)}
            placeholder="Enter postal code"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Notes</Text>
          <TextInput
            style={styles.input}
            value={formData.deliveryNotes}
            onChangeText={(text) => updateFormData('deliveryNotes', text)}
            placeholder="Any special delivery instructions"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address Label</Text>
          <TextInput
            style={styles.input}
            value={formData.label}
            onChangeText={(text) => updateFormData('label', text)}
            placeholder="e.g., Home, Office, etc."
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Set as Default Address</Text>
          <Switch
            value={formData.isDefault}
            onValueChange={(value) => updateFormData('isDefault', value)}
            trackColor={{ false: '#F3F4F6', true: '#10B981' }}
            thumbColor={formData.isDefault ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Saving...' : submitButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  pickerOptionTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});