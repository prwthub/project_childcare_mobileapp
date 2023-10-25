import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {getStorage,ref,uploadBytes,} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import {getFirestore,collection,addDoc,getDocs,query,where} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
  authDomain: "perforkid-application.firebaseapp.com",
  projectId: "perforkid-application",
  storageBucket: "perforkid-application.appspot.com",
  messagingSenderId: "741346506533",
  appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
  measurementId: "G-TE2LC6M05D",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Import currentUser
import currentUser from '../user/currentUser.js';

// ในส่วนนี้คือการดึง currentUser จาก sessionStorage
const storedUser = sessionStorage.getItem('currentUser');

if (storedUser) {
    // แปลง JSON ที่ถูกเก็บไว้ใน sessionStorage กลับเป็น Object
    const storedCurrentUser = JSON.parse(storedUser);

    // ตั้งค่าค่า email และ school_name จาก storedCurrentUser
    currentUser.email = storedCurrentUser.email;
    currentUser.school_name = storedCurrentUser.school_name;
    currentUser.loggedin = storedCurrentUser.loggedin;
}

const adminExists = async (email) => {
    const db = getFirestore();
    const adminRef = collection(db, 'admin');
    const querySnapshot = await getDocs(query(adminRef, where('email', '==', email)));
    return !querySnapshot.empty;
};

function addAdmin() {
    const emailInput = document.getElementById('inputemail');
    const email = emailInput.value;
    
    if (email) {
        adminExists(email).then((exists) => {
            if (!exists) {
                const db = getFirestore();
                const schoolRef = collection(db, 'admin');
    
                const adminData = {
                    email: email,
                    school_name: currentUser.school_name,
                    role: "admin"
                };
    
                addDoc(schoolRef, adminData)
                    .then(() => {
                        console.log('Admin added successfully!');
                        alert('เพิ่ม admin สำเร็จ!');
                    })
                    .catch((error) => {
                        console.error('Error adding admin: ', error);
                    });
            } else {
                alert('มีอีเมลนี้ในระบบแล้ว');
            }
        });
    } else {
        console.error('Email field is required.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addAdminButton');
    addButton.addEventListener('click', addAdmin);
});