import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import * as Linking from "expo-linking";
import {
  saveDraft as storeSaveDraft,
  DraftReport,
  copyFileToAppDir,
} from "../app/stores/safeboxStore";

export async function submitReport() {
  // placeholder moved out of component — implement submission logic here (e.g., send email or enqueue for backend)
  // This function should be updated to accept needed parameters or use an injected service
  console.warn("submitReport: not implemented");
  console.warn("submitReport: not implemented");
}

// Request and ensure media library permission; returns true if granted
export async function ensureMediaPermission() {
  try {
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (perm.status === "granted") return true;
    const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return req.status === "granted";
  } catch (error_) {
    console.warn("Media permission check failed", error_);
    return false;
  }
}

type Props = { readonly navigation?: any };

export default function ReportForm({ navigation }: Readonly<Props>) {
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [crimeType, setCrimeType] = useState("");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState<string>(new Date().toDateString());
  const [images, setImages] = useState<{ uri: string; name?: string }[]>([]);
  const [files, setFiles] = useState<{ uri: string; name?: string }[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Dev-only debug helpers
  const [debugVisible, setDebugVisible] = useState(false);
  const [lastPickerResponse, setLastPickerResponse] = useState<any>(null);
  const [lastCopyError, setLastCopyError] = useState<string | null>(null);

  const locationCaptured = location
    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
    : null;

  useEffect(() => {
    // Request permissions for location and media on mount (friendly)
    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (e) {
        console.warn("Location permission request failed", e);
      }
      try {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (e) {
        console.warn("Media library permission request failed", e);
      }
    })();
  }, []);

  // helper: ensure location is populated (if possible)
  async function ensureLocation() {
    if (location) return;
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== "granted") {
          Alert.alert(
            "Location not available",
            "Proceeding without GPS coordinates."
          );
          return;
        }
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (error_) {
      console.warn("Location capture failed", error_);
      // continue without location
    }
  }

  // ---------- Helpers ----------
  async function captureLocation() {
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Location permission is required to capture your coordinates."
          );
          return;
        }
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      Alert.alert(
        "Location captured",
        `Lat: ${pos.coords.latitude.toFixed(
          6
        )}, Lon: ${pos.coords.longitude.toFixed(6)}`
      );
    } catch (err) {
      console.warn(err);
      Alert.alert("Location error", "Unable to capture location.");
    }
  }
  // write base64 to a temp cache file and return its uri
  async function writeBase64Temp(base64: string, suggestedName?: string) {
    const filename = suggestedName || `yckf-temp-${Date.now()}.jpg`;
    const dest = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(dest, base64, {
      encoding: "base64" as any,
    });
    return dest;
  }

  // Try to copy a localUri into safebox; if it fails and base64 is present, write base64 then copy.
  async function savePickedToSafebox(
    localUri?: string,
    base64?: string,
    asset?: any
  ) {
    if (!localUri && base64) {
      localUri = await writeBase64Temp(base64, asset?.fileName || undefined);
    }
    if (!localUri) throw new Error("No local file available");

    try {
      const saved = await copyFileToAppDir(localUri);
      const newEntry = { uri: saved.uri, name: saved.name };
      setImages((p) => [...p, newEntry]);
      setFiles((p) => [...p, newEntry]);
      setLastCopyError(null);
      return;
    } catch (error_) {
      console.warn("copyFileToAppDir failed", error_);
      const errMsg =
        error_ && (error_ as any).message
          ? (error_ as any).message
          : String(error_);
      setLastCopyError(errMsg);

      // If we have base64 data, write it to cache and try copying again
      if (base64) {
        try {
          const fallback = await writeBase64Temp(
            base64,
            asset?.fileName || undefined
          );
          const saved2 = await copyFileToAppDir(fallback);
          const newEntry = { uri: saved2.uri, name: saved2.name };
          setImages((p) => [...p, newEntry]);
          setFiles((p) => [...p, newEntry]);
          setLastCopyError(null);
          return;
        } catch (err2) {
          console.warn("fallback base64 copy failed", err2);
          setLastCopyError(
            err2 && (err2 as any).message ? (err2 as any).message : String(err2)
          );
          // continue to other fallbacks below
        }
      }

      // If the environment supports FileSystem.downloadAsync, try downloading
      // the picked URI to a cache location and copy from there. This can help
      // with some content:// or special URIs on Android.
      try {
        // @ts-ignore - may not exist on some older SDKs
        if (typeof FileSystem.downloadAsync === "function") {
          const tmpName = asset?.fileName || `yckf-dl-${Date.now()}.jpg`;
          const tmpPath = `${FileSystem.cacheDirectory}${tmpName}`;
          try {
            // @ts-ignore
            const dl = await FileSystem.downloadAsync(localUri, tmpPath);
            if (dl && dl.uri) {
              const saved3 = await copyFileToAppDir(dl.uri);
              const newEntry = { uri: saved3.uri, name: saved3.name };
              setImages((p) => [...p, newEntry]);
              setFiles((p) => [...p, newEntry]);
              setLastCopyError(null);
              return;
            }
          } catch (dlErr) {
            console.warn("downloadAsync fallback failed", dlErr);
            setLastCopyError(
              dlErr && (dlErr as any).message
                ? (dlErr as any).message
                : String(dlErr)
            );
          }
        }
      } catch (finalErr) {
        console.warn("download fallback attempt error", finalErr);
      }

      // If all fallbacks failed, rethrow so caller can handle the error.
      throw error_;
    }
  }

  async function pickImage() {
    try {
      const ok = await ensureMediaPermission();
      if (!ok) {
        Alert.alert(
          "Permission required",
          "Media library permission is required to pick images."
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        quality: 0.8,
        base64: true,
      });
      setLastPickerResponse(res);
      console.log("ImagePicker result", res);
      if (!res) return;
      if ("canceled" in res && res.canceled) return;
      if ((res as any).cancelled) return;

      const asset = (res as any).assets ? (res as any).assets[0] : res;
      const pickedUri = asset?.uri;
      const base64 = asset?.base64;
      if (!pickedUri && !base64) return;

      await savePickedToSafebox(pickedUri, base64, asset);
    } catch (err) {
      console.warn("pickImage error", err);
      const msg = err instanceof Error ? err.message : String(err);
      setLastCopyError(msg);
      Alert.alert(
        "Image error",
        msg ? `Unable to pick image: ${msg}` : "Unable to pick image"
      );
    }
  }

  async function takePhoto() {
    try {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera permission is required to take photos"
        );
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
      });
      setLastPickerResponse(res);
      console.log("Camera result", res);
      if (!res) return;
      if ((res as any).cancelled) return;

      const asset = (res as any).assets ? (res as any).assets[0] : res;
      const pickedUri = asset?.uri;
      const base64 = asset?.base64;
      if (!pickedUri && !base64) return;

      await savePickedToSafebox(pickedUri, base64, asset);
    } catch (error_) {
      console.warn("takePhoto error", error_);
      const msg = error_ instanceof Error ? error_.message : String(error_);
      setLastCopyError(msg);
      Alert.alert("Camera error", msg || "Unable to take photo");
    }
  }

  function formatMapLink() {
    if (!location) return "";
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  }

  function validate() {
    if (!fullName.trim()) {
      Alert.alert("Validation", "Full name is required");
      return false;
    }
    if (!email.trim() && !phone.trim()) {
      Alert.alert("Validation", "Provide an email or phone");
      return false;
    }
    if (!details.trim()) {
      Alert.alert("Validation", "Please describe the incident");
      return false;
    }
    return true;
  }

  async function sendWhatsAppText() {
    if (!validate()) return;
    try {
      const mapLink = formatMapLink();
      const message = [
        `YCKF Cybercrime Report — ${crimeType || "General"}`,
        `Name: ${fullName}`,
        `Phone: ${phone}`,
        `City: ${city}`,
        `Date: ${date}`,
        "",
        `${details}`,
        "",
        mapLink || "",
      ].join("\n");

      const whatsappURL = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(whatsappURL);
      if (supported) {
        await Linking.openURL(whatsappURL);
        return;
      }
      await Share.share({ message });
    } catch (err) {
      console.warn("sendWhatsAppText", err);
      Alert.alert("Error", "Unable to open WhatsApp or share.");
    }
  }

  async function shareAttachments() {
    if (images.length === 0) {
      Alert.alert("No attachments", "Please pick or take a photo first.");
      return;
    }
    try {
      const first = images[0];
      if (Platform.OS === "web") {
        Alert.alert("Not supported", "File sharing from web is limited.");
        return;
      }
      // show share sheet (first image). For many platforms, user can pick WhatsApp.
      await Share.share({
        title: "Evidence",
        message: details || "Evidence file",
        url: first.uri,
      });
    } catch (err) {
      console.warn(err);
      Alert.alert("Share error", "Unable to share attachments.");
    }
  }

  async function saveDraft() {
    try {
      const draft: DraftReport = {
        id: Date.now().toString(),
        title: `${crimeType || "Report"} — ${fullName || "anonymous"}`,
        crimeType,
        dateSaved: new Date().toISOString(),
        details,
        files: images.map((i) => ({ uri: i.uri, name: i.name })),
        status: "draft",
      };
      if (typeof storeSaveDraft === "function") {
        await storeSaveDraft(draft as any);
        Alert.alert("Saved", "Draft saved to SafeBox.");
      } else {
        // submitReport moved to module outer scope (see exported submitReport above)
        Alert.alert("Unable to save", "SafeBox save function not available.");
      }
    } catch (err) {
      console.warn("saveDraft error", err);
      Alert.alert("Save error", "Unable to save draft.");
    }
  }

  async function chooseFiles() {
    // simple chooser: currently reuse image picker as a fallback for selecting files
    await pickImage();
  }

  async function sendEmail() {
    if (!validate()) return;
    try {
      const mapLink = formatMapLink();
      const subject = `YCKF Cybercrime Report — ${crimeType || "General"}`;
      const body = [
        `Name: ${fullName}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `City: ${city}`,
        `Date: ${date}`,
        "",
        details || "",
        "",
        mapLink || "",
      ].join("\n");

      const attachments = [...images, ...files]
        .map((f) => f.uri)
        .filter(Boolean);

      const can = await MailComposer.isAvailableAsync();
      if (can) {
        await MailComposer.composeAsync({
          recipients: email ? [email] : [],
          subject,
          body,
          attachments,
        });
      } else {
        Alert.alert(
          "Mail not available",
          "Your device cannot send email from this app."
        );
      }
    } catch (err) {
      console.warn("sendEmail", err);
      Alert.alert("Email error", "Unable to compose email.");
    }
  }

  async function validateAndSubmit(method: "email" | "whatsapp") {
    if (!validate()) return;
    if (method === "email") {
      await sendEmail();
    } else {
      await sendWhatsAppText();
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backCircle}
        >
          <Text style={styles.backChevron}>
            <Icon name="chevron-left" size={20} color="#000" />
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Report Cybercrime</Text>
          <Text style={styles.headerSubtitle}>
            Provide details so we can respond quickly
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Card: Personal Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.bullet}>1</Text> Personal Information
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="First & Last name"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            style={styles.input}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+265 (0) 985 82...."
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>City / Location</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g., Blantyre"
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.bullet}>2</Text> Incident Information
          </Text>

          <Text style={styles.label}>Date of incident</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="dd/mm/yyyy"
            style={styles.input}
          />

          <Text style={styles.label}>Type of crime</Text>

          <TextInput
            value={crimeType}
            onChangeText={setCrimeType}
            placeholder="Select crime type"
            style={styles.input}
          />

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
          <Text style={styles.sectionTitle}>
            <Text style={styles.bullet}>3</Text> Location (Optional)
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Capture your current GPS coordinates to help us respond more
              effectively
            </Text>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureLocation}
            >
              <Text style={styles.captureText}>Capture Location</Text>
            </TouchableOpacity>
            {locationCaptured ? (
              <Text style={styles.smallGray}>Captured: {locationCaptured}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.bullet}>4</Text> Evidence (Optional)
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Upload screenshots, documents, or other evidence. Maximum 5 files
              (Images, PDFs, Documents)
            </Text>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={chooseFiles}
            >
              <Text style={styles.captureText}>Choose Files</Text>
            </TouchableOpacity>
            {files.length > 0 ? (
              <Text style={styles.smallGray}>
                Selected: {files.map((f) => f.name).join(", ")}
              </Text>
            ) : null}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
          Submit Your Report
        </Text>
        <View style={styles.submitRow}>
          <TouchableOpacity
            style={[styles.submitButton, styles.emailBtn]}
            onPress={() => validateAndSubmit("email")}
          >
            <Text style={styles.submitText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, styles.whatsappBtn]}
            onPress={() => validateAndSubmit("whatsapp")}
          >
            <Text style={styles.submitText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Dev-only debug toggle and panel */}
        {__DEV__ ? (
          <>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => setDebugVisible((v) => !v)}
            >
              <Text style={styles.debugButtonText}>
                {debugVisible ? "Hide debug" : "Show debug"}
              </Text>
            </TouchableOpacity>
            {debugVisible ? (
              <View style={styles.debugPanel}>
                <Text style={styles.debugTitle}>Last Picker Response</Text>
                <Text style={styles.debugText}>
                  {lastPickerResponse
                    ? JSON.stringify(lastPickerResponse, null, 2).slice(0, 3000)
                    : "—"}
                </Text>
                <Text style={styles.debugTitle}>Last Copy Error</Text>
                <Text style={styles.debugText}>{lastCopyError ?? "—"}</Text>
              </View>
            ) : null}
          </>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    padding: 16,
  },

  header: {
    backgroundColor: "#092F4F",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backChevron: {
    color: "#092F4F",
    fontSize: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#C9D6DF",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6EEF6",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0F172A",
  },
  bullet: {
    color: "#C33",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },

  label: {
    color: "#0F172A",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E6EEF6",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  charRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  charNote: {
    color: "#94A3B8",
    fontSize: 12,
  },
  charCount: {
    color: "#94A3B8",
    fontSize: 12,
  },

  infoBox: {
    backgroundColor: "#EEF6FA",
    padding: 12,
    borderRadius: 6,
  },
  infoText: {
    color: "#0F172A",
    marginBottom: 10,
  },
  captureButton: {
    backgroundColor: "#092F4F",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  captureText: {
    color: "#fff",
  },
  smallGray: {
    color: "#6B7280",
    marginTop: 8,
    fontSize: 12,
  },

  submitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  emailBtn: {
    backgroundColor: "#D9433E",
    marginRight: 8,
  },
  whatsappBtn: {
    backgroundColor: "#25A35B",
    marginLeft: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
  debugButton: {
    backgroundColor: "#092F4F",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  debugButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  debugPanel: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  debugTitle: {
    color: "#C9D6DF",
    fontWeight: "700",
    marginBottom: 6,
  },
  debugText: {
    color: "#E6EEF6",
    fontSize: 12,
    marginBottom: 8,
  },
});
