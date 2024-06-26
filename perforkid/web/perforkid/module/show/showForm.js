import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import {getStorage,ref,listAll,getMetadata,getDownloadURL,} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
  authDomain: "perforkid-application.firebaseapp.com",
  projectId: "perforkid-application",
  storageBucket: "perforkid-application.appspot.com",
  messagingSenderId: "741346506533",
  appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
  measurementId: "G-TE2LC6M05D",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const fileList = document.getElementById("formList");
const foldername = fileList.getAttribute("folder");
const folderPath = `${foldername}/`; 
const filename = fileList.getAttribute("filename");
const storageRef = ref(storage, folderPath);

function listFilesInFolder(folderRef, parentList) {
  listAll(folderRef)
    .then((res) => {
      res.items.forEach((itemRef) => {
        getMetadata(itemRef)
          .then((metadata) => {
            if (metadata && metadata.name) {
              // ตรวจสอบชื่อไฟล์ที่ต้องการแสดง
              if (metadata.name == filename || filename == "") {
                const listItem = document.createElement("li");
                const button = document.createElement("button");
                button.textContent = metadata.name;
                listItem.appendChild(button);

                button.addEventListener("click", () => {
                  getDownloadURL(itemRef)
                    .then((url) => {
                      window.open(url);
                    })
                    .catch((error) => {
                      console.log("Error getting download URL:", error);
                    });
                });

                parentList.appendChild(listItem);
              }
            }
          })
          .catch((error) => {
            console.log("Error getting metadata:", error);
          });
      });

      res.prefixes.forEach((prefixRef) => {
        const folderName = prefixRef.name.replace(/\/$/, "");
        const folderItem = document.createElement("li");
        folderItem.textContent = folderName;
        const nestedList = document.createElement("ul");
        folderItem.appendChild(nestedList);
        parentList.appendChild(folderItem);
        listFilesInFolder(prefixRef, nestedList);
      });
    })
    .catch((error) => {
      console.log("Error listing files:", error);
    });
}


// เรียกใช้ฟังก์ชันเพื่อแสดงไฟล์
listFilesInFolder(storageRef, fileList);