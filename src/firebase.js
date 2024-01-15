import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEJD6W7GDt3kIR2TMOLukQ3KRv33A-Yu8",
  authDomain: "test-ifabula-library.firebaseapp.com",
  projectId: "test-ifabula-library",
  storageBucket: "test-ifabula-library.appspot.com",
  messagingSenderId: "1027492215464",
  appId: "1:1027492215464:web:5c0bcc61660b0854db609d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const firestore = getFirestore(app);

export { auth, firestore };
export default app;

