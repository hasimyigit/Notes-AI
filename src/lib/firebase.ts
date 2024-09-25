// Import the functions you need from the SDKs you need
"use client"
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "notes-app-ai.firebaseapp.com",
  projectId: "notes-app-ai",
  storageBucket: "notes-app-ai.appspot.com",
  messagingSenderId: "190107277951",
  appId: "1:190107277951:web:bc22b41e0155a725493d4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const myStorage = getStorage(app);