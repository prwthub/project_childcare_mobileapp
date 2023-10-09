// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// import {getStorage,ref,uploadBytes,} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
// import {getFirestore,collection,addDoc,} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
//   authDomain: "perforkid-application.firebaseapp.com",
//   projectId: "perforkid-application",
//   storageBucket: "perforkid-application.appspot.com",
//   messagingSenderId: "741346506533",
//   appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
//   measurementId: "G-TE2LC6M05D",
// };

// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);
// const db = getFirestore(app);

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// // Import currentUser
// import currentUser from './module/user/currentUser.js';

// // ในส่วนนี้คือการดึง currentUser จาก sessionStorage
// const storedUser = sessionStorage.getItem('currentUser');

// if (storedUser) {
//     // แปลง JSON ที่ถูกเก็บไว้ใน sessionStorage กลับเป็น Object
//     const storedCurrentUser = JSON.parse(storedUser);

//     // ตั้งค่าค่า email และ school_name จาก storedCurrentUser
//     currentUser.email = storedCurrentUser.email;
//     currentUser.school_name = storedCurrentUser.school_name;
//     currentUser.loggedin = storedCurrentUser.loggedin;
// }


// function createNewRoom() {
//     var roomName = document.getElementById("roomName").value;

//     console.log(currentUser.email);
//     console.log(currentUser.school_name);
//     console.log(currentUser.loggedin);
// }


// document.addEventListener('DOMContentLoaded', (event) => {
//     const addButton = document.getElementById('createRoom');
//     addButton.addEventListener('click', createNewRoom);
// });