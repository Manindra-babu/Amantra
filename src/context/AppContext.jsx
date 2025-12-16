import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Initialize state from localStorage or defaults
    const [users, setUsers] = useState(() => {
        const stored = localStorage.getItem("marketUsers");
        return stored ? JSON.parse(stored) : [];
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem("marketCurrentUser");
        return stored ? JSON.parse(stored) : null;
    });

    const [agreements, setAgreements] = useState(() => {
        const stored = localStorage.getItem("marketAgreements");
        return stored ? JSON.parse(stored) : [];
    });

    // Sync with localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem("marketUsers", JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("marketCurrentUser", JSON.stringify(currentUser));
        } else {
            localStorage.removeItem("marketCurrentUser");
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem("marketAgreements", JSON.stringify(agreements));
    }, [agreements]);

    // Auth Actions
    const login = (username, password) => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const register = (userData) => {
        if (users.find(u => u.username === userData.username)) {
            return { success: false, message: "Username already exists!" };
        }
        const newUser = { ...userData, address: "", pic: "" };
        setUsers([...users, newUser]);
        return { success: true };
    };

    // Content Actions
    const addAgreement = (agreement) => {
        setAgreements([...agreements, agreement]);
    };

    const updateAgreement = (updatedAgreement) => {
        setAgreements(agreements.map(a => a.id === updatedAgreement.id ? updatedAgreement : a));
    };

    return (
        <AppContext.Provider value={{
            users,
            currentUser,
            agreements,
            login,
            logout,
            register,
            addAgreement,
            updateAgreement
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
