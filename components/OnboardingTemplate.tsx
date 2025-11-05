import React from "react";  
import { SafeAreaView } from "react-native-safe-area-context";            
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from "react-native";
import Svg, { Path} from "react-native-svg";
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");
const BLUE_HEIGHT = height * 0.7;
const CURVE_DEPTH = 60;

type Props = {
    title: string;
    subtitle: string;
    buttonText: string;
    showBack?: boolean;
    onBack?: () => void;
    onNext: () => void;
};

export default function OnboardingTemplate({
  title, 
  subtitle, 
  buttonText, 
  showBack = false, 
  onBack, 
  onNext, 
}: any ) {

  
 const path = `  
 M 0 ${CURVE_DEPTH} 
 L ${width * 0.89} ${CURVE_DEPTH + 120}
 Q ${width * 0.98 } ${CURVE_DEPTH + 120} ${width} ${CURVE_DEPTH + 1}
 L ${width} ${BLUE_HEIGHT}
 L 0 ${BLUE_HEIGHT}
 Z `
 ; 
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity style={styles.leftIcon} onPress={onBack} activeOpacity={0.7}>
            <View style={styles.backCircle}>
                <Text style={styles.backChevron}>
                   <Icon name="chevron-left" size={25} color="#fff" />
                </Text>
            </View>
        </TouchableOpacity>
        ) : null} 

        <TouchableOpacity style={styles.skipTouch} onPress={onNext} activeOpacity={0.7}>    
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.SvgWrapper} pointerEvents="none">
          <Svg
            width={width}
            height={BLUE_HEIGHT}
            viewBox={`0 0  ${width} ${BLUE_HEIGHT}`}
          >
            <Path d={path} fill="#092F4F" />
          </Svg>
        </View>  
        <View style={styles.blueContentWrapper}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.8}> 
            <Text style={styles.nextButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
 );
}

const styles = StyleSheet.create({
    safe:{
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
      },

      leftIcon: {
        position: "absolute",
        top: 18,
        left: 18,
        zIndex: 20,
      },
      backCircle: {
        width: 34,
        height: 34,
        borderRadius: 40,
        backgroundColor: '#092F4F',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      },
      backChevron: {
      color: '#fff',
      fontSize: 20,
      },
      skipTouch: {
        position: "absolute",
        top: 22,
        right: 18,
        zIndex: 20,
        padding: 6,
      },
      skipText: {
        color: "#0D3559",
        fontSize: 16,
      },
      SvgWrapper: {
        position: "absolute",
        bottom: 0,
        width,
        height: BLUE_HEIGHT,
      },
      blueContentWrapper: {
        position: "absolute",
        bottom: 42,
        width,
        alignItems: "center",
        paddingHorizontal: 28,
      },
      title: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
      },

      subtitle: {
        color: "#FFFFFF",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 150,
      },
      nextButton: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        paddingHorizontal: 125,
        borderRadius: 36,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      nextButtonText: {
        color: "#092F4F",
        fontSize: 12,
        fontWeight: "600",  
      },
      
});