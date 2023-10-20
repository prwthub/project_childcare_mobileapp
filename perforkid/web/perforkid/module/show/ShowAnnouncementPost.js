import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";
import { deleteAnnouncement } from '../manage/AnnouncementDelete.js';
import { editAnnouncement } from "../manage/AnnouncementEdit.js";

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
  const announcementRef = FirebaseAPI.collection(schoolDocument.ref, 'announcement');
  const announcementQuerySnapshot = await FirebaseAPI.getDocs(announcementRef);


  // Check if there are any announcements
  if (!announcementQuerySnapshot.empty) {
    // Loop through the announcements
    // Assuming you have an HTML element where you want to display the announcements, e.g., <div id="announcementContainer"></div>
    const announcementContainer = document.getElementById('announcementContainer');

    const cardRow = document.createElement('div');
    cardRow.className = 'row';
    announcementContainer.appendChild(cardRow);

    // let cardCount = 0;

    announcementQuerySnapshot.forEach((doc) => {
      const announcementData = doc.data();

      // if (cardCount >= 1) {
      //   announcementContainer.appendChild(cardRow);
      //   cardCount = 0;
      // }

      const cardSpace = document.createElement('div');
      cardSpace.className = 'col-6';

      // Create a Bootstrap card element
      const card = document.createElement('div');
      card.className = 'card m-1';

      // Create the card body
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // Create the card title (header)
      const cardTitle = document.createElement('h5');
      cardTitle.className = 'card-title';
      cardTitle.textContent = announcementData.header;

      // Create the card content
      const cardContent = document.createElement('p');
      cardContent.className = 'card-text';
      cardContent.textContent = announcementData.content;

      // Create Delete button
      const cardDeleteButton = document.createElement('div');
      cardDeleteButton.className = 'btn btn-danger col-sm-6 justify-content-center';
      cardDeleteButton.textContent = 'Delete';
      cardDeleteButton.style.marginCenter = 'auto';

      // Create the card date
      const cardDate = document.createElement('p');
      const date = announcementData.date.seconds * 1000; // Convert seconds to milliseconds
      const formattedDate = new Date(date).toLocaleString(); // Format to a human-readable string
      cardDate.className = 'card-text text-muted';
      cardDate.textContent = formattedDate;

      const rawTimestamp = announcementData.date.toDate(); // Convert to milliseconds since epoch

      cardDeleteButton.addEventListener('click', function () {
        const confirmDelete = confirm("Are you sure you want to delete this announcement? This action cannot be undone.");
        if (confirmDelete) {
          console.log("Confirm Delete Clicked");
          console.log(rawTimestamp);
          deleteAnnouncement(rawTimestamp);
          card.remove();
        }
      });

      // Create the Edit Button
      const cardEditButton = document.createElement('div');
      cardEditButton.className = 'btn btn-primary col-sm-6 justify-content-center';
      cardEditButton.textContent = 'Edit';
      cardEditButton.style.marginCenter = 'auto';
      const submitEditBtn = document.getElementById('submitEditBtn');

      cardEditButton.addEventListener('click', function () {

        document.getElementById("announcementFormEdit").reset();

        const editOverlay = document.getElementById('editOverlay');
        editOverlay.style.display = 'block';

        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

        const announcementh1TextElement = document.getElementById('announcementEdith1');
        announcementh1TextElement.innerHTML = `--Announcement Edit-- <br> ${announcementData.header}`

        const timestampBoxElement = document.getElementById('postTimestampEdit');
        timestampBoxElement.value = formattedDate;

        console.log(rawTimestamp);

        submitEditBtn.addEventListener('click', function () {
          const confirmEdit = confirm("Are you sure to submit this edit to the announcement?");
          if (confirmEdit) {
            editAnnouncement(rawTimestamp);
          }
        });

        // window.location.href = `Panel1SubEditAnnouncement.html?timestamp=${rawTimestamp}`;
      });

      const cardImage = document.createElement('div');
      cardImage.className = 'card-text d-flex justify-content-center';
      cardImage.innerHTML = `
  <img src="${announcementData.image}" alt="Announcement Image" class="img-fluid">`;
      if (!announcementData.image) {
        console.log("No Image Found\n" + announcementData.header);
      }

      const separator = document.createElement('div');
      separator.classList.add("divider")

      // Append elements to the card body
      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardContent);
      cardBody.appendChild(cardDate);
      if (announcementData.image) {
        cardBody.appendChild(cardImage);
      }
      cardBody.appendChild(separator);
      cardBody.appendChild(cardDeleteButton);
      cardBody.appendChild(cardEditButton);




      // Append the card body to the card
      card.appendChild(cardBody);

      cardSpace.appendChild(card);

      // Append the card to the container
      cardRow.appendChild(cardSpace);

      // cardCount++;
    });
  } else {
    console.log("No announcements found.");
  }
} else {
  console.log("School document not found.");
}




