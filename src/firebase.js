import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAj_NPZ94TqfPCZNLRFKeLLbHW38WSBPQ8",
  authDomain: "cost-calculator-eff80.firebaseapp.com",
  projectId: "cost-calculator-eff80",
  storageBucket: "cost-calculator-eff80.firebasestorage.app",
  messagingSenderId: "639177859206",
  appId: "1:639177859206:web:f19b2f8f70d59db0ae3107"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);