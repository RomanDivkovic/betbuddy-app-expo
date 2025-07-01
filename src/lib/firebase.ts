import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBClV_tPLlHNCkGJNAjtjHcWmQo-POxJ-s",
  authDomain: "bet-app-c6402.firebaseapp.com",
  databaseURL:
    "https://bet-app-c6402-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bet-app-c6402",
  storageBucket: "bet-app-c6402.firebasestorage.app",
  messagingSenderId: "705353476839",
  appId: "1:705353476839:web:41de23790f9eccb129d042",
};

// Initialize Firebase app only if it hasn't been initialized already
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Firebase Realtime Database
export const db: Database = getDatabase(app);
export default app;
