import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    writeBatch,
    where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Subscribe to real-time updates for THIS user only
        // Removed server-side sorting to bypass Firestore composite index requirement for now
        const q = query(
            collection(db, 'transactions'),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sorting by date (descending)
            fetchedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addTransaction = async (transaction) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'transactions'), {
                ...transaction,
                userId: currentUser.uid, // Attach User ID
                walletId: transaction.walletId || null, // Attach Wallet ID
                amountIn: parseFloat(transaction.amountIn) || 0,
                amountOut: parseFloat(transaction.amountOut) || 0,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding transaction: ", e);
            alert("Error adding transaction.");
        }
    };

    const deleteTransaction = async (id) => {
        if (!currentUser) return;
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteDoc(doc(db, 'transactions', id));
            } catch (e) {
                console.error("Error deleting transaction: ", e);
            }
        }
    };

    const editTransaction = async (updatedTransaction) => {
        if (!currentUser) return;
        try {
            const transactionRef = doc(db, 'transactions', updatedTransaction.id);
            const { id, ...data } = updatedTransaction;

            await updateDoc(transactionRef, {
                ...data,
                amountIn: parseFloat(data.amountIn) || 0,
                amountOut: parseFloat(data.amountOut) || 0
            });
        } catch (e) {
            console.error("Error updating transaction: ", e);
        }
    };

    const addBulkTransactions = async (newTransactions) => {
        if (!currentUser) return;
        try {
            const batch = writeBatch(db);

            newTransactions.forEach(t => {
                const docRef = doc(collection(db, 'transactions'));
                batch.set(docRef, {
                    date: t.date,
                    description: t.description,
                    category: t.category,
                    userId: currentUser.uid, // Attach User ID
                    amountIn: parseFloat(t.amountIn) || 0,
                    amountOut: parseFloat(t.amountOut) || 0,
                    createdAt: new Date().toISOString()
                });
            });

            await batch.commit();
        } catch (e) {
            console.error("Error adding bulk transactions: ", e);
            alert("Error processing bulk upload.");
        }
    };

    return {
        transactions,
        loading,
        addTransaction,
        deleteTransaction,
        editTransaction,
        addBulkTransactions
    };
};
