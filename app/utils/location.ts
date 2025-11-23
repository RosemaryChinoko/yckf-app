import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import {Alert, Platform, Share } from 'react-native';

/* Request foreground location permission if needed, and return boolean*/
export async function ensureLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      return true;
    }

    Alert.alert(
      "Permission required",
      "Location permission is required to capture your coordinates."
    );

    return false;
  } catch (err) {
    console.warn("ensureLocationPermission error", err);
    return false;
  }
}



/* Get a single current position. Returns null or failure. */
export async function getCurrentPosition(){
  try {
    const ok = await ensureLocationPermission();
    if (!ok) return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      mayShowUserSettingsDialog: true,
    });

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
  } catch (err) {
    console.warn("getCurrentPosition error", err);
    return null;
  }
}


    /* Compose a whatsapp share message that includes coordinates + maps link. Attempts to open WhatsApp; if not available, falls back to share sheet. */

    export async function shareCurrentLocationViaWhatsApp(displayName?: string) {
        try {
            const pos = await getCurrentPosition();
            if (!pos) {
                Alert.alert('Location required', 'unable to get current location');
                return;
            }

            const lat = pos.latitude;
            const lon = pos.longitude;
            const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
            const message =  [`YCKF Current location`, displayName ? `Name: ${displayName}` : '', `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`, `${mapsUrl}`,

            ]
            .filter(Boolean)
            .join('\n');

            const whatsappURL = `whatsapp://send?text=${encodeURIComponent(message)}`;
            const canOpen = await Linking.canOpenURL(whatsappURL);
            if (canOpen) {
                await Linking.openURL(whatsappURL);
                return;
            }

            //Fallback: generic share
            await Share.share({ message });
        } catch (err) {
            console.warn('shareCurrentLocationViaWhatsApp', err);
            Alert.alert('Share error', 'Unable to share current location.');
        }
    }

    /* Instruct user how to start "Live Location" sharing (opens Google Maps if available). We can't reliably start live-sharing programmatically, so we open Maps and show instructions.*/
    export async function instructShareLiveLocation() {
        try {
            //Try to open GoogleMaps app first(best user experience)
            //On Android `geo:` or `google.navigation:` or maps.google.com can be used
            const appSchemes = [
                'comgooglemaps://', //ios/ Android map app scheme (if installed)
                'geo: 0, 0?q=0, 0', // Android geo fallback (may open maps app)
                'https://maps.google.com', //web fallback
            ];

            let launched = false;
            for (const scheme of appSchemes) {
                try{
                    if (await Linking.canOpenURL(scheme)) {
                        await Linking.openURL(scheme);
                        launched = true;
                        break;
                    }
                } catch (e) {
                    //try next
                }
            }

            // Always show a short instruction dialog (user still needs to tap share in maps)
            Alert.alert(
                'Share live location',
                `To share live location:\n\n1. In Google Maps open your profile/avatar.\n2.
                Tap "Location sharing".\n3. Choose a duration and share via WhatsApp or a contact.\n\n We opened Maps for you$
                {launched ? '' : ', please open Google Maps manually' } to start the process.`,
                [{ text: 'OK' }]
            );
        } catch (err) {
            console.warn('instructShareLiveLocation', err);
            Alert.alert(
                'Live share',
                'Unable to open Maps. Please open Maps manually and use the "location sharing" feature.',
            );
        }
    }

          

