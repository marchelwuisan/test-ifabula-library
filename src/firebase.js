import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7dW19jsGPzO38gwfjqLkUfqeQ0L7CoJw",
  authDomain: "ifabula-test-library.firebaseapp.com",
  projectId: "ifabula-test-library",
  storageBucket: "ifabula-test-library.appspot.com",
  messagingSenderId: "1031672849045",
  appId: "1:1031672849045:web:50a89a676995849cd2f19c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const firestore = getFirestore(app);

export { auth, firestore };
export default app;

