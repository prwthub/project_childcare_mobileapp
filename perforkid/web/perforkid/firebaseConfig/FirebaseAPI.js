import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {
  getStorage,
  ref,
  listAll,
  getMetadata,
  getDownloadURL,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  where,
  doc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword  
} from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js'

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


export { firebaseConfig, app, storage, ref, listAll, getMetadata, getDownloadURL, getFirestore, collection, 
  addDoc, uploadBytes, getDocs, deleteDoc, setDoc, orderBy, query, where, getAuth, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, doc };