import React, { useEffect, useState, useCallback } from 'react';
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Alert} from 'react-native';
import { DraftReport,getAllDrafts,deleteDraft,enqueueReport,dequeueReport,} from '../app/stores/safeboxStore';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';

export default function SafeBox({ navigation }:  any ) {
  const [drafts, setDrafts] = useState<DraftReport[]>([]);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const loadDrafts = async () => {
    const ds = await getAllDrafts();
    setDrafts(ds);
  };

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
      const unsub = NetInfo.addEventListener((state) =>
        setIsOnline(state.isConnected ?? false)
      );
      return () => unsub();
    }, [])
  );

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Delete this draft?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDraft(id);
          await dequeueReport(id);
          loadDrafts();
        },
      },
    ]);
  };


  const renderItem = ({ item }: { item: DraftReport }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>{item.crimeType || '—'}</Text>
        <Text style={styles.small}>
          Saved: {item.dateSaved.split('T')[0]}
        </Text>
        <Text style={styles.small}>
          📷 {item.files?.length ?? 0} evidence file(s)
        </Text>
      </View>

      <View style={{ width: 120, alignItems: 'flex-end' }}>

        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() =>
            navigation.navigate('Report', { draftId: item.id })
          }
        >
          <Text style={styles.viewText}>Continue</Text>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{ marginTop: 8 }}
        >
          <Icon name="trash-can-outline" size={20} color="#D1433E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F8' }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => navigation?.goBack?.()} >
          <Text style={styles.backChevron}>
             <Icon name="chevron-left" size={20} color="#000" />
          </Text>
         
        </TouchableOpacity>
        <View style={{flex: 1}}>
        <Text style={styles.headerTitle}>Evidence SafeBox</Text>
        <Text style={styles.headerSubtitle}>Saved reports and evidence</Text>
        </View>
      </View>

      <View style={{ padding: 16, flex: 1 }}>
        <Text style={styles.pageTitle}>Saved Reports ({drafts.length})</Text>

        {drafts.length === 0 ? (
          <Text style={{ marginTop: 20, color: '#6B7280' }}>
            No saved reports yet.
          </Text>
        ) : (
          <FlatList
            data={drafts}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#092F4F',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backChevron: {
    color: '#092F4F',
    fontSize: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#C9D6DF',
  },

  pageTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 12 
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  title: { 
    fontWeight: '700', 
    fontSize: 16, 
    color: '#0D3559' 
  },
  sub: { 
    color: '#6B7280', 
    marginVertical: 6 
  },
  small: { 
    color: '#94A3B8', 
    fontSize: 12 
  },
  viewBtn: {
    backgroundColor: '#E6E9EC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  viewText: { 
    color: '#0F172A', 
    fontWeight: '700' 
  },
  submitBtn: {
    backgroundColor: '#092F4F',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 0,
  },
  submitText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
});


