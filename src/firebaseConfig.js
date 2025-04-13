import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAXI1_FnOQbgncL2SFWGwaBx057QntuVtg",
  authDomain: "nonso-anetoh-wdd.firebaseapp.com",
  projectId: "nonso-anetoh-wdd",
  storageBucket: "nonso-anetoh-wdd.firebasestorage.app",
  messagingSenderId: "775460561074",
  appId: "1:775460561074:web:ab9263a16eb14a6c51e9ab",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
