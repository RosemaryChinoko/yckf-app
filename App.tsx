import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Image source={require("./assets/yckf-logo.png")} style={styles.logo} />
      <Text style={styles.title}>Welcome to YCKF APP</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3A86FF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
});
