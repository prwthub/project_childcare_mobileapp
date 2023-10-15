import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {getStorage,ref,uploadBytes,} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import {getFirestore,collection,addDoc,} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
const db = getFirestore(app);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Import currentUser
import currentUser from '../user/currentUser.js';

// ในส่วนนี้คือการดึง currentUser จาก sessionStorage
const storedUser = sessionStorage.getItem('currentUser');

if (storedUser) {
    // แปลง JSON ที่ถูกเก็บไว้ใน sessionStorage กลับเป็น Object
    const storedCurrentUser = JSON.parse(storedUser);

    // ตั้งค่าค่า email และ school_name จาก storedCurrentUser
    currentUser.email = storedCurrentUser.email;
    currentUser.school_name = storedCurrentUser.school_name;
    currentUser.loggedin = storedCurrentUser.loggedin;
}

// ================================================================================================================

// Define room in a scope both functions can access

console.log('DOMContentLoaded event triggered');
const params = new URLSearchParams(window.location.search);
const room = params.get('room');

// Now you have the selected room, you can use it as needed in this page.
console.log(`Selected room: ` + room);
document.title = "Student room " + room;

// แยกข้อมูลห้องเป็นส่วนหน้าและหลัง
let [front, back] = room.split('/');


const uploadButton = document.getElementById('studentRoomForm');
uploadButton.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Student Form Submit Button clicked");
    const fileInput = document.getElementById('SubmitStudentFormBtn');
    const xlsxfile = fileInput.files[0];
    if ((xlsxfile && xlsxfile.name.endsWith(".xlsx")) && 
    xlsxfile.name.startsWith(`form_student_${front}-${back}`)) {
        upload(xlsxfile, room);
    } else {
        //alert(`Please select form_student_${front}-${back}.xlsx file.`);
        alert(`กรุณาอัปโหลด ไฟล์ชื่อ form_student_${front}-${back}.xlsx เท่านั้น`);
    }
});

// upload Form 1
// Function to upload an .xlsx file to Firebase Storage and then Firestore
function upload(file) {
    console.log("Upload function entered.")
    var school = currentUser.school_name;
    // สร้างชื่อไฟล์ใหม่โดยใช้ template literals
    let newFileNameFormatted = `form_student_${front}-${back}.xlsx`;
    // สร้าง storage reference
    const storageRef = ref(storage, `school/${school}/form_student/year${front}/${newFileNameFormatted}`);
    const firestore = firebase.firestore();
    const reader = new FileReader();

    reader.onload = function (e) {
        // Upload .xlsx file to Firebase Storage
        uploadBytes(storageRef, file)
          .then((result) => {
            //alert("Upload to storage successful! (2)");
            alert("กรุณารอสักครู่ กำลังเพิ่มข้อมูลเข้าสู่ระบบ . . .");

            // Step 2: After successful upload, convert to .json
            const xlsxData = e.target.result;
            const workbook = XLSX.read(xlsxData, { type: "array" });
            const jsonData = XLSX.utils.sheet_to_json(
              workbook.Sheets[workbook.SheetNames[0]]
            );
    
            // Step 3: Upload JSON data to Firestore
            const collectionRef = firestore.collection("school"); 
            
            // Query Firestore to find the school document with name "KMUTNB"
            collectionRef
              .where("school-name", "==", school)
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((schoolDoc) => {
                  // เข้าไปยัง sub collection 'student' ในเอกสารของโรงเรียน
                  const studentRef = schoolDoc.ref.collection("student");
    
                  // Query เอกสารที่มี field 'room' เป็น ...
                  studentRef
                    .where("room", "==", room)
                    .get()
                    .then((studentSnapshot) => {
                      studentSnapshot.forEach((studentDoc) => {
                        // สร้าง sub collection 'student-list' และลบข้อมูลที่อยู่ใน 'student-list'
                        const studentListRef = studentDoc.ref.collection("student-list");
    
                        studentListRef
                          .get()
                          .then((studentListSnapshot) => {
                            studentListSnapshot.forEach((listDoc) => {
                              // ลบข้อมูลที่อยู่ใน sub collection 'student-list'
                              listDoc.ref.delete();
                            });
    
                            // อัปโหลดข้อมูลจาก JSON ไปยัง 'student-list'
                            jsonData.forEach((item) => {
                              studentListRef.add(item);
                            });
    
                            console.log("Data uploaded to Firestore successfully!");
                            // alert("Upload to Firestore successful! (4)");
                            alert("เพิ่มข้อมูลสำเร็จแล้ว!");
                          })
                          .catch((error) => {
                            console.error("Error deleting documents in subcollection:", error);
                            // alert("Error deleting documents in subcollection");
                            alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
                          });
                      });
                    })
                    .catch((error) => {
                      console.error("Error getting student documents:", error);
                      // alert("Error getting student documents");
                      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
                    });
                });
              })
              .catch((error) => {
                console.error("Error getting school documents:", error);
                // alert("Error getting school documents");
                alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
              });
          })
          .catch((err) => {
            console.error("Upload to storage failed:", err);
            // alert("Upload to storage failed (5)");
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
          });
      };
      reader.readAsArrayBuffer(file);
    }
