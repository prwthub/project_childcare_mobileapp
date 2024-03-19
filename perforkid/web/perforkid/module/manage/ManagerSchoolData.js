import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
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
const db = getFirestore(app);

const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

const form = document.getElementById('schoolEditForm2');

form.addEventListener('click', function (e) {
    e.preventDefault();
    console.log("Form submitted");
});

