// src/firebase.js
import { initializeApp, getApps } from 'firebase/app'
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAygS_jb4aiua6XpTiytWSYmyFedXAj5gY",
    authDomain: "fit5032-ass1.firebaseapp.com",
    projectId: "fit5032-ass1",
    storageBucket: "fit5032-ass1.appspot.com",
    messagingSenderId: "641142365145",
    appId: "1:641142365145:web:e54b9a8a53ba33507cd7c8"
}


if (!getApps().length) {
    initializeApp(firebaseConfig)
}

export const auth = getAuth()
export {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
}
