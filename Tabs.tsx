import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Home from "./screens/Home";
import ReportForm from "./screens/ReportForm";
import SafeBox from "./screens/SafeBox";
import Tracker from "./screens/Tracker";
import Contact from "./screens/Contact";

const Tab = createBottomTabNavigator();

export default function Tabs() {
    return (
            <Tab.Navigator
                initialRouteName="Home"
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarStyle: {height: 110, paddingBottom: 8},     
                    tabBarIcon: ({ color }) => {
                        const map: Record<string, string> = {
                            Home: "home-outline",
                            Report: "clipboard-text-outline",
                            SafeBox: "folder-outline",
                            Tracker: "clock-outline",
                            Contact: "phone-outline",
                        };
                        const name = map[route.name] ?? 'circle';
    
                        return <Icon name={name as any} size={22} color={color} />;
                    },
                    tabBarActiveTintColor: "#092F4F",
                    tabBarInactiveTintColor: "#94A3B8",
                })}
            >
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Report" component={ReportForm} />
                <Tab.Screen name="SafeBox" component={SafeBox} />
                <Tab.Screen name="Tracker" component={Tracker} />
                <Tab.Screen name="Contact" component={Contact} />
            </Tab.Navigator>
        );
    }