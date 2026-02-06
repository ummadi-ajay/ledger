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

export const useDebts = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setDebts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'debts'),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDebts(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching debts: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addDebt = async (person, amount, description, type) => {
        // type: 'lent' (owes me) or 'borrowed' (I owe)
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'debts'), {
                person,
                amount: parseFloat(amount),
                description,
                type,
                userId: currentUser.uid,
                status: 'pending', // pending, paid
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding debt: ", e);
            alert("Error adding debt record.");
        }
    };

    const settleDebt = async (id) => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, 'debts', id), {
                status: 'paid',
                settledAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error settling debt: ", e);
        }
    };

    const deleteDebt = async (id) => {
        if (!currentUser) return;
        if (window.confirm('Delete this record?')) {
            try {
                await deleteDoc(doc(db, 'debts', id));
            } catch (e) {
                console.error("Error deleting debt: ", e);
            }
        }
    };

    return {
        debts,
        loading,
        addDebt,
        settleDebt,
        deleteDebt
    };
};
