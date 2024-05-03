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



function createNewVan() {
    var vanNum = document.getElementById("vanNum").value;
    console.log("vanNum = ", vanNum);
    var parsedVanNum = parseInt(vanNum, 10); // แปลงค่าให้เป็นตัวเลข
    if (isNaN(parsedVanNum)) {
        alert("กรุณาระบุหมายเลขรถ");
        return;
    }

    let newr = "NO";

    // Access Firestore collection "school" and query documents
    const schoolRef = collection(db, 'school');
    const q = query(schoolRef, where('school-name', '==', currentUser.school_name));

    // Listen for query snapshots
    onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Access sub-collection "car" within the document
            const carRef = collection(doc.ref, 'car');
            // Query documents in "car" sub-collection
            const carQuery = query(carRef, where('car-number', '==', vanNum));
            // Listen for car query snapshots
            onSnapshot(carQuery, (carQuerySnapshot) => {
                if (carQuerySnapshot.empty) {
                    newr = "YES";
                    // If there are no documents with the specified car-number
                    console.log("no car-number: ", vanNum);
                    // Perform your logic for handling no vanNum documents here
                    // Create a new document with car-number = vanNum 
                    const carRef = collection(doc.ref, 'car');
                    const carData = {
                        "car-number": vanNum,
                        "update": false
                    };
                    // เพราะกำหนด car-number ตรงๆไม่ได้ (ใช้ - ไม่ได้) เลยต้องมาใช้ const
                    addDoc(carRef, carData)
                    .then((docRef) => {
                        alert('เพิ่มรถคันใหม่สำเร็จ')
                        location.reload();
                        console.log("New document created with car number: ", vanNum);
                        // Perform your logic for handling new document creation here
                    })
                    .catch((error) => {
                        console.error("Error creating new document: ", error);
                    });
                } else {
                    if(newr == "NO"){
                        alert('มีรถหมายเลขนี้แล้ว กรุณาใช้หมายเลขอื่น')
                        console.log('car found in the car number:', vanNum);
                    }else{
                        alert('กรุณารอสักครู่ กำลังเพิ่มรถคันใหม่')
                        console.log('car found in the car number:', vanNum);
                    }
                    
                }
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    const addButton = document.getElementById('createVan');
    addButton.addEventListener('click', createNewVan);   
});
