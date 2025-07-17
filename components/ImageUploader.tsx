import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Camera, Upload, X } from 'lucide-react-native';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  placeholder?: string;
}

export default function ImageUploader({ 
  onImageUploaded, 
  currentImageUrl, 
  placeholder = "Upload Image" 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = () => {
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => simulateImageUpload('camera')
        },
        { 
          text: 'Gallery', 
          onPress: () => simulateImageUpload('gallery')
        },
        {
          text: 'Use Sample Image',
          onPress: () => {
            const sampleImages = [
              'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400'
            ];
            const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
            onImageUploaded(randomImage);
          }
        }
      ]
    );
  };

  const simulateImageUpload = (source: 'camera' | 'gallery') => {
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      // Use a sample image URL for demo
      const sampleUrl = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
      onImageUploaded(sampleUrl);
      setIsUploading(false);
    }, 2000);
  };

  const handleRemoveImage = () => {
    onImageUploaded('');
  };

  return (
    <View style={styles.container}>
      {currentImageUrl ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentImageUrl }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
            <X size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handleImageUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <Text style={styles.uploadingText}>Uploading...</Text>
          ) : (
            <>
              <Upload size={24} color="#6B7280" />
              <Text style={styles.uploadText}>{placeholder}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  uploadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});