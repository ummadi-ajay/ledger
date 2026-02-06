import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useInvestments = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setAssets([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'investments'),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAssets(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching investments: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addAsset = async (name, type, quantity, buyPrice) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'investments'), {
                name,
                type, // 'stock', 'crypto', 'gold', 'mf'
                quantity: parseFloat(quantity),
                buyPrice: parseFloat(buyPrice),
                currentPrice: parseFloat(buyPrice), // Default to buy price
                userId: currentUser.uid,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding asset: ", e);
            alert("Error adding investment.");
        }
    };

    const updateAssetPrice = async (id, newPrice) => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, 'investments', id), {
                currentPrice: parseFloat(newPrice),
                updatedAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error updating asset: ", e);
        }
    };

    const deleteAsset = async (id) => {
        if (!currentUser) return;
        if (window.confirm('Remove this asset?')) {
            try {
                await deleteDoc(doc(db, 'investments', id));
            } catch (e) {
                console.error("Error deleting asset: ", e);
            }
        }
    };

    return {
        assets,
        loading,
        addAsset,
        updateAssetPrice,
        deleteAsset
    };
};
