import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

interface PhotoItem {
  uri: string;
  filename: string;
  timestamp: number;
  type: string;
}

interface GalleryScreenProps {
  navigation: any;
}

const {width} = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 4;

const GalleryScreen: React.FC<GalleryScreenProps> = ({navigation}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const fetchPhotos = useCallback(async (after?: string) => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 50,
        after: after,
        assetType: 'Photos',
        include: ['filename', 'fileExtension', 'imageSize'],
      });

      const newPhotos: PhotoItem[] = result.edges.map(edge => ({
        uri: edge.node.image.uri,
        filename: edge.node.image.filename || 'Unknown',
        timestamp: edge.node.timestamp,
        type: edge.node.type,
      }));

      if (after) {
        setPhotos(prev => [...prev, ...newPhotos]);
      } else {
        setPhotos(newPhotos);
      }

      setHasMore(result.page_info.has_next_page);
      setEndCursor(result.page_info.end_cursor);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleRefresh = () => {
    setRefreshing(true);
    setEndCursor(undefined);
    fetchPhotos();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && endCursor) {
      fetchPhotos(endCursor);
    }
  };

  const togglePhotoSelection = (uri: string) => {
    setSelectedPhotos(prev => {
      if (prev.includes(uri)) {
        return prev.filter(item => item !== uri);
      }
      return [...prev, uri];
    });
  };

  const renderPhoto = ({item}: {item: PhotoItem}) => {
    const isSelected = selectedPhotos.includes(item.uri);
    
    return (
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => togglePhotoSelection(item.uri)}
        onLongPress={() => {
          // Navigate to full screen view or details
        }}>
        <Image source={{uri: item.uri}} style={styles.photo} />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {photos.length} Photos
      </Text>
      {selectedPhotos.length > 0 && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => {
            navigation.navigate('Upload', {selectedPhotos});
          }}>
          <Text style={styles.uploadButtonText}>
            Upload ({selectedPhotos.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && photos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your gallery...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && photos.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#4F46E5" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyText}>No photos found</Text>
            <Text style={styles.emptySubtext}>
              Take some photos to see them here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  uploadButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: 2,
  },
  photoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default GalleryScreen;
