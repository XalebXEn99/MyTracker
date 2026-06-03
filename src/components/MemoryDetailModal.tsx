import React from 'react';
import {Modal, View, Text, Image, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {MemoryRecord} from '../types';

interface Props {
  visible: boolean;
  memory?: MemoryRecord;
  onClose: () => void;
}

const MemoryDetailModal = ({visible, memory, onClose}: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            <Text style={styles.title}>{memory?.title || 'Memory Detail'}</Text>
            {memory?.photoUri ? <Image source={{uri: memory.photoUri}} style={styles.image} /> : null}
            <Text style={styles.timestamp}>{memory ? new Date(memory.createdAt).toLocaleString() : ''}</Text>
            <Text style={styles.note}>{memory?.note}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    margin: 16,
  },
  image: {
    width: '100%',
    height: 240,
  },
  timestamp: {
    marginHorizontal: 16,
    marginTop: 8,
    color: '#666',
  },
  note: {
    margin: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  closeButton: {
    padding: 16,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MemoryDetailModal;
