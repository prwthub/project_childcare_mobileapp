import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

// 
// Import the necessary functions from the Firebase Authentication module
import { getAuth, deleteUser as deleteAuthUser, onAuthStateChanged, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js';

// Function to delete a user by email
async function deleteUserByEmail(email) {
  const auth = getAuth();
  
  try {
    // Get the user by email
    const user = await getUserByEmail(email);

    // Check if the user exists
    if (user) {
      // Delete the user by UID
      await deleteAuthUser(auth, user.uid);
      console.log('User deleted successfully from Firebase Authentication:', email);
    } else {
      console.log('User not found in Firebase Authentication:', email);
    }
  } catch (error) {
    console.error('Error deleting user from Firebase Authentication:', error);
  }
}

// Function to get a user by email
async function getUserByEmail(email) {
  const auth = getAuth();

  try {
    // Get user information by email
    const userRecord = await getAuthUserByEmail(auth, email);
    return userRecord; // ไม่ต้องแปลงเป็น JSON ในฟังก์ชันนี้
  } catch (error) {
    // Handle errors or return null if the user is not found
    return null;
  }
}

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '../../style/Styling.css';
document.head.appendChild(link);
//
async function fetchAdminData() {
  const db = FirebaseAPI.getFirestore();
  const adminRef = FirebaseAPI.collection(db, 'admin');
  const adminQuerySnapshot = await FirebaseAPI.getDocs(
    FirebaseAPI.query(adminRef, FirebaseAPI.where("school_name", "==", currentUser.school_name))
  );

  if (!adminQuerySnapshot.empty) {
    const admins = adminQuerySnapshot.docs
      .map(doc => {
        const adminData = doc.data();
        return {
          id: doc.id,
          email: adminData.email,
          school_name: adminData.school_name,
          role: adminData.role,
        };
      })
      .sort((a, b) => a.email.localeCompare(b.email, undefined, { sensitivity: 'base' }));

    admins.forEach(async (admin) => {
      console.log("email: " + admin.email);
      console.log("school: " + admin.school_name);
      console.log("role: " + admin.role);
      console.log("doc.id: " + admin.id);
      try {
        // Get the user by email
        const email = admin.email;
        const user2 = await getUserByEmail(email);
        console.log('user2:', user2); // เพิ่มบรรทัดนี้
      
        // Check if the user exists
        if (user2) {
          // Delete the user by UID
          console.log('user2.uid = ', user2.uid);
          console.log('user2.email = ', user2.email);
        } else {
          console.log('User not found in Firebase Authentication:', email); // เพิ่มบรรทัดนี้
        }
      } catch (error) {
        console.error('Error:', error);
      }
    
      // const auth = getAuth();
      // // Set up an authentication state observer
      // onAuthStateChanged(auth, (user) => {
      //   if (user) {
      //     // User is signed in
      //     console.log("User UID:", user.uid);
      //     console.log("User Email:", user.email);
      //   } else {
      //     // User is signed out
      //     console.log("User is signed out");
      //   }
      // });
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

      // Create card text element (for body content)
      const cardText = document.createElement('p');
      cardText.className = 'card-text';
      cardText.textContent = "( " + admin.role + " )";

      if (currentUser.role != 'super admin') {
        if (admin.email != currentUser.email) {
          cardTitle.textContent = admin.email;
        } else {
          cardTitle.textContent = admin.email + " (คุณ)";
        }
        // Append elements to card
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        // const separator = document.createElement('div');
        // separator.classList.add("divider");
        // cardBody.appendChild(separator);
        card.appendChild(cardBody);
      } else {
        if (admin.email != currentUser.email) {
          cardTitle.textContent = admin.email;

          // Create delete button
          const deleteButton = document.createElement('button');
          deleteButton.className = 'btn btn-danger';
          deleteButton.textContent = 'ลบผู้ใช้';
          deleteButton.style.float = 'right'; // Add float: right style

          // Add click event listener to delete button
          deleteButton.addEventListener('click', async function (event) {
            event.preventDefault();
            console.log(currentUser.role);
            const confirmAdminRemove = confirm('Are you sure you want to remove admin "' + admin.email + '" ?');
            if (confirmAdminRemove) {
              console.log("If super admin condition passed, entered the condition.");
              console.log('Admin Reference:', adminRef.path);
              console.log('Deleting document with ID:', admin.id); // Use admin.id instead of doc.id
              
              // Remove from firebase firestore
              const docRef = FirebaseAPI.doc(FirebaseAPI.collection(db, 'admin'), admin.id); // Create a reference to the document
              await FirebaseAPI.deleteDoc(docRef);  // Use admin.id instead of doc.id

              // Remove from Firebase Authentication
              // try {
              //   const user = await FirebaseAPI.getUserByEmail(admin.email);
              //   if (user) {
              //     await FirebaseAPI.deleteUser(user.uid);
              //     console.log('User deleted from Firebase Authentication:', user.email);
              //   } else {
              //     console.log('User not found in Firebase Authentication:', admin.email);
              //   }
              // } catch (error) {
              //   console.error('Error deleting user from Firebase Authentication:', error);
              // }
              // Example usage
              const userEmailToDelete = admin.email;
              deleteUserByEmail(userEmailToDelete);
              
              // Remove card from UI after deletion
              card.remove();
              alert('Admin deleted successfully!');
            }
          });
          // Append elements to card
          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardText);

          const separator = document.createElement('div');
          separator.classList.add("divider");
          cardBody.appendChild(separator);
          cardBody.appendChild(deleteButton);
          card.appendChild(cardBody);
        } else {
          cardTitle.textContent = admin.email + " (คุณ)";
          // Append elements to card
          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardText);
          card.appendChild(cardBody);
        }
      }

      // Append card to container
      const adminContainer = document.getElementById('adminContainer');
      adminContainer.appendChild(card);

      // Add line break and separator if needed
      const lineBreak = document.createElement('br');
      adminContainer.appendChild(lineBreak);
    });
  } else {
    console.log("No announcements found.");
  }
}

// Call the function to fetch and display admin data
fetchAdminData();
