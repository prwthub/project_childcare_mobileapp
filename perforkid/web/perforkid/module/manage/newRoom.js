import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// Import currentUser
import currentUser from '../user/currentUser.js';
// import { update } from "firebase/database";

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



function createNewRoom() {
    var roomName = document.getElementById("roomName").value;
    let [front, back] = roomName.split('/');
    console.log("room name = ", roomName);
    console.log("font = ",front);
    console.log("back = ",back);
    // 1. ถ้าไม่มี /
    if (back === undefined) {
        alert("ชื่อห้องต้องอยู่ในรูปของ เลขชั้นปี/เลขห้อง");
        return;
    }

    // 2. ถ้ามี / แต่ตัวหน้าไม่ใช่ตัวเลข
    if (isNaN(front) || isNaN(back)) {
        alert("ชื่อห้องต้องอยู่ในรูปของ เลขชั้นปี/เลขห้อง");
        return;
    }
    var parsedfront = parseInt(front, 10); // แปลงค่าให้เป็นตัวเลข
    var parsedback = parseInt(back, 10); // แปลงค่าให้เป็นตัวเลข


    let newr = "NO";

    // Access Firestore collection "school" and query documents
    const schoolRef = collection(db, 'school');
    const q = query(schoolRef, where('school-name', '==', currentUser.school_name));

    // Listen for query snapshots
    onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Access sub-collection "student" within the document
            const studentRef = collection(doc.ref, 'student');
            // Query documents in "student" sub-collection
            const studentQuery = query(studentRef, where('room', '==', roomName));
            // Listen for student query snapshots
            onSnapshot(studentQuery, (studentQuerySnapshot) => {
                if (studentQuerySnapshot.empty) {
                    newr = "YES";
                    // If there are no documents with the specified roomName
                    console.log("no room name: ", roomName);
                    // Perform your logic for handling no roomName documents here
                    // Create a new document with room = roomName and schedule = ''
                    const studentRef = collection(doc.ref, 'student');
                    addDoc(studentRef, {
                        room: roomName,
                        update: false,
                        schedule: ""
                    })
                    .then((docRef) => {
                        alert('เพิ่มห้องใหม่สำเร็จ')
                        location.reload();
                        console.log("New document created with room name: ", roomName);
                        // Perform your logic for handling new document creation here
                    })
                    .catch((error) => {
                        console.error("Error creating new document: ", error);
                    });
                } else {
                    // studentQuerySnapshot.forEach((studentDoc) => {
                    //     alert('มีชื่อห้องนี้แล้ว')
                    //     console.log('Student found in the room:', studentDoc.data());
                    // });
                    if(newr == "NO"){
                        alert('มีชื่อห้องนี้แล้ว กรุณาใช้ชื่ออื่น')
                        console.log('Student found in the room:', roomName);
                    }else{
                        alert('กรุณารอสักครู่ กำลังสร้างห้องใหม่')
                        console.log('Student found in the room:', roomName);
                    }
                    
                }
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    const addButton = document.getElementById('createRoom');
    addButton.addEventListener('click', createNewRoom);
});
