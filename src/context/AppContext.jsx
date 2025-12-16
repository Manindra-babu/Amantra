import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agreements, setAgreements] = useState(() => {
        const stored = localStorage.getItem("marketAgreements");
        return stored ? JSON.parse(stored) : [];
    });

    // Handle user state changes
    useEffect(() => {
        console.log("Setting up auth state listener");
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state changed:", user ? "User logged in" : "No user");
            if (user) {
                // User is signed in, fetch additional details from Firestore
                try {
                    console.log("Fetching user doc for:", user.uid);
                    const docRef = doc(db, "users", user.uid);

                    // Create a timeout promise
                    const timeout = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Request timed out")), 5000)
                    );

                    // Race between fetch and timeout
                    const userDoc = await Promise.race([getDoc(docRef), timeout]);

                    console.log("User doc fetched, exists:", userDoc.exists());
                    if (userDoc.exists()) {
                        setCurrentUser({ ...user, ...userDoc.data() });
                    } else {
                        console.log("User doc does not exist, using basic auth user");
                        setCurrentUser(user);
                    }
                } catch (e) {
                    console.error("Error fetching user doc (or timeout):", e);
                    // Still set current user so app loads even if Firestore fails
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sync agreements with localStorage
    useEffect(() => {
        localStorage.setItem("marketAgreements", JSON.stringify(agreements));
    }, [agreements]);

    // Auth Actions
    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return { success: false, message: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const { email, password, ...otherData } = userData;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store additional user details in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email,
                ...otherData,
                uid: user.uid,
                createdAt: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: error.message };
        }
    };

    // Content Actions
    const addAgreement = (agreement) => {
        setAgreements([...agreements, agreement]);
    };

    const updateAgreement = (updatedAgreement) => {
        setAgreements(agreements.map(a => a.id === updatedAgreement.id ? updatedAgreement : a));
    };

    // Profile Actions
    const updateUserProfile = async (updatedData) => {
        try {
            if (!currentUser) return { success: false, message: "No user logged in" };

            const userRef = doc(db, "users", currentUser.uid);
            // using setDoc with merge: true to create/update
            await setDoc(userRef, updatedData, { merge: true });

            // Update local state
            setCurrentUser({ ...currentUser, ...updatedData });
            return { success: true };
        } catch (error) {
            console.error("Error updating profile:", error);
            return { success: false, message: error.message };
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <AppContext.Provider value={{
            currentUser,
            loading,
            agreements,
            login,
            logout,
            register,
            addAgreement,
            updateAgreement,
            updateUserProfile
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
