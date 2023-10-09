import currentUser from "./currentUser.js";
import * as FirebaseAPI from "./FirebaseAPI/FirebaseAPI.js";

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './Styling.css';
document.head.appendChild(link);

const db = FirebaseAPI.getFirestore();
const schoolRef = FirebaseAPI.collection(db, 'school');
const schoolQuerySnapshot = await FirebaseAPI.getDocs(
  FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", currentUser.school_name))
);


if (!schoolQuerySnapshot.empty) {
  const schoolDocument = schoolQuerySnapshot.docs[0];
  const annoucementRef = FirebaseAPI.collection(schoolDocument.ref, 'annoucement');
  const annoucementQuerySnapshot = await FirebaseAPI.getDocs(annoucementRef);

  // Check if there are any announcements
  if (!annoucementQuerySnapshot.empty) {
    // Loop through the announcements
    // Assuming you have an HTML element where you want to display the announcements, e.g., <div id="announcementContainer"></div>
    const announcementContainer = document.getElementById('announcementContainer');

    annoucementQuerySnapshot.forEach((doc) => {
      const announcementData = doc.data();

          // Create a Bootstrap card element
          const card = document.createElement('div');
          card.className = 'card';

          // Create the card body
          const cardBody = document.createElement('div');
          cardBody.className = 'card-body';

          // Create the card title (header)
          const cardTitle = document.createElement('h5');
          cardTitle.className = 'card-title';
          cardTitle.textContent = announcementData.head;

          // Create the card content
          const cardContent = document.createElement('p');
          cardContent.className = 'card-text';
          cardContent.textContent = announcementData.content;

          // Create the card date
          const cardDate = document.createElement('p');
          cardDate.className = 'card-text text-muted';
          cardDate.textContent = `Date: ${announcementData.date}`;

          // Append elements to the card body
          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardContent);
          cardBody.appendChild(cardDate);

          // Append the card body to the card
          card.appendChild(cardBody);

          // Append the card to the container
          announcementContainer.appendChild(card);

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




