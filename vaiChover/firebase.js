// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfCoRZlXpL4SZ-TiVFh1s-RZp12QirPg4",
  authDomain: "vaichover-155.firebaseapp.com",
  databaseURL: "https://vaichover-155-default-rtdb.firebaseio.com",
  projectId: "vaichover-155",
  storageBucket: "vaichover-155.firebasestorage.app",
  messagingSenderId: "339180034550",
  appId: "1:339180034550:web:dbd8aa6101c3a5f7070fd7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);