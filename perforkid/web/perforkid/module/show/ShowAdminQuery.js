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
      console.log("email : " + adminData.email);
      console.log("school : " + adminData.school_name);
      console.log("role : " + adminData.role);
      console.log("doc.id : " + doc.id);
      console.log("");

      // Create card element
      const card = document.createElement('div');
      card.className = 'card';

      // Create card body element
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // Create card title element
      const cardTitle = document.createElement('h5');
      cardTitle.className = 'card-title';
      if (adminData.email == currentUser.email) {
        cardTitle.textContent = adminData.email + " (คุณ)";

        // Append elements to card
        cardBody.appendChild(cardTitle);
        // const separator = document.createElement('div');
        // separator.classList.add("divider");
        // cardBody.appendChild(separator);
        card.appendChild(cardBody);
      } else {
        cardTitle.textContent = adminData.email;

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.textContent = 'ลบผู้ใช้';
        deleteButton.style.float = 'right'; // Add float: right style
        // Add click event listener to delete button
        deleteButton.addEventListener('click', async function (event) {
          event.preventDefault();
          if (currentUser.role == 'super admin') {
            await FirebaseAPI.deleteDoc(adminRef, doc.id);
            // Remove card from UI after deletion
            card.remove();
          } else {
            console.log("You do not have permission to delete.");
          }
        }); 


        // Append elements to card
        cardBody.appendChild(cardTitle);
        const separator = document.createElement('div');
        separator.classList.add("divider");
        cardBody.appendChild(separator);
        cardBody.appendChild(deleteButton);
        card.appendChild(cardBody);
      }

      // Append card to container
      const studentRoomContainer = document.getElementById('studentRoomContainer');
      studentRoomContainer.appendChild(card);

      // Add line break and separator if needed
      const lineBreak = document.createElement('br');
      studentRoomContainer.appendChild(lineBreak);
    });
  } else {
    console.log("No announcements found.");
  }
}

// Call the function to fetch and display admin data
fetchAdminData();