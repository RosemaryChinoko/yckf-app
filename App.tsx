import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen1 from "./screens/OnboardingScreen1";
import OnboardingScreen2 from "./screens/OnboardingScreen2";
import OnboardingScreen3 from "./screens/OnboardingScreen3";
import Tabs from "./Tabs";
import ReportForm from "./screens/ReportForm";
import Contact from "./screens/Contact";
import SafeBoxDetail from "./screens/safeBoxDetail";
import SafeBox from "./screens/SafeBox";



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash"
      screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />
        <Stack.Screen
          name="Onboarding1"
          component={OnboardingScreen1}

        />
        <Stack.Screen
          name="Onboarding2"
          component={OnboardingScreen2}
        />
        <Stack.Screen
          name="Onboarding3"
          component={OnboardingScreen3}
        />
        <Stack.Screen
          name="Tabs"
          component={Tabs}
        />
        <Stack.Screen
          name="SafeBox"
          component={SafeBox}
        />
         
         <Stack.Screen
          name="Report"
          component={ReportForm}
        />
         <Stack.Screen
          name="Contact"
          component={Contact}
        />
        <Stack.Screen
          name="SafeBoxDetail"
          component={SafeBox}
        />
        <Stack.Screen
          name="EditDraft"
          component={ReportForm}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


