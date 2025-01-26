import { Linking } from 'react-native';
import { openBrowser } from '@swan-io/react-native-browser';
export default function linkWithFallback(url, accentColor) {
    try {
        openBrowser(url, {
            barTintColor: accentColor
        }).catch(() => {
            Linking.openURL(url);
        })
    } catch {
        Linking.openURL(url);
    }
}