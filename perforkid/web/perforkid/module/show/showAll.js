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

const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const fileList = document.getElementById("allList");
const folderPath = `school/${currentUser.school_name}/`; 
const storageRef = ref(storage, folderPath);
const exceptfoldername = allList.getAttribute("except");
//const exceptfoldername = "announcementPost";

function listFilesInFolder(folderRef, parentList) {
    listAll(folderRef)
    .then((res) => {
        const sortedItems = res.items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })); // เรียงลำดับตามชื่อไฟล์

        sortedItems.forEach((itemRef) => {
            getMetadata(itemRef)
            .then((metadata) => {
                if (metadata.name !== exceptfoldername) {
                    const listItem = document.createElement("li");
                    const button = document.createElement("button");
                    button.textContent = metadata.name;
                    listItem.appendChild(button);

                    // Add event listener to download file on button click
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
            })
            .catch((error) => {
                console.log("Error getting metadata:", error);
            });
        });

        res.prefixes.forEach((prefixRef) => {
            const folderName = prefixRef.name.replace(/\/$/, "");
            if (folderName !== exceptfoldername) {
                const folderItem = document.createElement("li");
                folderItem.textContent = folderName;
                const nestedList = document.createElement("ul");
                folderItem.appendChild(nestedList);
                parentList.appendChild(folderItem);
                listFilesInFolder(prefixRef, nestedList);
            }
        });
    })
    .catch((error) => {
        console.log("Error listing files:", error);
    });
}



listFilesInFolder(storageRef, fileList);
