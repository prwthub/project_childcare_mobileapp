import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getStorage, ref, uploadBytes, } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import {getFirestore, collection, updateDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {getDownloadURL} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
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
  const fileTable = document.getElementById('SubmitStudentTableBtn');

  if (fileInput.files.length > 0 && fileTable.files.length > 0) {
    alert("ไม่สามารถอัปโหลดไฟล์ทั้งสองได้ในคราวเดียว กรุณาอัปโหลดไฟล์แยกกัน");
    return;
  }

  if (fileInput.files.length > 0) {
    const xlsxfile = fileInput.files[0];
    if ((xlsxfile && xlsxfile.name.endsWith(".xlsx")) && xlsxfile.name.startsWith(`form_student_${front}-${back}`)) {
      upload(xlsxfile, room);
    } else {
      //alert(`Please select form_student_${front}-${back}.xlsx file.`);
      alert(`กรุณาอัปโหลด ไฟล์ชื่อ form_student_${front}-${back}.xlsx เท่านั้น`);
    }
  }

  if (fileTable.files.length > 0) {
    const jpgfile = fileTable.files[0];
    if ((jpgfile && jpgfile.name.endsWith(".jpg")) && jpgfile.name.startsWith(`student_${front}-${back}`)) {
      uploadTable(jpgfile, room);
    } else {
      //alert(`Please select student_${front}-${back}.xlsx file.`);
      alert(`กรุณาอัปโหลด ไฟล์ชื่อ student_${front}-${back}.jpg เท่านั้น`);
    }
  }
});



async function fetchLatestStudentUpdate(room, currentUser) {
  const db = getFirestore();
  const schoolRef = collection(db, 'school');
  const querySnapshots = await getDocs(query(schoolRef, where('school-name', '==', currentUser.school_name)));

  let result = null;

  if (!querySnapshots.empty) {
    const schoolDoc = querySnapshots.docs[0]; // Get the document object
    const schoolDocRef = schoolDoc.ref; // Extract document reference
    
    // Now schoolDocRef should be a DocumentReference
    const studentRef = collection(schoolDocRef, 'student');
    const studentQuerySnapshot = await getDocs(query(studentRef, where('room', '==', room)));

    studentQuerySnapshot.forEach((studentDoc) => {
      const data = studentDoc.data();
      const latestStudentUpdate = data["latest-student-update"];
      if (latestStudentUpdate != null) {
        result = latestStudentUpdate;
      } else {
        result = "ยังไม่มีประวัติการอัพเดทล่าสุด";
      }
    });
  }

  return result; 
}






// for latest student update
const latestStudentUpdate = await fetchLatestStudentUpdate(room, currentUser);
const latestStudentUpdateElement = document.getElementById("latestStudentUpdate");
if (latestStudentUpdateElement) {
  latestStudentUpdateElement.innerText = "( Latest student Update: " + latestStudentUpdate + " )"
} else {
  latestStudentUpdateElement.innerText = "( Latest student Update: No upload history found. )"
}








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

        validateForm(jsonData).then((result) => {
          if (result === true) {
            console.log("Data is valid");
          } else {
            console.error("Data is invalid");
            console.error(result.invalidData);
            alert("ข้อมูลลำดับที่ : ", result.invalidData, " ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง");
            return;
          }
        });

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

              // สร้าง array ไว้อ้างอิงลบใน all
              let refsToDelete = [];

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
                          // เอาใส่ใน array
                          let data = listDoc.data();
                          refsToDelete.push(data);
                          //console.log(listDoc.data());

                          // ลบข้อมูลที่อยู่ใน sub collection 'student-list'
                          listDoc.ref.delete();
                        });

                        console.log("refsToDelete = ");
                        console.log(refsToDelete);

                        // อัปโหลดข้อมูลจาก JSON ไปยัง 'student-list'
                        jsonData.forEach((item) => {
                          studentListRef.add(item);
                        });

                        studentDoc.ref.update({
                          "latest-student-update": moment().format("MMMM Do YYYY, h:mm:ss a"),
                          "update": true
                        });                        

                        console.log("Data uploaded to Firestore successfully!");
                        // alert("Upload to Firestore successful! (4)");
                        //alert("เพิ่มข้อมูลสำเร็จแล้ว!");
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


              // Query เอกสารที่มี field 'room' เป็น all
              studentRef
                .where("room", "==", "all")
                .get()
                .then((studentSnapshot) => {
                  if (studentSnapshot.empty) {
                    // ถ้าไม่มีเอกสารที่มี field 'room' เป็น 'all', ให้สร้างเอกสารใหม่
                    studentRef.add({ "room": "all" })
                      .then((newStudentDoc) => {
                        const studentListRef = newStudentDoc.collection("student-list");
                        // อัปโหลดข้อมูลจาก JSON ไปยัง 'student-list'
                        jsonData.forEach((item) => {
                          //item.name = "student";
                          studentListRef.add(item);
                        });
                        console.log("New document created and data uploaded to Firestore successfully!");
                        //alert("เพิ่มข้อมูลสำเร็จแล้ว!");
                      })
                      .catch((error) => {
                        console.error("Error creating new document:", error);
                        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
                      });
                  } else {
                    // ถ้ามีเอกสารที่มี field 'room' เป็น 'all'
                    studentSnapshot.forEach((studentDoc) => {
                      const studentListRef = studentDoc.ref.collection("student-list");
                      studentListRef.get()
                        .then((studentListSnapshot) => {


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

                          // ใช้ objectsAreEqual ในโค้ดของคุณ
                          studentListSnapshot.forEach((listDoc) => {
                            let data = listDoc.data();

                            if (refsToDelete.some(item => item["student-ID"] == data["student-ID"])) {
                              listDoc.ref.delete()
                                .then(() => {
                                  console.log('Deleted:', data);
                                })
                                .catch((error) => {
                                  console.error('Error deleting document:', error);
                                });
                            }
                          });

                          // อัปโหลดข้อมูลจาก JSON ไปยัง 'student-list'
                          jsonData.forEach((item) => {
                            studentListRef.add(item);
                          });

                          studentDoc.ref.update({
                            "latest-student-update": moment().format("MMMM Do YYYY, h:mm:ss a"),
                          });  

                          console.log("Data uploaded to Firestore successfully!");
                          alert("เพิ่มข้อมูลสำเร็จแล้ว! อีกสักครู่ระบบจะทำการรีเฟรชหน้าจออัตโนมัติ");
                        }).then(()=>{
                          //location.reload();
                        })
                        .catch((error) => {
                          console.error("Error deleting documents in subcollection:", error);
                          alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
                        });
                    });
                  }
                })
                .catch((error) => {
                  console.error("Error getting student documents:", error);
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


  setTimeout(() => {
    window.location.reload();
  }, 20000);

}




// Function to upload an .jpg file to Firebase Storage 
async function uploadTable(file, roomNumber) {
  console.log("Upload table function entered.");
  var school = currentUser.school_name;
  // สร้างชื่อไฟล์ใหม่โดยใช้ template literals
  let newFileNameFormatted = `student_${front}-${back}.jpg`;
  // สร้าง storage reference
  const storageRef = ref(storage, `school/${school}/form_student_table/year${front}/${newFileNameFormatted}`);

  // ตรวจสอบว่ามีไฟล์ที่ถูกเลือกหรือไม่
  if (file) {
    // อัปโหลดไฟล์ไปยัง Firebase Storage
    uploadBytes(storageRef, file).then((snapshot) => {
      console.log('File uploaded successfully');
      alert("อัปโหลดไฟล์สำเร็จแล้ว! อีกสักครู่ระบบจะทำการรีเฟรชหน้าจออัตโนมัติ");


      // เพิ่มโค้ดเพิ่มเติมที่ต้องการทำหลังจากอัปโหลดไฟล์สำเร็จ
    }).catch((error) => {
      console.error('Error uploading file: ', error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
      // เพิ่มการจัดการข้อผิดพลาดในการอัปโหลดไฟล์
    });
  } else {
    console.error('No file selected');
    // เพิ่มการจัดการเมื่อไม่มีไฟล์ที่ถูกเลือก
  }
  
  // ส่วนอัพโหลดลิ้งค์รูปจาก Storage มา Firestore ตามเงื่อนไข
  const db = getFirestore();
  const schoolName = currentUser.school_name;
  const schoolRef = collection(db, 'school');

  const schoolQuerySnapshot = await getDocs(query(schoolRef, where("school-name", "==", schoolName)));
  if (!schoolQuerySnapshot.empty) {
    console.log('schoolQuerySnapshot is not empty!', schoolQuerySnapshot)
    const schoolDocument = schoolQuerySnapshot.docs[0];
    const RoomRef = collection(schoolDocument.ref, 'student');
    const StudentRoomQuerySnapShot = await getDocs(query(RoomRef, where("room", "==", roomNumber)));
    if (!StudentRoomQuerySnapShot.empty) {
      const studentDocument = StudentRoomQuerySnapShot.docs[0];
      const schedule = await getDownloadURL(storageRef);
      await updateDoc(studentDocument.ref, 
        {
          schedule: schedule
        }
      );
      alert("อัปโหลดไฟล์สำเร็จแล้ว! อีกสักครู่ระบบจะทำการรีเฟรชหน้าจออัตโนมัติ");
  }
}

setTimeout(() => {
  window.location.reload();
}, 3000);

}





async function validateForm(jsonData) {
  let response = await fetch('https://perforkid.azurewebsites.net/web/validateForm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "fields": [
                  "index",
                  "student-ID",
                  "name-surnames",
                  "class-rooms",
                  "father-names",
                  "father-phones",
                  "father-emails",
                  "mother-names",
                  "mother-phones",
                  "mother-emails",
                  "address"
                ],
      "data": jsonData
    })
  });

  let data = await response.json();

  if (data.success) {
    console.log("Validation successful");
    return true;
  } else {
    console.error("Validation failed");
    return { success: false, invalidData: data.invalidData };
  }
}