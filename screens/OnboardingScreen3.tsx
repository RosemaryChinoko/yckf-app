import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import OnboardingTemplate from "../components/OnboardingTemplate";

type Props =  NativeStackScreenProps<any, "OnboardingScreen3">;

export default function OnboardingScreen3({ navigation }: any) {
  return (
    <OnboardingTemplate
      title="Track Cases Securely"
      subtitle="Follow the progress of your reports with safe and private access."
      buttonText="Get Started"
      showBack={true}
      onBack={() => navigation.goBack()}
      onNext={() => navigation.replace("Tabs")}
    />
  );
}