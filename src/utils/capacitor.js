import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

export const isNative = () => Capacitor.isNativePlatform();

export const initCapacitor = async () => {
    if (!isNative()) return;

    // Set Status Bar to light mode (matching the app's dark theme usually)
    // or use Style.Dark for white text on dark background
    try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0f172a' }); // matches your slate-900
    } catch (e) {
        console.warn('StatusBar not available', e);
    }

    // Handle Android Back Button
    App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
            App.exitApp();
        } else {
            window.history.back();
        }
    });
};

export const hapticFeedback = async (style = ImpactStyle.Medium) => {
    if (!isNative()) return;
    try {
        await Haptics.impact({ style });
    } catch (e) {
        console.warn('Haptics not available', e);
    }
};

export const hapticSuccess = async () => {
    if (!isNative()) return;
    try {
        await Haptics.notification({ type: 'SUCCESS' });
    } catch (e) {
        console.warn('Haptics not available', e);
    }
};

export const checkBiometricSupport = async () => {
    if (!isNative()) return { isAvailable: false };
    try {
        const result = await BiometricAuth.checkBiometry();
        return {
            isAvailable: result.isAvailable,
            biometryType: result.biometryType,
            reason: result.reason
        };
    } catch (e) {
        console.error('Biometric check failed', e);
        return { isAvailable: false };
    }
};

export const performNativeBiometricAuth = async (message = "Please authenticate to open Ledger") => {
    if (!isNative()) return false;
    try {
        await BiometricAuth.authenticate({
            reason: message,
            cancelTitle: "Use PIN",
        });
        return true;
    } catch (e) {
        console.error('Native Biometric Auth failed', e);
        return false;
    }
};
