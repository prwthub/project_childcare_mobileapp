import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

// Import Styling.
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '../../style/Styling.css';
document.head.appendChild(link);

// Check school
const db = FirebaseAPI.getFirestore();
const schoolRef = FirebaseAPI.collection(db, 'school');
const schoolQuerySnapshot = await FirebaseAPI.getDocs(
  FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", currentUser.school_name))
);


if (!schoolQuerySnapshot.empty) {
  const schoolDocument = schoolQuerySnapshot.docs[0];
  const studentRoomRef = FirebaseAPI.collection(schoolDocument.ref, 'student');
  const studentRoomQuerySnapshot = await FirebaseAPI.getDocs(studentRoomRef);

  // Check if there are any student documents
  if (!studentRoomQuerySnapshot.empty) {
    // Loop
    // There's div in Panel4Student with the id below.
    const studentRoomContainer = document.getElementById('studentRoomContainer');

    const studentRoomData = studentRoomQuerySnapshot.docs
   .filter(doc => {
     const hasRoomField = doc.data().hasOwnProperty('room'); // Only include documents with the "room" field

     if (!hasRoomField) {
       console.log('Document without "room" field :', doc.id);
       return false;
     }

     const roomValue = doc.data().room;
     // ตรวจสอบรูปแบบของ roomValue (เลข/เลข หรือ เลข/ตัวอักษร)
     if (!/^(\d+\/\d+|\d+\/[a-zA-Z]+)$/.test(roomValue)) {
       console.log(`Invalid "Room" field format in document :`, doc.id, roomValue);
       return false;
     }

     return true;
   })
   .map(doc => doc.data());


   studentRoomData.sort((a, b) => {
    const roomPartsA = a.room.split('/');
    const roomPartsB = b.room.split('/');
  
    if (roomPartsA.length !== 2 || roomPartsB.length !== 2) {
      console.log('Invalid room format:', a.room, b.room);
      return 0; // No change in order
    }
  
    const [levelA, roomNumA] = roomPartsA.map(part => isNaN(part) ? part.charCodeAt(0) : parseInt(part));
    const [levelB, roomNumB] = roomPartsB.map(part => isNaN(part) ? part.charCodeAt(0) : parseInt(part));
  
    if (levelA !== levelB) {
      return levelA - levelB;
    } else {
      return roomNumA - roomNumB;
    }
  });
  

    studentRoomData.forEach(studentRoomData => {
      const card = document.createElement('div');
      card.className = 'card';
   
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
   
      const cardTitle = document.createElement('h5');
      cardTitle.className = 'card-title';
      cardTitle.textContent = studentRoomData.room;
   
      card.addEventListener('click', function () {
        const room = studentRoomData.room;
        window.location.href = `../../Panel4SubRoomSelection.html?room=${room}`;
      });
   
      cardBody.appendChild(cardTitle);
      card.appendChild(cardBody);
      studentRoomContainer.appendChild(card);
   
      const lineBreak = document.createElement('br');
      studentRoomContainer.appendChild(lineBreak);
   
      const separator = document.createElement('div');
      separator.classList.add("divider")
      cardBody.appendChild(separator);
    });
   
  } else {
    console.log("No announcements found.");
  }
} else {
  console.log("School document not found.");
}