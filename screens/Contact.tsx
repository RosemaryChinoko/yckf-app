import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Contact({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const phoneNumber = '+233505313578';
  const emailAddress = 'yckfadmin@yck.org';
  const whatsappLink = `https://wa.me/233505313578`;

  const handleCall = async () => {
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert('Phone not available');
  };

  const handleEmail = () => {
    const url = `mailto:${emailAddress}?subject=${encodeURIComponent('Contact from app')}&body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert('Cannot open email client'));
  };

  const handleWhatsApp = () => {
    Linking.openURL(whatsappLink).catch(() => Alert.alert('Cannot open WhatsApp'));
  };

  const sendMessage = (via: 'email' | 'whatsapp') => {
    if (!message.trim()) {
      Alert.alert('Validation', 'Please write a message first.');
      return;
    }
    if (via === 'email') {
      handleEmail();
    } else {
      handleWhatsApp();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Contact YCFK</Text>
            <Text style={styles.sub}>Get in touch with our team</Text>
          </View>
        </View>

        {/* Quick cards */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
            <View style={styles.iconCircle}><Icon name="phone" size={20} color="#092F4F" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Call us</Text>
              <Text style={styles.rowSub}>{phoneNumber}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
            <View style={styles.iconCircle}><Icon name="email-outline" size={20} color="#092F4F" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Email us</Text>
              <Text style={styles.rowSub}>{emailAddress}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow} onPress={handleWhatsApp}>
            <View style={styles.iconCircle}><Icon name="whatsapp" size={20} color="#092F4F" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>WhatsApp</Text>
              <Text style={styles.rowSub}>Chat with us</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}><Text style={styles.bullet}>1</Text> Personal Information</Text>
          <TextInput placeholder="Full name" style={styles.input} value={fullName} onChangeText={setFullName} />
          <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />

          <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Your Message</Text>
          <TextInput placeholder="Write message..." multiline style={[styles.input, styles.textArea]} value={message} onChangeText={setMessage} />

          <Text style={styles.hint}>Minimum 10 character</Text>

          <View style={{ height: 12 }} />
          <Text style={styles.sectionTitle}>Send Your Message</Text>

          <TouchableOpacity style={[styles.sendBtn, styles.emailBtn]} onPress={() => sendMessage('email')}>
            <Text style={styles.sendText}>Send via Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.sendBtn, styles.whatsappBtn]} onPress={() => sendMessage('whatsapp')}>
            <Text style={styles.sendText}>Send via WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
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
  title: { color: '#fff', fontSize: 20, fontWeight: '700', backgroundColor: '#092F4F', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  sub: { color: '#6B7280', marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 14 },

  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  iconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowTitle: { fontWeight: '700', color: '#0F172A' },
  rowSub: { color: '#6B7280' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#0F172A' },
  bullet: { color: '#C33', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },

  input: { borderWidth: 1, borderColor: '#E6EEF6', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', marginBottom: 10 },
  textArea: { height: 110, textAlignVertical: 'top' },
  hint: { color: '#94A3B8', fontSize: 12 },

  sendBtn: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  emailBtn: { backgroundColor: '#D9433E' },
  whatsappBtn: { backgroundColor: '#25A35B' },
  sendText: { color: '#fff', fontWeight: '700' },
});