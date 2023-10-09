import * as FirebaseAPI from "../../FirebaseAPI/FirebaseAPI.js";

const dropdownField = document.getElementById('school_dropdown_field'); // Query "school-name" field to Dropdown
const db = FirebaseAPI.getFirestore();
const schoolsRef = FirebaseAPI.collection(db, 'school')

FirebaseAPI.getDocs(schoolsRef).then((querySnapshot) => {
querySnapshot.forEach((doc) => {
    const schoolData = doc.data();
    const schoolName = schoolData['school-name'];

    // Create and append an option element
    const optionElement = document.createElement('option');
    optionElement.value = schoolName;
    optionElement.textContent = schoolName;
    dropdownField.appendChild(optionElement);
});
}).catch((error) => {
console.error('Error getting documents: ', error);
}); // Query ends here



