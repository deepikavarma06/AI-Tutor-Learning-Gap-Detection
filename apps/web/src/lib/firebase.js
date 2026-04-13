import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXalv0lqJWvbjBvmUAQ6GFj-22aZpfnLI",
  authDomain: "ai-tutoring-with-gap-detection.firebaseapp.com",
  projectId: "ai-tutoring-with-gap-detection",
  storageBucket: "ai-tutoring-with-gap-detection.firebasestorage.app",
  messagingSenderId: "237577388311",
  appId: "1:237577388311:web:a1d77f4c25b0dd54313752",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;