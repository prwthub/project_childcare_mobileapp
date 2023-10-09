import { ref, storage, uploadBytes, getDownloadURL } from './FirebaseAPI.js'

const driverUpload = document.getElementById("uploadDriverForm");
driverUpload.addEventListener("change", (e) => {

  const file = e.target.files[0];

  if (file) {
    // Check if the uploaded file is an .json file
    if (file.name.endsWith(".json")) {

      // Upload .json file to firebase storage
      const driverRef = ref(storage, "KMUTNB/form_driver/" + file.name);
      uploadBytes(driverRef, file)
        .then((result) => {
          alert("upload to storage successful");
        })
        .catch((err) => {
          alert("upload to storage failed");
        });
    } else {
      alert("Please upload a valid .json file.");
    }
  }
});

// upload to firestore

// json to Firebase Firestore

document
  .getElementById("uploadDriverForm")
  .addEventListener("change", handleFileSelect, false);

function handleFileSelect(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const jsonContent = e.target.result;
    const jsonData = JSON.parse(jsonContent);
    
    // Upload the data to Firestore
    const firestore = firebase.firestore();
    const collectionRef = firestore.collection("testing");

    // Upload each object from the JSON data to Firestore
    jsonData.forEach((item) => {
      collectionRef.add(item);
    });

    console.log("Data uploaded to Firestore successfully!");
    alert("successful");
  };
  reader.readAsText(file);
}
