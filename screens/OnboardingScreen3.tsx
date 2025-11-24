import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingTemplate from "../components/OnboardingTemplate";

type Props = NativeStackScreenProps<any, "Onboarding3">;

export default function OnboardingScreen3({ navigation }: Props) {

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      navigation.replace("Tabs"); // take user into the app permanently
    } catch (error) {
      console.log("Error saving onboarding state:", error);
    }
  };

  return (
    <OnboardingTemplate
      title="Track Cases Securely"
      subtitle="Follow the progress of your reports with safe and private access."
      buttonText="Get Started"
      showBack={true}
      onBack={() => navigation.goBack()}
      onNext={finishOnboarding} 
    />
  );
}