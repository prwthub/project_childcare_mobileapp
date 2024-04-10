import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  getStorage,
  getDownloadURL,
  ref,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

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
const db = getFirestore(app);

// Import currentUser
import currentUser from "../user/currentUser.js";

// ในส่วนนี้คือการดึง currentUser จาก sessionStorage
const storedUser = sessionStorage.getItem("currentUser");

if (storedUser) {
  // แปลง JSON ที่ถูกเก็บไว้ใน sessionStorage กลับเป็น Object
  const storedCurrentUser = JSON.parse(storedUser);

  // ตั้งค่าค่า email และ school_name จาก storedCurrentUser
  currentUser.email = storedCurrentUser.email;
  currentUser.school_name = storedCurrentUser.school_name;
  currentUser.loggedin = storedCurrentUser.loggedin;
}


async function deleteVan() {
    var vanNum = document.getElementById("vanDetail").textContent;
    console.log("delete vanNum = ",vanNum);

    





    // delete doc from firestore database
    const schoolRef = collection(db, "school");
    const schoolQuery = query(
        schoolRef,
        where("school-name", "==", currentUser.school_name)
    );

    // สร้าง array ไว้อ้างอิงลบใน all
    let refsToDelete = [];

    const schoolQuerySnapshot = await getDocs(schoolQuery);

    schoolQuerySnapshot.forEach(async (schoolDoc) => {
        schoolQuerySnapshot.forEach((schoolDoc) => {
          const studentRef = collection(schoolDoc.ref, "car");
          const studentQuery = query(
            studentRef,
            where("car-number", "==", `${vanNum}`)
          );

          onSnapshot(studentQuery, (studentQuerySnapshot) => {
            studentQuerySnapshot.forEach(async (studentDoc) => {
              // Delete sub-collection documents
              const subCollectionRef = collection(studentDoc.ref, "student-car");
              const subCollectionSnapshot = await getDocs(subCollectionRef);
    
              subCollectionSnapshot.forEach(async (subDoc) => {
                // เอาใส่ใน array
                let data = subDoc.data();
                refsToDelete.push(data);
    
                await deleteDoc(subDoc.ref)
                  .then(() => {
                    console.log("Sub-document deleted successfully");
                  })
                  .catch((error) => {
                    console.error("Error deleting sub-document: ", error);
                  });
              });
    
              console.log("refsToDelete = ");
              console.log(refsToDelete);
    
              // Delete the main document
              deleteDoc(studentDoc.ref)
                .then(() => {
                  console.log("Document deleted successfully");
    
                  // Delete file from storage
                  // Get a reference to the file to be deleted from storage
                  const storage = getStorage(app);
                  const storageRef = ref(
                    storage,
                    `school/${currentUser.school_name}/form_car/form_car_${vanNum}.xlsx`
                  );
    
                  // Check if the file exists before trying to delete it
                  getDownloadURL(storageRef)
                    .then((url) => {
                      // File exists, so proceed with deletion
                      deleteObject(storageRef)
                        .then(() => {
                          console.log("File deleted successfully");
                          // window.location.href = "../../Panel4Student.html";
                        })
                        .catch((error) => {
                          console.error("Error deleting file: ", error);
                        });
                    })
                    .catch((error) => {
                      // File does not exist, do nothing or handle accordingly
                      console.error("Error getting download URL: ", error);
    
                      // Handle the case where the file doesn't exist, for example:
                      if (error.code === "storage/object-not-found") {
                        console.log(
                          "File does not exist. Skip deletion or handle accordingly."
                        );
                      } else {
                        // Handle other errors as needed
                        console.error("Unexpected error: ", error);
                      }
                    });
                })
                .then(() => {
                  alert(
                    "กรุณารอสักครู่ เมื่อระบบลบเสร็จสิ้นจะทำการกลับไปหน้าหลักอัตโนมัติ"
                  );
                })
                .catch((error) => {
                  console.error("Error deleting document: ", error);
                });
            });
          });
        });
      });


      schoolQuerySnapshot.forEach(async (schoolDoc) => {
        const studentRef = collection(schoolDoc.ref, "car");
        const studentQuery = query(
          studentRef,
          where("car-number", "==", "all")
        );
      
        const studentQuerySnapshot = await getDocs(studentQuery);
      
        studentQuerySnapshot.forEach(async (studentDoc) => {
          const studentListRef = collection(studentDoc.ref, "student-car");
          const studentListSnapshot = await getDocs(studentListRef);
      
          function objectsAreEqual(objA, objB) {
            const keysA = Object.keys(objA);
            const keysB = Object.keys(objB);
      
            if (keysA.length !== keysB.length) {
              return false;
            }
      
            for (let key of keysA) {
              if (objA[key] !== objB[key]) {
                return false;
              }
            }
      
            return true;
          }
      
          studentListSnapshot.forEach((listDoc) => {
            let data = listDoc.data();
          
            if (refsToDelete.some(item => item["student-ID"] == data["student-ID"])) {
              deleteDoc(listDoc.ref)
                .then(() => {
                  console.log('Deleted:', data);
                })
                .catch((error) => {
                  console.error('Error deleting document:', error);
                });
            }
          });
        });
      });
      
    
    
      setTimeout(() => {
        window.location.href = '../../Panel5StudentVan.html';
      }, 10000);


}

document.addEventListener("DOMContentLoaded", (event) => {
  const addButton = document.getElementById("deleteVan");
  addButton.addEventListener("click", deleteVan);
});
// var vanName = document.getElementById("vanDetail").textContent;

// console.log("delete vanNum = ",vanNum);