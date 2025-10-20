import React, {useEffect} from "react";
import { View, StyleSheet, Image, ActivityIndicator} from "react-native";

export default function
SplashScreen({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding1");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/yckf-logo.png")} style={styles.logo} />
      <ActivityIndicator style={{marginTop: 20}} size="large" color="#092F4F" />
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