import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import OnboardingTemplate from "../components/OnboardingTemplate";

type Props =  NativeStackScreenProps<any, "Onboarding1">;

export default function OnboardingScreen1({ navigation }: any) {
  return (
    <OnboardingTemplate
      title="Report Cybercrime Easily"
      subtitle="Quickly submit incidents with evidence to help us respond faster."
      buttonText="Next"
      showBack={false}
      onNext={() => navigation.navigate("Onboarding2")}
    />
  );
}