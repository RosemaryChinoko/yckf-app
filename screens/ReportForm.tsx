import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';



export default function ReportForm({ navigation }: { navigation: any }) {

  // --- Personal Info state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // --- Incident Info state
  const [date, setDate] = useState(''); // you can replace with DateTimePicker later
  const [crimeType, setCrimeType] = useState(''); // dropdown later
  const [details, setDetails] = useState('');

  // --- Location / Evidence placeholders
  const [locationCaptured, setLocationCaptured] = useState<string | null>(null);
  const [files, setFiles] = useState<Array<{ name: string }>>([]);

  // Minimal validation before submit
  const validateAndSubmit = (method: 'email' | 'whatsapp') => {
    if (!fullName.trim() || !email.trim() || !details.trim()) {
      Alert.alert('Validation', 'Please fill in Full Name, Email and Details.');
      return;
    }

    // Build payload
    const payload = {
      fullName, email, phone, city, date, crimeType, details, locationCaptured, files,
    };

    // For now, just show an alert. Replace with API call or email intent / whatsapp link.
    Alert.alert('Submit', `Would submit via ${method.toUpperCase()}`, [{ text: 'OK' }]);
    console.log('REPORT PAYLOAD', payload);

    // After submit you may navigate to Home or show success screen:
    // navigation.replace('Home');
  };

  // Placeholder methods for capturing location and files
  const captureLocation = async () => {
    // TODO: integrate expo-location:
    // const { status } = await Location.requestForegroundPermissionsAsync();
    // const pos = await Location.getCurrentPositionAsync({});
    // setLocationCaptured(`${pos.coords.latitude},${pos.coords.longitude}`);
    setLocationCaptured('Latitude: -13.966, Longitude: 33.774'); // dummy for now
  };

  const chooseFiles = async () => {
    // TODO: integrate document/image picker:
    // const result = await DocumentPicker.pickMultiple(...);
    // setFiles(prev => [...prev, ...result]);
    setFiles(prev => [...prev, { name: `mock-file-${prev.length + 1}.jpg` }]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header / back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Report Cybercrime</Text>
            <Text style={styles.headerSubtitle}>Provide details so we can respond quickly</Text>
          </View>
        </View>

        {/* Card: Personal Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}><Text style={styles.bullet}>1</Text> Personal Information</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput value={fullName} onChangeText={setFullName} placeholder="First & Last name" style={styles.input} />

          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="your.email@example.com" style={styles.input} keyboardType="email-address" />

          <Text style={styles.label}>Phone number</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="+265 (0) 985 82...." style={styles.input} keyboardType="phone-pad" />

          <Text style={styles.label}>City / Location</Text>
          <TextInput value={city} onChangeText={setCity} placeholder="e.g., Blantyre" style={styles.input} />
        </View>

       
        <View style={styles.card}>
          <Text style={styles.sectionTitle}><Text style={styles.bullet}>2</Text> Incident Information</Text>

          <Text style={styles.label}>Date of incident</Text>
          <TextInput value={date} onChangeText={setDate} placeholder="dd/mm/yyyy" style={styles.input} />

          <Text style={styles.label}>Type of crime</Text>
        
          <TextInput value={crimeType} onChangeText={setCrimeType} placeholder="Select crime type" style={styles.input} />

          <Text style={styles.label}>Details</Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Please provide as much detail as possible..."
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={6}
          />
          <View style={styles.charRow}>
            <Text style={styles.charNote}>Minimum 20 character</Text>
            <Text style={styles.charCount}>{details.length} character</Text>
          </View>
        </View>

        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}><Text style={styles.bullet}>3</Text> Location (Optional)</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Capture your current GPS coordinates to help us respond more effectively</Text>
            <TouchableOpacity style={styles.captureButton} onPress={captureLocation}>
              <Text style={styles.captureText}>Capture Location</Text>
            </TouchableOpacity>
            {locationCaptured ? <Text style={styles.smallGray}>Captured: {locationCaptured}</Text> : null}
          </View>
        </View>

      
        <View style={styles.card}>
          <Text style={styles.sectionTitle}><Text style={styles.bullet}>4</Text> Evidence (Optional)</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Upload screenshots, documents, or other evidence. Maximum 5 files (Images, PDFs, Documents)</Text>
            <TouchableOpacity style={styles.captureButton} onPress={chooseFiles}>
              <Text style={styles.captureText}>Choose Files</Text>
            </TouchableOpacity>
            {files.length > 0 ? <Text style={styles.smallGray}>Selected: {files.map(f => f.name).join(', ')}</Text> : null}
          </View>
        </View>

       
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Submit Your Report</Text>
        <View style={styles.submitRow}>
          <TouchableOpacity style={[styles.submitButton, styles.emailBtn]} onPress={() => validateAndSubmit('email')}>
            <Text style={styles.submitText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitButton, styles.whatsappBtn]} onPress={() => validateAndSubmit('whatsapp')}>
            <Text style={styles.submitText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 16 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#092F4F', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backChevron: { color: '#fff', fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#092F4F' },
  headerSubtitle: { color: '#6B7280', fontSize: 13 },

  card: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E6EEF6' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0F172A' },
  bullet: { color: '#C33', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },

  label: { color: '#0F172A', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E6EEF6', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 12, backgroundColor: '#fff' },
  textArea: { height: 120, textAlignVertical: 'top' },

  charRow: { flexDirection: 'row', justifyContent: 'space-between' },
  charNote: { color: '#94A3B8', fontSize: 12 },
  charCount: { color: '#94A3B8', fontSize: 12 },

  infoBox: { backgroundColor: '#EEF6FA', padding: 12, borderRadius: 6 },
  infoText: { color: '#0F172A', marginBottom: 10 },
  captureButton: { backgroundColor: '#092F4F', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-start' },
  captureText: { color: '#fff' },
  smallGray: { color: '#6B7280', marginTop: 8, fontSize: 12 },

  submitRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  submitButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
  emailBtn: { backgroundColor: '#D9433E', marginRight: 8 },
  whatsappBtn: { backgroundColor: '#25A35B', marginLeft: 8 },
  submitText: { color: '#fff', fontWeight: '700' },
});
