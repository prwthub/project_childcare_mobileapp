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

// ================================================================================================================
const fileList = document.getElementById("fileList");
const foldername = fileList.getAttribute("folder");
var folderPath = `school/${currentUser.school_name}/${foldername}/`; 


var filename = "";

console.log('DOMContentLoaded event triggered');
const paramsVan = new URLSearchParams(window.location.search);
const vanNum = paramsVan.get('vanNum');
const paramsRoom = new URLSearchParams(window.location.search);
const roomNum = paramsRoom.get('room');


if (vanNum) {
    // ถ้า vanNum มีค่า
    filename = `form_car_${vanNum}.xlsx`;
    console.log("van : ",vanNum);
    console.log(filename);
    console.log(folderPath);
} else if (roomNum) {
    // ถ้า roomNum มีค่า
    let [front, back] = roomNum.split('/');
    folderPath = `school/${currentUser.school_name}/${foldername}/year${front}/`;
    filename = `form_student_${front}-${back}.xlsx`;
    console.log("room : ",roomNum);
    console.log(filename);
    console.log(folderPath);
} else {
    // ถ้า vanNum ไม่มีค่าหรือเป็นค่า null หรือ undefined
    filename = "";
    console.log("no van");
    console.log(filename);
    console.log(folderPath);
}

const storageRef = ref(storage, folderPath);

function listFilesInFolder(folderRef, parentList) {
  listAll(folderRef)
    .then((res) => {
      res.items.forEach((itemRef) => {
        getMetadata(itemRef)
          .then((metadata) => {
            if (metadata && metadata.name) {
                if(vanNum){
                    // ตรวจสอบชื่อไฟล์ที่ต้องการแสดง
                    if (metadata.name == filename) {
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
                }else if(roomNum){
                    let [front, back] = roomNum.split('/');
                    // ตรวจสอบชื่อไฟล์ที่ต้องการแสดง
                    if (metadata.name == filename) {
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
                }else{
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

listFilesInFolder(storageRef, fileList);
