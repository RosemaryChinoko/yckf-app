import React, { useEffect, useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,Alert, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {DraftReport,getAllDrafts,deleteDraft,enqueueReport,dequeueReport,} from '../app/stores/safeboxStore';
import NetInfo from '@react-native-community/netinfo';

type Props = { route: { params: { id: string } }; navigation: any };

export default function SafeBoxDetail({ route, navigation }: Props) {
  const { id } = route.params;
  const [report, setReport] = useState<DraftReport | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const drafts = await getAllDrafts();
      const r = drafts.find((d) => d.id === id) ?? null;
      setReport(r);
    })();

    const unsub = NetInfo.addEventListener(
      (s) => setIsOnline(s.isConnected ?? false)
    );
    return () => unsub();
  }, [id]);

  if (!report) return null;

  const submitNow = async () => {
    if (!isOnline) {
      await enqueueReport(report.id);
      Alert.alert(
        'Queued',
        'Device offline. Report queued and will submit when online.'
      );
      navigation.goBack();
      return;
    }

    try {
      await fakeUpload(report);
      await deleteDraft(report.id);
      await dequeueReport(report.id);
      Alert.alert('Submitted', 'Report has been submitted successfully.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        'Submission failed — report queued and will be retried later.'
      );
      await enqueueReport(report.id);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F8' }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence SafeBox</Text>
        <Text style={styles.headerSub}>Saved reports and evidence</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Report Details</Text>

          <Text style={styles.label}>Report ID</Text>
          <Text style={styles.bold}>{report.id}</Text>

          <Text style={styles.label}>Title</Text>
          <Text style={styles.bold}>{report.title}</Text>

          <Text style={styles.label}>Crime Type</Text>
          <Text style={styles.bold}>{report.crimeType || '—'}</Text>

          <Text style={styles.label}>Date Saved</Text>
          <Text style={styles.bold}>{report.dateSaved.split('T')[0]}</Text>

          <Text style={styles.label}>Details</Text>
          <Text style={styles.small}>{report.details || '—'}</Text>

          <Text style={styles.label}>Evidence Files</Text>
          {report.files && report.files.length > 0 ? (
            report.files.map((f, i) => (
              <Text style={styles.small} key={i}>
                {i + 1}. {f.name || 'Unnamed'} ({f.size ?? 0} bytes)
              </Text>
            ))
          ) : (
            <Text style={styles.small}>No files attached</Text>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={submitNow}>
            <Text style={styles.primaryText}>Submit Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryText}>Back to List</Text>
          </TouchableOpacity>
          

          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Fake uploader for simulation
async function fakeUpload(report: DraftReport) {
  await new Promise((r) => setTimeout(r, 1200));
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#092F4F',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: '700' 
  },
  headerSub: { 
    color: '#C9D6DF', 
    marginTop: 4 
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  label: { 
    color: '#94A3B8', 
    marginTop: 8 
  },
  bold: { 
    fontWeight: '700', 
    fontSize: 16, 
    marginTop: 4 
  },
  small: { 
    color: '#6B7280', 
    marginTop: 6 
  },

  primaryBtn: {
    backgroundColor: '#092F4F',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
    alignItems: 'center',
  },
  primaryText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  secondaryBtn: {
    backgroundColor: '#E6EDF2',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  secondaryText: { 
    color: '#0D3559', 
    fontWeight: '700' 
  },
});
