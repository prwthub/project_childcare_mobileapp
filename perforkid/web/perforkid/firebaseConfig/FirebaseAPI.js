import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {
  getStorage,
  ref,
  listAll,
  getMetadata,
  getDownloadURL,
  uploadBytes,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  setDoc,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  deleteUser as deleteAuthUser,
  // getUserByEmail as getAuthUserByEmail (remove/comment this line)
} from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js';



const firebaseConfig = {
  apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
  authDomain: "perforkid-application.firebaseapp.com",
  projectId: "perforkid-application",
  storageBucket: "perforkid-application.appspot.com",
  messagingSenderId: "741346506533",
  appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
  measurementId: "G-TE2LC6M05D"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function deleteUser(uid) {
  const auth = getAuth();
  await deleteAuthUser(auth, uid);
}

export async function getUserByEmail(email) {
  const auth = getAuth();
  const users = await getDocs(collection(auth, 'users'));
  
  const user = users.docs.find(doc => doc.data().email === email);
  
  if (user) {
    return user.data();
  } else {
    // Handle the case where the user is not found
    return null;
  }
}


export { firebaseConfig, app, storage, ref, listAll, getMetadata, getDownloadURL, getFirestore, collection, 
  addDoc, uploadBytes, getDocs, setDoc, query, where, getAuth, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, doc, deleteDoc, deleteObject, updateDoc };