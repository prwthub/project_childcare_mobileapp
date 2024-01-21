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

    const posts = announcementQuerySnapshot.docs
      .map(doc => {
        const postsData = doc.data();
        return {
          id: doc.id,
          date: postsData.date,
          content: postsData.content,
          header: postsData.header,
          image: postsData.image,
          editStatus: postsData.editStatus
        };
      })
      .sort((a, b) => b.date - a.date);
    
    //===
    posts.forEach((doc) => {
      console.log("doc.id : ",doc.id);
      console.log("doc.header : ",doc.header);
      console.log("doc.date : ",doc.date);
      console.log("doc.content : ",doc.content);
      console.log("doc.image : ",doc.image);
      console.log("doc.editStatus : ",doc.editStatus);
      console.log("doc : ",doc);
      console.log("");
    })
    
    // This is for each post's edit button
    // announcementQuerySnapshot.forEach((doc) => {
      posts.forEach((announcementData) => {  
      //const announcementData = doc.data();
      
      const cardSpace = document.createElement('div');
      cardSpace.className = 'col-6';

      // Create a Bootstrap card element
      const card = document.createElement('div');
      card.className = 'card m-1 mb-5';

      // Create the card body
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // Create the card title (header)
      const cardTitle = document.createElement('b');
      cardTitle.className = 'card-title';
      cardTitle.style = 'font-size: 22px';
      cardTitle.textContent = announcementData.header;
      

      // Create the card content
      const cardContent = document.createElement('p');
      cardContent.className = 'card-text';
      cardContent.textContent = announcementData.content;

      // Create Delete button
      const cardDeleteButton = document.createElement('div');
      cardDeleteButton.className = 'btn btn-danger col-sm-5 justify-content-center m-2';
      cardDeleteButton.textContent = 'ลบโพสต์';
      cardDeleteButton.style.marginCenter = 'auto';

      // Create the card date
      const cardDate = document.createElement('p');
      const date = announcementData.date.seconds * 1000; // Convert seconds to milliseconds
      const formattedDate = new Date(date).toLocaleString(); // Format to a human-readable string
      cardDate.className = 'card-text text-muted';
      cardDate.textContent = 'โพสต์เมื่อ : ' + formattedDate;
      if (announcementData.editStatus == "Y") {
        cardDate.textContent += "  (มีการแก้ไข)";
      }

      const rawTimestamp = announcementData.date.toDate(); // Convert to milliseconds since epoch

      cardDeleteButton.addEventListener('click', function () {
        const confirmDelete = confirm("Are you sure you want to delete this announcement? This action cannot be undone.");
        if (confirmDelete) {
          console.log("Confirm Delete Clicked");
          console.log(rawTimestamp);
          deleteAnnouncement(rawTimestamp).then(() => {
            console.log("Announcement deleted successfully!");
            card.remove();
            location.reload();
          }).catch(error => {
            console.error("Error deleting announcement:", error);
            // Handle error if necessary
          });
          
        }
      });

      // // Create space col-2
      // const cardS = document.createElement('div');
      // cardS.className = 'col-sm-2';

      // Create the edit button
      const cardEditButton = document.createElement('div');
      cardEditButton.className = 'btn btn-primary col-sm-5 justify-content-center m-2';
      cardEditButton.textContent = 'แก้ไข';
      cardEditButton.style.marginCenter = 'auto';
      // cardEditButton.id = `cardEditButton_${doc.id}`
      cardEditButton.id = `cardEditButton_${announcementData.id}`
      console.log("Card's id: " + cardEditButton.id);
      cardEditButton.addEventListener('click', handleCardEditButtonClick);


      function handleCardEditButtonClick(e) {
        const announcementId = e.target.id;
        console.log("AnnouncementId " + announcementId);
        const cardEditClickedBtn = document.getElementById(announcementId);


        console.log("cardEditClickedBtn ", cardEditClickedBtn);

        document.getElementById("announcementFormEdit").reset();

        const editOverlay = document.getElementById('editOverlay');
        editOverlay.style.display = 'block';
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        const announcementh1TextElement = document.getElementById('announcementEdith1');
        announcementh1TextElement.innerHTML = `แก้ไขโพสต์ <br> <h5 class="mt-3"> หัวข้อเก่า : ${announcementData.header} </h5>`;
        const timestampBoxElement = document.getElementById('postTimestampEdit');
        timestampBoxElement.value = formattedDate;

        console.log("rawTimestamp " + rawTimestamp);

        const submitEditBtn = document.getElementById('submitEditBtn');
        submitEditBtn.addEventListener('click', function () {
          submitEditClickHandler(rawTimestamp);
          submitEditBtn.removeEventListener('click', submitEditClickHandler);
        });

        function submitEditClickHandler(rawTimestamp) {
          const announcementId = e.target.id;
          const cardEditClickedBtn = document.getElementById(announcementId);
          console.log("submitEditClickHandler Entered\n"+announcementId);
          // console.log(getEventListeners(cardEditClickedBtn));
          const postHeader = document.getElementById('postHeaderEdit').value;
          const postContent = document.getElementById('postContentEdit').value;
          const confirmEdit = "Are you sure to submit this edit to the announcement?";
          if (confirm(confirmEdit)) {
            if (!postHeader && !postContent) {
              e.preventDefault();
              console.log('Please fill something in the header or content fields.');
            } else {
              editAnnouncement(rawTimestamp).then(()=>{
                location.reload();
              });
            }
          }
        }

      }

      const cardImage = document.createElement('div');
      cardImage.className = 'card-text d-flex justify-content-center';
      
      // 
      if (!announcementData.image) {
        cardImage.innerHTML = ``;
        console.log("No Image Found\n" + announcementData.header);
      }else{
        cardImage.innerHTML = `
      <img src="${announcementData.image}" alt="Announcement Image" class="img-fluid">`;
      }

      // const separator = document.createElement('div');
      // separator.classList.add("divider")

      // Append elements to the card body
      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardContent);
      cardBody.appendChild(cardDate);
      if (announcementData.image) {
        cardBody.appendChild(cardImage);
      }
      
      // cardS
      // cardBody.appendChild(cardS);
      cardBody.appendChild(cardEditButton);

      //cardBody.appendChild(separator);
      cardBody.appendChild(cardDeleteButton);


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

function getEventListeners(element) {
  const listeners = getEventListenersOfNode(element);
  const result = {};

  for (const key in listeners) {
    if (listeners.hasOwnProperty(key)) {
      result[key] = [];

      listeners[key].forEach(listener => {
        result[key].push({
          listener: listener.listener,
          useCapture: listener.useCapture
        });
      });
    }
  }

  return result;
}

function getEventListenersOfNode(node) {
  const result = {};

  const registry = window.__eventRegistry;

  if (!registry) {
    return result;
  }

  const handlers = registry.handlers;

  if (!handlers) {
    return result;
  }

  Object.keys(handlers).forEach(key => {
    const handler = handlers[key];

    handler.forEach(event => {
      if (event.node === node || node.closest(event.node)) {
        if (!result[key]) {
          result[key] = [];
        }

        result[key].push({
          listener: event.listener,
          useCapture: event.useCapture
        });
      }
    });
  });

  return result;
}






