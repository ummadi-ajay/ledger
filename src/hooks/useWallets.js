import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useWallets = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setWallets([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'wallets'),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedWallets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWallets(fetchedWallets);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching wallets: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addWallet = async (name, type, initialBalance = 0) => {
        if (!currentUser) return;
        try {
            // Check if this is the first wallet, if so make it primary
            const isFirst = wallets.length === 0;

            await addDoc(collection(db, 'wallets'), {
                name,
                type, // 'cash', 'bank', 'credit'
                initialBalance: parseFloat(initialBalance),
                userId: currentUser.uid,
                isPrimary: isFirst,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding wallet: ", e);
            alert("Error adding wallet.");
        }
    };

    const deleteWallet = async (id) => {
        if (!currentUser) return;
        if (window.confirm('Are you sure you want to delete this wallet? All associated transactions will remain but become unlinked.')) {
            try {
                await deleteDoc(doc(db, 'wallets', id));
            } catch (e) {
                console.error("Error deleting wallet: ", e);
            }
        }
    };

    const setPrimaryWallet = async (id) => {
        if (!currentUser) return;
        try {
            const batch = writeBatch(db);

            // Unset current primary
            const currentPrimary = wallets.find(w => w.isPrimary);
            if (currentPrimary) {
                batch.update(doc(db, 'wallets', currentPrimary.id), { isPrimary: false });
            }

            // Set new primary
            batch.update(doc(db, 'wallets', id), { isPrimary: true });

            await batch.commit();
        } catch (e) {
            console.error("Error setting primary wallet: ", e);
        }
    };

    return {
        wallets,
        loading,
        addWallet,
        deleteWallet,
        setPrimaryWallet
    };
};
