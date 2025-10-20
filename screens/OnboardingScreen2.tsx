import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import OnboardingTemplate from "../components/OnboardingTemplate";

type Props =  NativeStackScreenProps<any, "Onboarding2">;

export default function OnboardingScreen2({ navigation }: any) {
  return (
    <OnboardingTemplate
      title="Share Your Location for Quick Help"
      subtitle="Send your current or live location to YCKF responders instantly."
      buttonText="Next"
      showBack={true}
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate("Onboarding3")}
    />
  );
}