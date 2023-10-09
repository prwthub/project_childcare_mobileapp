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
    const vanRef = FirebaseAPI.collection(schoolDocument.ref, 'car');
    const vanQuerySnapshot = await FirebaseAPI.getDocs(vanRef);

    // Check if there are any student documents
    if (!vanQuerySnapshot.empty) {
        // Loop
        // There's div in Panel4Student with the id below.
        const vanContainer = document.getElementById('vanContainer');

        const vanData = vanQuerySnapshot.docs
            .filter(doc => {
                const hasVanField = doc.data().hasOwnProperty('car-number'); // Only include documents with the "room" field

                if (!hasVanField) { // Check if any doc doesn't have "Room" field. 
                    console.log('Document without "car-number" field :', doc.id);
                    return false;
                }

                const vanValue = doc.data()['car-number'];
                if (vanValue !== null && vanValue !== undefined) {
                    const isNumberString = /^\d+$/.test(vanValue);

                    if (isNumberString) {
                        // vanValue is a string consisting of only digits
                        console.log(`Valid "car-number" field:`, vanValue);
                    } else {
                        console.log(`Invalid "car-number" field format:`, doc.id);
                        return false;
                    }
                } else {
                    console.log(`"car-number" field is empty or undefined`);
                    return false;
                }

                return true; // Include documents with valid "room" field
            })
            .map(doc => doc.data());

        vanData.sort((a, b) => {
            const vanNumberA = parseInt(a['car-number'], 10);
            const vanNumberB = parseInt(b['car-number'], 10);

            return vanNumberA - vanNumberB;
        });

        vanData.forEach(vanData => {

            // Create a Bootstrap card element
            const card = document.createElement('div');
            card.className = 'card';

            // Create the card body
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Create the card title
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.textContent = vanData['car-number']

            // Add an event listener to the card
            card.addEventListener('click', function () {
                // Redirect to Panel5StudentVanSelection.html with the selected van
                console.log(vanData);
                const vanNum = vanData['car-number'];
                window.location.href = `Panel5StudentVanSelection.html?vanNum=${vanNum}`;
            });

            // Append elements to the card body
            cardBody.appendChild(cardTitle);

            // Append the card body to the card
            card.appendChild(cardBody);

            // Append the card to the container
            vanContainer.appendChild(card);

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




