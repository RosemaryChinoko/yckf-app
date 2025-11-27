import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

type CaseUpdate = { id: string; date: string; text: string };
type CaseRecord = { id: string; reportId: string; title: string; crimeType: string; dateReported: string; lastUpdate: string; assignedOfficer?: string; details?: string; updates: CaseUpdate[];
};

const MOCK_DB: Record<string, CaseRecord> = {
  'YCKF-2025-001': {
    id: '1',
    reportId: 'YCKF-2025-001',
    title: 'Online Fraud',
    crimeType: 'Online Fraud',
    dateReported: '2025-09-20',
    lastUpdate: '2025-09-30',
    assignedOfficer: 'officer yckfadmin',
    details: 'Reported by user: transaction was unauthorized and funds transferred.',
    updates: [
      {id: 'u1', date: '2025-09-30', text: 'Case under investigation. Suspect identified'},
      {id: 'u2', date: '2025-09-30', text: 'Evidence being analyzed by cyber forensics team.'},
      {id: 'u3', date: '2025-09-30', text: 'Case received and assigned to investigating officer.'}
    ],
  },
};

async function fakeFetchCase(caseCode: string): Promise<CaseRecord | null> {
  await new Promise((r) => setTimeout(r, 700));
  return MOCK_DB[caseCode] ?? null;
}

export default function Tracker({ navigation} : any){
  const [code, setCode] = useState('YCKF-2025-001');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<CaseRecord | null>(null);

  const onTrack = async () => {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      Alert.alert('Enter case code', 'Please enter a case code to track.');
      return;
    }

    setLoading(true);
    try {
      const res = await fakeFetchCase(trimmed);
      if (res) {
        setRecord(res);
      } else {
        Alert.alert('Not found', 'No case found for that code.');
        setRecord(null);
      }
    } catch (err: unknown) {
      // log the error and show a helpful message to the user
      console.error('Failed to fetch case', err);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', `Unable to fetch case. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const onDownload = () => {
    Alert.alert('Download', 'Report will be downloaded(not implemented in demo).');
  };

  const onTrackAnother = () => {
    setRecord(null);
    setCode('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backChevron}>
            <Icon name="chevron-left" size={20} color="#000" /></Text> 
        </TouchableOpacity>
        <View style={{ flex: 1}}>
          <Text style={styles.headerTitle}>Case Tracker</Text>
          <Text style={styles.headerSubtitle}>Enter your case code to track its progress</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Input row */}
        <Text style={styles.label}>Enter Case Code</Text>
        <View style={styles.inputRow}>
          <TextInput
          style={styles.input}
          value={code}
          placeholder="YCKF-2025-XXX"
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!loading}
          />
          <TouchableOpacity style={styles.trackBtn} onPress={onTrack} disabled={loading}>
            <Icon name="magnify" size={18} color="#fff"/>
            <Text style={styles.trackBtnText}>Track</Text>
          </TouchableOpacity>
        </View>

        {/* if no record, show nothing(just input) */}
        {record ? (
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Case Details</Text>
              <View style={styles.rowTwo}>
                <View style={styles.col}>
                  <Text style={styles.smallLabel}>Report ID</Text>
                  <Text style={styles.bold}>{record.reportId}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.smallLabel}>Crime Type</Text>
                  <Text style={styles.bold}>{record.crimeType}</Text>
                </View>
              </View>

              <View style={styles.rowTwo}>
                <View style={styles.col}>
                  <Text style={styles.smallLabel}>Date Reported</Text>
                  <Text style={styles.bold}>{record.dateReported}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.smallLabel}>Last Update</Text>
                  <Text style={styles.bold}>{record.lastUpdate}</Text>
                </View>
              </View>

              <View style={{ marginTop: 12}}>
                  <Text style={styles.smallLabel}>Assigned Officer</Text>
                  <Text style={styles.bold}>{record.assignedOfficer ?? '-'}</Text>
              </View>

              <View style={styles.separator} />

              <Text style={styles.sectionTitle}>Case Updates</Text>

              {/* Timeline */}
              <View style={styles.timeline}>
                {record.updates.map((u, idx) => (
                  <View key={u.id} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={styles.bullet}/>
                      {idx < record.updates.length - 1 ?<View style={styles.timelineLine}/> : null}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.updateDate}>{u.date}</Text>
                      <Text style={styles.updateText}>{u.text}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.downloadBtn} onPress={onDownload}>
                <Text style={styles.downloadText}>Download Report</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={onTrackAnother}>
                <Text style={styles.secondaryText}>Track Another Case</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
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
  container: {
    padding: 16,
  },
  label:{
    marginBottom: 8,
    color: '#0F172A',
  },
  inputRow:{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  trackBtn: {
    backgroundColor: '#092F4F',
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  cardWrap: {
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1, 
    paddingRight: 8,
    paddingLeft: 2,
    marginBottom: 10,
  },
  smallLabel: {
    color: '#94A3B8',
  },
  bold: {
    fontWeight: '700',
    marginTop: 6,
    fontSize: 16,
  },
  separator: {
    height: 12,
    borderBottomWidth: 0,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 12,
  },
  timeline: {
    marginTop: 8,
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft:{
    width: 40,
    alignItems: 'center',
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#092F4F',
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E6EEF6',
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
  },
  updateDate: {
    color: '#0D3A4A',
    fontWeight: '700',
    marginBottom: 6,
  },
  updateText: {
    color: '#6B7280',
  },
  downloadBtn: {
    backgroundColor: '#E6EEF2',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
    alignItems: 'center',
  },
  downloadText: {
    color: '#0D3559',
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#092F4F',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '700',
  },

});
