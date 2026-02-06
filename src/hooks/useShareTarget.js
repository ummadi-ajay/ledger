import { useState, useEffect } from 'react';

// Hook to handle shared files from the Share Target API
export const useShareTarget = () => {
    const [sharedFile, setSharedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const handleSharedFile = async () => {
            // Check if we're on the share-target route
            if (!window.location.pathname.includes('share-target')) return;

            // Use the File Handling API (modern browsers)
            if ('launchQueue' in window) {
                window.launchQueue.setConsumer(async (launchParams) => {
                    if (launchParams.files && launchParams.files.length > 0) {
                        const fileHandle = launchParams.files[0];
                        const file = await fileHandle.getFile();
                        setSharedFile(file);
                    }
                });
            }

            // Fallback: Check for files in the service worker cache
            try {
                const cache = await caches.open('shared-files');
                const response = await cache.match('shared-image');

                if (response) {
                    const blob = await response.blob();
                    const file = new File([blob], 'shared-receipt.jpg', { type: blob.type });
                    setSharedFile(file);
                    // Clean up the cache
                    await cache.delete('shared-image');
                }
            } catch (error) {
                console.log('No shared files in cache:', error);
            }

            // Redirect to main app after processing
            if (window.location.pathname.includes('share-target')) {
                window.history.replaceState({}, '', '/ledger/');
            }
        };

        handleSharedFile();
    }, []);

    const clearSharedFile = () => {
        setSharedFile(null);
    };

    return { sharedFile, clearSharedFile, isProcessing, setIsProcessing };
};

export default useShareTarget;
