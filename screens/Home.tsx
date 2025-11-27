// screens/Home.tsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Linking, Platform,} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { shareCurrentLocationViaWhatsApp, instructShareLiveLocation, } from "../app/utils/location";

type QuickAction = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  route?: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "report",
    title: "Report CyberCrime",
    subtitle: "Submit a detailed cybercrime incident report",
    icon: "alert-circle-outline",
  },
  {
    id: "contact",
    title: "Contact YCKF",
    subtitle: "Get in touch with our team",
    icon: "phone-outline",
  },
  {
    id: "share_location",
    title: "Share Current Location",
    subtitle: "Share your current GPS coordinates",
    icon: "map-marker-outline",
  },
  {
    id: "live_location",
    title: "Share Live Location",
    subtitle: "Share real-time location tracking",
    icon: "crosshairs-gps",
  },
];

type Feature = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  route?: string;
};

const FEATURES: Feature[] = [
  {
    id: "safebox",
    title: "Evidence Safebox",
    subtitle: "Save reports offline",
    icon: "folder-outline",
    route: "SafeBox",
  },
  {
    id: "tracker",
    title: "Case Tracker",
    subtitle: "Follow your case status",
    icon: "progress-clock",
    route: "Tracker",
  },
];

// module-scoped hook for header action to avoid inline prop passing
let callHotlineImpl: () => void = () => {};
export function setCallHotlineImpl(fn: () => void) {
  callHotlineImpl = fn;
}

// default module-scoped hotline caller (will be replaced by setCallHotlineImpl)
function moduleCallHotline() {
  const phone = "+233505313578";
  const url = Platform.OS === "ios" ? `telprompt:${phone}` : `tel:${phone}`;
  Linking.canOpenURL(url).then((supported) => {
    if (supported) Linking.openURL(url);
    else alert("Phone not available on this device");
  });
}

// initialize default impl
callHotlineImpl = moduleCallHotline;

function QuickSeparator() {
  return <View style={styles.sep} />;
}

function HomeListHeader(_: Readonly<{}>) {
  return (
    <>
      <View style={styles.topRow} />

      <View style={styles.welcomeCard}>
        <Image
          source={require("../assets/yckf-logo3.png")}
          style={styles.logo}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.welcomeTitle}>Welcome to YCKF</Text>
          <Text style={styles.welcomeSub}>
            Your trusted partner in reporting and tracking cyber incidents.
          </Text>
        </View>
        <TouchableOpacity onPress={() => alert("Drawer menu pressed")}>
          <Icon name="menu" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <Text style={styles.bigTitle}>Report. Protect. Prevent</Text>
      <Text style={styles.leadText}>
        Your trusted partner in combating cybercrime. Report incidents, track
        cases, and stay protected with our tools.
      </Text>

      <View style={styles.hotlineCard}>
        <View style={styles.hotlineHeader}>
          <Icon name="alert-circle-outline" size={18} color="#B91C1C" />
          <Text style={styles.hotlineTitle}> Emergency Hotline</Text>
        </View>
        <Text style={styles.hotlineHint}>
          If you're in immediate danger, call our 24/7 emergency line
        </Text>
        <TouchableOpacity
          style={styles.hotlineButton}
          onPress={() => callHotlineImpl()}
        >
          <Icon
            name="phone"
            size={16}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.hotlinePhone}>+233 505 313 578</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
    </>
  );
}

// stable header component reference (no props)
function HomeListHeaderComponent(_: Readonly<{}>) {
  return <HomeListHeader />;
}

function HomeListFooter({ navigation }: { navigation: any }) {
  return (
    <>
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Key Features</Text>
      {FEATURES.map((f) => (
        
        <TouchableOpacity key={f.id} style={styles.featureRow} onPress={() => {
          if (f.route && typeof navigation?.navigate === "function"){
            navigation.navigate(f.route);
          } else {
            alert(`${f.title} tapped`); 
          }
          }}>
          <View style={styles.featureIcon}>
            <Icon name={f.icon} size={20} color="#0D3559" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
          </View>
          <Icon name="dots-horizontal" size={18} color="#94A3B8" />
        </TouchableOpacity>
      ))}
      <View style={{ height: 120 }} />
    </>
  );
}
export default function Home({ navigation }: any) {
  // register default module-scoped hotline implementation
  setCallHotlineImpl(moduleCallHotline);

  const renderQuick = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        if (item.id === "report") navigation.navigate("Report");
        else if (item.id === "contact") navigation.navigate("Contact");
        else if (item.id === "share_location") {shareCurrentLocationViaWhatsApp();} // real behaviour now
        else if (item.id === "live_location") { instructShareLiveLocation();}
        else alert(item.title);
      }}
    >
      <View style={styles.rowIcon}>
        <Icon name={item.icon} size={20} color="#0D3559" />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
        ) : null}
      </View>
      <Icon name="chevron-right" size={24} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.container}
        data={QUICK_ACTIONS}
        keyExtractor={(i) => i.id}
        renderItem={renderQuick}
        ItemSeparatorComponent={QuickSeparator}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={HomeListHeaderComponent}
        ListFooterComponent={() => <HomeListFooter navigation={navigation} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  topRow: {
    height: 4,
  },

  welcomeCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  logo: {
    width: 40,
    height: 50,
    resizeMode: "contain",
  },
  welcomeTitle: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 16,
  },
  welcomeSub: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4,
  },

  bigTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0D3559",
    marginTop: 6,
    marginBottom: 6,
  },
  leadText: {
    color: "#6B7280",
    lineHeight: 20,
  },

  hotlineCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  hotlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  hotlineTitle: {
    fontWeight: "700",
    color: "#B91C1C",
  },
  hotlineHint: {
    color: "#7F1D1D",
    marginBottom: 12,
  },
  hotlineButton: {
    backgroundColor: "#B91C1C",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  hotlinePhone: {
    color: "#fff",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  rowSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
  },

  sep: {
    height: 10,
  },

  featureRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  featureSubtitle: {
    color: "#6B7280",
    fontSize: 13,
  },

  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#092F4F",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ctaInner: {
    backgroundColor: "#092F4F",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
