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

        if (!hasRoomField) { // Check if any doc doesn't have "Room" field. 
          console.log('Document without "room" field :', doc.id);
          return false;
        }

        const roomValue = doc.data().room;
// ตรวจสอบรูปแบบของ roomValue (เลข/เลข หรือ เลข/ตัวอักษร)
     if (!/^(\d+\/\d+|\d+\/[a-zA-Z]+)$/.test(roomValue)) {
          console.log(`Invalid "Room" field format in document :`, doc.id, roomValue);
          return false; // Exclude documents with invalid "room" field format
        }

        return true; // Include documents with valid "room" field
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
    const levelRows = {};
    const cardRow = document.createElement('div');
    cardRow.className = 'row';
    studentRoomContainer.appendChild(cardRow);

    studentRoomData.forEach(studentRoomData => {

      const [level, roomNum] = studentRoomData.room.split('/')
      .map(part => isNaN(part) ? part.charCodeAt(0) : parseInt(part));

      if (!levelRows[level]) {
        // Create a new row for the level if it doesn't exist
        levelRows[level] = document.createElement('div');
        levelRows[level].className = 'row';

        const levelShow = document.createElement('div');
        levelShow.className = 'h1';
        levelShow.textContent = "Class " + level;

        studentRoomContainer.appendChild(levelShow);
        studentRoomContainer.appendChild(levelRows[level]);
      }

      const cardSpace = document.createElement('div');
      cardSpace.className = 'col-3';

      // Create a Bootstrap card element
      const card = document.createElement('div');
      card.className = 'card m-1 p-2 btn';

      // Create the card body
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // Create the card title
      const cardTitle = document.createElement('h5');
      cardTitle.className = 'card-title';
      cardTitle.textContent = studentRoomData.room;

      // Add an event listener to the card
      card.addEventListener('click', function () {
        // Redirect to Panel4SubRoomSelection.html with the selected room
        const room = studentRoomData.room;
        window.location.href = `../../Panel4SubRoomSelection.html?room=${room}`;
      });



      // Append elements to the card body
      cardBody.appendChild(cardTitle);

      // Append the card body to the card
      card.appendChild(cardBody);
      cardSpace.appendChild(card);

      // Append the card to the container
      levelRows[level].appendChild(cardSpace);

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




