import React from 'react';
import {FlatList, Text, TouchableOpacity, View, StyleSheet} from 'react-native';

interface Props {
  items: Array<{id: number; title: string; subtitle: string}>;
  onSelect: (id: number) => void;
}

const WalkDriveHistoryList = ({items, onSelect}: Props) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({item}) => (
        <TouchableOpacity style={styles.item} onPress={() => onSelect(item.id)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
});

export default WalkDriveHistoryList;
