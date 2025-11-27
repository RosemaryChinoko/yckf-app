import React, { useEffect } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");

      if (hasSeen === "true") {
        navigation.replace("Tabs"); // user already finished onboarding
      } else {
        navigation.replace("Onboarding1"); // first time user
      }
    };

    const timer = setTimeout(checkOnboarding, 2000); // 2-second splash

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/yckf-logo3.png")} style={styles.logo} />
      <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#092F4F" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
});