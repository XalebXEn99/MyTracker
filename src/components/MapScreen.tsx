import MapboxGL from '@react-native-mapbox-gl/maps';
import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList, Alert} from 'react-native';
import {fetchMemories, initializeDatabase} from '../services/Database';
import {MemoryRecord} from '../types';
import {MapboxSettings, mapboxConfig} from '../services/MapboxService';
import MemoryDetailModal from './MemoryDetailModal';

MapboxGL.setAccessToken(mapboxConfig.accessToken);
MapboxGL.setTelemetryEnabled(mapboxConfig.telemetryEnabled);

const MapScreen = () => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryRecord | null>(null);
  const [showList, setShowList] = useState(false);
  const [followUser, setFollowUser] = useState(true);

  const sources = useMemo(() => {
    return {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: memories.map((memory) => ({
          type: 'Feature',
          id: memory.id,
          properties: {
            title: memory.title,
            note: memory.note,
            icon: 'marker',
          },
          geometry: {
            type: 'Point',
            coordinates: [memory.longitude, memory.latitude],
          },
        })),
      },
    } as const;
  }, [memories]);

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      const items = await fetchMemories();
      setMemories(items);
    };
    init();
  }, []);

  const onPressMemory = async (feature: any) => {
    const id = feature.properties?.id || feature.id;
    const memory = memories.find((item) => item.id === id);
    if (memory) {
      setSelectedMemory(memory);
    }
  };

  const addMemory = () => {
    Alert.alert('Add memory', 'Use camera and note prompts to add a new memory in a later build.', [
      {text: 'OK'},
    ]);
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={mapboxConfig.styleURL}>
        <MapboxGL.Camera zoomLevel={12} followUserLocation={followUser} />
        <MapboxGL.UserLocation visible animated />
        <MapboxGL.ShapeSource id="memories" shape={sources.data as GeoJSON.FeatureCollection} onPress={(e) => onPressMemory(e.features?.[0])}>
          <MapboxGL.SymbolLayer
            id="memorySymbols"
            style={{
              iconImage: 'marker-15',
              iconAllowOverlap: true,
              iconSize: 1.5,
              textField: ['get', 'title'],
              textOffset: [0, 1.5],
            }}
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => setFollowUser((prev) => !prev)}>
          <Text style={styles.controlText}>{followUser ? 'Unlock Camera' : 'Follow Location'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => MapboxSettings.downloadOfflineRegion(sources.data)}>
          <Text style={styles.controlText}>Download offline region</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={MapboxSettings.clearCache}>
          <Text style={styles.controlText}>Clear cache</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.fab} onPress={addMemory}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.listToggle} onPress={() => setShowList((prev) => !prev)}>
        <Text style={styles.listToggleText}>{showList ? 'Hide memories' : 'Show memories'}</Text>
      </TouchableOpacity>
      {showList ? (
        <FlatList
          style={styles.list}
          data={memories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.listItem} onPress={() => setSelectedMemory(item)}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listSubtitle}>{new Date(item.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      ) : null}
      <MemoryDetailModal visible={!!selectedMemory} memory={selectedMemory ?? undefined} onClose={() => setSelectedMemory(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    gap: 8,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 12,
  },
  controlText: {
    color: '#fff',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
  },
  listToggle: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 12,
  },
  listToggleText: {
    color: '#fff',
  },
  list: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
    maxHeight: 220,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  listTitle: {
    fontWeight: '700',
  },
  listSubtitle: {
    color: '#666',
    marginTop: 4,
  },
});

export default MapScreen;
