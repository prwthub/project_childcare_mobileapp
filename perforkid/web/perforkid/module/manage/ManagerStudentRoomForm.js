import currentUser from "./currentUser.js";
//import * as FirebaseAPI from "./FirebaseAPI/FirebaseAPI.js";
import {
    firebaseConfig, app, storage, ref, listAll, getMetadata, getDownloadURL, getFirestore, collection,
    addDoc, uploadBytes, getDocs, setDoc, query, where, getAuth, signInWithEmailAndPassword, signOut,
    createUserWithEmailAndPassword, doc
} from "./FirebaseAPI/FirebaseAPI.js";

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

const uploadButton = document.getElementById('studentRoomForm');
uploadButton.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Student Form Submit Button clicked");
    const fileInput = document.getElementById('SubmitStudentFormBtn');
    const xlsxfile = fileInput.files[0];
    if (xlsxfile) {
        upload(xlsxfile, room);
    } else {
        alert("Please select a file.");
    }
});

// upload Form 1
// Function to upload an .xlsx file to Firebase Storage and then Firestore
function upload(file) {
    console.log("Upload function entered.")
    var school = currentUser.school_name;
    const newfileName =
        file.name.replace(/\.[^/.]+$/, "") + room + file.name.match(/\..+$/);

    const storageRef = ref(storage, school + "/test/" + newfileName);
    const firestore = firebase.firestore();
    const reader = new FileReader();

    reader.onload = function (e) {
        // Upload .xlsx file to Firebase Storage
        uploadBytes(storageRef, file)
          .then((result) => {
            alert("Upload to storage successful! (2)");
    
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
              .where("school-name", "==", school) // ใช้ "school-name" แทน "name"
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((schoolDoc) => {
                  // เข้าไปยัง sub collection 'student' ในเอกสารของโรงเรียน
                  const studentRef = schoolDoc.ref.collection("student");
    
                  // Query เอกสารที่มี field 'room' เป็น '1/1'
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
                            alert("Upload to Firestore successful! (4)");
                          })
                          .catch((error) => {
                            console.error("Error deleting documents in subcollection:", error);
                            alert("Error deleting documents in subcollection");
                          });
                      });
                    })
                    .catch((error) => {
                      console.error("Error getting student documents:", error);
                      alert("Error getting student documents");
                    });
                });
              })
              .catch((error) => {
                console.error("Error getting school documents:", error);
                alert("Error getting school documents");
              });
          })
          .catch((err) => {
            console.error("Upload to storage failed:", err);
            alert("Upload to storage failed (5)");
          });
      };
      reader.readAsArrayBuffer(file);
    }
