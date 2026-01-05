import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

interface UploadScreenProps {
  navigation: any;
  route: any;
}

const {width} = Dimensions.get('window');

const UploadScreen: React.FC<UploadScreenProps> = ({navigation, route}) => {
  const initialPhotos = route.params?.selectedPhotos || [];
  const [selectedImages, setSelectedImages] = useState<string[]>(initialPhotos);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10,
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        const newUris = result.assets.map(asset => asset.uri || '').filter(Boolean);
        setSelectedImages(prev => [...prev, ...newUris]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages(prev => prev.filter(item => item !== uri));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to upload.');
      return;
    }

    setUploading(true);
    
    try {
      // Simulate upload - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        `${selectedImages.length} photo(s) uploaded successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Photos</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.addButton} onPress={pickImages}>
              <Text style={styles.addIcon}>+</Text>
              <Text style={styles.addText}>Add Photos</Text>
            </TouchableOpacity>
            
            {selectedImages.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.imageContainer}>
                <Image source={{uri}} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(uri)}>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          {selectedImages.length > 0 && (
            <Text style={styles.countText}>
              {selectedImages.length} photo(s) selected
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption for your photos..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={caption}
            onChangeText={setCaption}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share With</Text>
          <View style={styles.shareOptions}>
            <TouchableOpacity style={[styles.shareOption, styles.shareOptionActive]}>
              <Text style={styles.shareOptionIcon}>👥</Text>
              <Text style={styles.shareOptionText}>My Class</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption}>
              <Text style={styles.shareOptionIcon}>🔒</Text>
              <Text style={styles.shareOptionText}>Private</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption}>
              <Text style={styles.shareOptionIcon}>🌍</Text>
              <Text style={styles.shareOptionText}>Public</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (uploading || selectedImages.length === 0) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={uploading || selectedImages.length === 0}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>
              Upload {selectedImages.length > 0 ? `(${selectedImages.length})` : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#EEF2FF',
  },
  addIcon: {
    fontSize: 32,
    color: '#4F46E5',
  },
  addText: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 4,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  countText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  captionInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shareOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  shareOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  uploadButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UploadScreen;
