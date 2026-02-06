import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useRecurring = () => {
    const [recurringItems, setRecurringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setRecurringItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'recurring'),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecurringItems(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching recurring items: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addRecurringItem = async (item) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'recurring'), {
                ...item,
                userId: currentUser.uid,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding recurring item: ", e);
            alert("Error adding subscription.");
        }
    };

    const deleteRecurringItem = async (id) => {
        if (!currentUser) return;
        if (window.confirm('Stop tracking this subscription?')) {
            try {
                await deleteDoc(doc(db, 'recurring', id));
            } catch (e) {
                console.error("Error deleting recurring item: ", e);
            }
        }
    };

    return {
        recurringItems,
        loading,
        addRecurringItem,
        deleteRecurringItem
    };
};
