import { state, saveData } from './state.js';

export function login(username, password) {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
        state.currentUser = user;
        localStorage.setItem("marketCurrentUser", JSON.stringify(state.currentUser));
        return user;
    }
    return null;
}

export function logout() {
    state.currentUser = null;
    localStorage.removeItem("marketCurrentUser");
}

export function register(userData) {
    if (state.users.find(u => u.username === userData.username)) {
        return { success: false, message: "Username already exists!" };
    }
    const newUser = {
        ...userData,
        address: "",
        pic: ""
    };
    state.users.push(newUser);
    saveData();
    return { success: true };
}
