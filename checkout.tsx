import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/database/database';
import { ArrowLeft, MapPin, CreditCard, Smartphone, Truck, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function CheckoutScreen() {
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'cash_on_delivery'>('mobile_money');
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    confirmPhoneNumber: '',
    mobileNetwork: 'MTN' as 'MTN' | 'Vodafone' | 'AirtelTigo',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const subtotal = getTotalPrice();
  const deliveryFee = 15.00;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to place an order');
        return;
      }

      // Create order
      const orderId = await database.createOrder(
        parseInt(user.id),
        items.map(item => ({
          productId: parseInt(item.product.id),
          productName: item.product.name,
          productPrice: item.product.price,
          productImage: item.product.image,
          quantity: item.quantity
        })),
        {
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          state: deliveryInfo.state,
          zip: deliveryInfo.zipCode,
          phone: deliveryInfo.phone
        },
        paymentMethod
      );

      if (!orderId) {
        Alert.alert('Error', 'Failed to create order');
        return;
      }

      // Create payment record
      const paymentId = await database.createPayment(
        orderId,
        paymentMethod,
        finalTotal,
        {
          phoneNumber: paymentMethod === 'mobile_money' ? paymentData.phoneNumber : undefined,
          mobileNetwork: paymentMethod === 'mobile_money' ? paymentData.mobileNetwork : undefined,
          cardLastFour: paymentMethod === 'card' ? paymentData.cardNumber.slice(-4) : undefined,
          transactionId: `TXN_${Date.now()}_${orderId}`
        }
      );

      if (paymentMethod === 'mobile_money') {
        await processMobileMoneyPayment(paymentId!, orderId);
      } else if (paymentMethod === 'card') {
        await processCardPayment(paymentId!, orderId);
      } else {
        // Cash on delivery - mark as pending
        await database.updatePaymentStatus(paymentId!, 'pending');
        showSuccessMessage(orderId, 'Your order has been placed! You will pay upon delivery.');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'An error occurred while placing your order');
    } finally {
      setIsProcessing(false);
    }
  };

  const processMobileMoneyPayment = async (paymentId: number, orderId: number) => {
    // Simulate mobile money payment process
    Alert.alert(
      'Mobile Money Payment',
      `A payment request of GH₵${finalTotal.toFixed(2)} has been sent to ${paymentData.phoneNumber} (${paymentData.mobileNetwork}). Please check your phone and approve the payment.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => database.updatePaymentStatus(paymentId, 'failed')
        },
        {
          text: 'I have approved',
          onPress: async () => {
            // Simulate payment processing
            setTimeout(async () => {
              const success = Math.random() > 0.2; // 80% success rate for demo
              
              if (success) {
                await database.updatePaymentStatus(paymentId, 'completed', `MOMO_${Date.now()}`);
                showSuccessMessage(orderId, 'Payment successful! Your order has been confirmed.');
              } else {
                await database.updatePaymentStatus(paymentId, 'failed');
                Alert.alert('Payment Failed', 'Your mobile money payment was not successful. Please try again.');
              }
            }, 2000);
          }
        }
      ]
    );
  };

  const processCardPayment = async (paymentId: number, orderId: number) => {
    // Simulate card payment processing
    Alert.alert(
      'Processing Payment',
      'Please wait while we process your card payment...',
      [],
      { cancelable: false }
    );

    setTimeout(async () => {
      const success = Math.random() > 0.15; // 85% success rate for demo
      
      if (success) {
        await database.updatePaymentStatus(paymentId, 'completed', `CARD_${Date.now()}`);
        showSuccessMessage(orderId, 'Payment successful! Your order has been confirmed.');
      } else {
        await database.updatePaymentStatus(paymentId, 'failed');
        Alert.alert('Payment Failed', 'Your card payment was declined. Please check your card details and try again.');
      }
    }, 3000);
  };

  const showSuccessMessage = (orderId: number, message: string) => {
    Alert.alert(
      'Order Placed Successfully!',
      `${message}\n\nOrder ID: #${orderId}\n\nYou can track your order in the Account section.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            clearCart();
            router.replace('/(tabs)');
          },
        },
        {
          text: 'View Orders',
          onPress: () => {
            clearCart();
            router.replace('/account/orders');
          },
        },
      ]
    );
  };

  const validateForm = () => {
    if (!deliveryInfo.fullName || !deliveryInfo.address || !deliveryInfo.city || !deliveryInfo.phone) {
      Alert.alert('Error', 'Please fill in all delivery information fields');
      return false;
    }

    if (paymentMethod === 'mobile_money') {
      if (!paymentData.phoneNumber || !paymentData.confirmPhoneNumber) {
        Alert.alert('Error', 'Please enter and confirm your mobile money number');
        return false;
      }
      if (paymentData.phoneNumber !== paymentData.confirmPhoneNumber) {
        Alert.alert('Error', 'Phone numbers do not match');
        return false;
      }
      if (!/^0\d{9}$/.test(paymentData.phoneNumber)) {
        Alert.alert('Error', 'Please enter a valid 10-digit phone number starting with 0');
        return false;
      }
    }

    if (paymentMethod === 'card') {
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
        Alert.alert('Error', 'Please fill in all card details');
        return false;
      }
      if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        Alert.alert('Error', 'Please enter a valid 16-digit card number');
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        Alert.alert('Error', 'Please enter expiry date in MM/YY format');
        return false;
      }
      if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        Alert.alert('Error', 'Please enter a valid CVV');
        return false;
      }
    }

    return true;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'mobile_money':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Mobile Network</Text>
            <View style={styles.networkContainer}>
              {(['MTN', 'Vodafone', 'AirtelTigo'] as const).map((network) => (
                <TouchableOpacity
                  key={network}
                  style={[
                    styles.networkButton,
                    paymentData.mobileNetwork === network && styles.networkButtonActive
                  ]}
                  onPress={() => setPaymentData(prev => ({ ...prev, mobileNetwork: network }))}
                >
                  <Text style={[
                    styles.networkButtonText,
                    paymentData.mobileNetwork === network && styles.networkButtonTextActive
                  ]}>
                    {network}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0241234567"
              value={paymentData.phoneNumber}
              onChangeText={(text) => setPaymentData(prev => ({ ...prev, phoneNumber: text }))}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text style={styles.formLabel}>Confirm Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0241234567"
              value={paymentData.confirmPhoneNumber}
              onChangeText={(text) => setPaymentData(prev => ({ ...prev, confirmPhoneNumber: text }))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        );

      case 'card':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChangeText={(text) => setPaymentData(prev => ({ ...prev, cardNumber: formatCardNumber(text) }))}
              keyboardType="numeric"
              maxLength={19}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChangeText={(text) => setPaymentData(prev => ({ ...prev, expiryDate: formatExpiryDate(text) }))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={paymentData.cvv}
                  onChangeText={(text) => setPaymentData(prev => ({ ...prev, cvv: text.replace(/\D/g, '') }))}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        );

      case 'cash_on_delivery':
        return (
          <View style={styles.paymentForm}>
            <View style={styles.codInfo}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.codText}>
                You will pay GH₵{finalTotal.toFixed(2)} when your order is delivered to your address.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      {/* Delivery Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPin size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Delivery Address</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={deliveryInfo.fullName}
            onChangeText={(text) => setDeliveryInfo({...deliveryInfo, fullName: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Address *"
            value={deliveryInfo.address}
            onChangeText={(text) => setDeliveryInfo({...deliveryInfo, address: text})}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City *"
              value={deliveryInfo.city}
              onChangeText={(text) => setDeliveryInfo({...deliveryInfo, city: text})}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State"
              value={deliveryInfo.state}
              onChangeText={(text) => setDeliveryInfo({...deliveryInfo, state: text})}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="ZIP Code"
              value={deliveryInfo.zipCode}
              onChangeText={(text) => setDeliveryInfo({...deliveryInfo, zipCode: text})}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Phone *"
              value={deliveryInfo.phone}
              onChangeText={(text) => setDeliveryInfo({...deliveryInfo, phone: text})}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CreditCard size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Payment Method</Text>
        </View>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'mobile_money' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('mobile_money')}
        >
          <View style={styles.paymentInfo}>
            <Smartphone size={20} color="#6B7280" />
            <Text style={styles.paymentText}>Mobile Money</Text>
          </View>
          <View style={[styles.radio, paymentMethod === 'mobile_money' && styles.radioActive]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('card')}
        >
          <View style={styles.paymentInfo}>
            <CreditCard size={20} color="#6B7280" />
            <Text style={styles.paymentText}>Debit/Credit Card</Text>
          </View>
          <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'cash_on_delivery' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('cash_on_delivery')}
        >
          <View style={styles.paymentInfo}>
            <Truck size={20} color="#6B7280" />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </View>
          <View style={[styles.radio, paymentMethod === 'cash_on_delivery' && styles.radioActive]} />
        </TouchableOpacity>

        {renderPaymentForm()}
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
          <Text style={styles.summaryValue}>GH₵{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>GH₵{deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (8%)</Text>
          <Text style={styles.summaryValue}>GH₵{tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>GH₵{finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]} 
        onPress={handlePlaceOrder}
        disabled={isProcessing}
      >
        <Text style={styles.placeOrderText}>
          {isProcessing ? 'Processing...' : `Pay GH₵${finalTotal.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  paymentOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  radioActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  paymentForm: {
    marginTop: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  networkContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  networkButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  networkButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  networkButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  networkButtonTextActive: {
    color: '#FFFFFF',
  },
  codInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  codText: {
    flex: 1,
    fontSize: 14,
    color: '#15803D',
    marginLeft: 12,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  placeOrderButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 16,
    marginBottom: 32,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});