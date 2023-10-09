import currentUser from "./currentUser.js";
import * as FirebaseAPI from "./FirebaseAPI/FirebaseAPI.js";


// Import Styling.
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './Styling.css';
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

        if (!roomValue || typeof roomValue !== 'string' || !/^\d+\/\d+$/.test(roomValue)) {
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

      const [levelA, roomNumA] = roomPartsA.map(Number);
      const [levelB, roomNumB] = roomPartsB.map(Number);

      if (levelA !== levelB) {
        return levelA - levelB;
      } else {
        return roomNumA - roomNumB;
      }
    });

    studentRoomData.forEach(studentRoomData => {

      // Create a Bootstrap card element
      const card = document.createElement('div');
      card.className = 'card';

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
        window.location.href = `Panel4SubRoomSelection.html?room=${room}`;

      });



      // Append elements to the card body
      cardBody.appendChild(cardTitle);

      // Append the card body to the card
      card.appendChild(cardBody);

      // Append the card to the container
      studentRoomContainer.appendChild(card);

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




