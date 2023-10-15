import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '../../style/Styling.css';
document.head.appendChild(link);

async function fetchAdminData() {
  const db = FirebaseAPI.getFirestore();
  const adminRef = FirebaseAPI.collection(db, 'admin');
  const adminQuerySnapshot = await FirebaseAPI.getDocs(
    FirebaseAPI.query(adminRef, FirebaseAPI.where("school_name", "==", currentUser.school_name))
  );

  if (!adminQuerySnapshot.empty) {
    adminQuerySnapshot.forEach(doc => {
      const adminData = doc.data();

      // Create card element
      const card = document.createElement('div');
      card.className = 'card';

      // Create card body element
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // Create card title element
      const cardTitle = document.createElement('h5');
      cardTitle.className = 'card-title';
      cardTitle.textContent = adminData.field_name; // เปลี่ยน 'field_name' เป็นชื่อ field ที่ต้องการแสดง

      // Add click event listener to card
      card.addEventListener('click', function () {
        const room = adminData.field_name; // เปลี่ยน 'field_name' เป็นชื่อ field ที่ต้องการใช้ใน URL
        window.location.href = `../../Panel4SubRoomSelection.html?room=${room}`;
      });

      // Append elements to card
      cardBody.appendChild(cardTitle);
      card.appendChild(cardBody);

      // Append card to container
      const studentRoomContainer = document.getElementById('studentRoomContainer');
      studentRoomContainer.appendChild(card);

      // Add line break and separator if needed
      const lineBreak = document.createElement('br');
      studentRoomContainer.appendChild(lineBreak);

      const separator = document.createElement('div');
      separator.classList.add("divider");
      cardBody.appendChild(separator);
    });
  } else {
    console.log("No announcements found.");
  }
}

// Call the function to fetch and display admin data
fetchAdminData();
