import React from "react";  
import { SafeAreaView } from "react-native-safe-area-context";            
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from "react-native";
import Svg, { Path} from "react-native-svg";

const { width, height } = Dimensions.get("window");
const BLUE_HEIGHT = height * 0.7;
const CURVE_DEPTH = 90;

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
 L ${width * 0.72} ${CURVE_DEPTH + 140}
 Q ${width * 0.9} ${CURVE_DEPTH + 180} ${width * 0.99} ${CURVE_DEPTH - 0}
 Q ${width * 9} ${CURVE_DEPTH - 0} ${width} ${CURVE_DEPTH - 0}
 L ${width} ${BLUE_HEIGHT}
 L 0 ${BLUE_HEIGHT}
 Z `
 ; 
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity style={styles.leftIcon} onPress={onBack} activeOpacity={0.7}>
            <View style={styles.leftCircle}>
                <Text style={styles.leftChevron}>{'<'}</Text>
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
            viewBox={`0 0 ${width} ${BLUE_HEIGHT}`}
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
      leftCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#092F4F",
        justifyContent: "center",
        alignItems: "center",
        },
      leftChevron: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",      
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
        bottom: 180,
        width,
        alignItems: "center",
        paddingHorizontal: 28,
      },
      title: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
      },

      subtitle: {
        color: "#FFFFFF",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
      },
      nextButton: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        paddingHorizontal: 125,
        borderRadius: 28,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      nextButtonText: {
        color: "#092F4F",
        fontSize: 16,
        fontWeight: "600",  
      },
      
});