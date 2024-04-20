import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// ================================================================================================================
// upload Driver form
// Function to upload an .xlsx file to Firebase Storage and then Firestore
function upload(file) {
  var school = currentUser.school_name;
  const storageRef = ref(
    storage,
    "school/" + school + "/form_driver/" + file.name
  );
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
            // Step 3: Upload JSON data to Firestore
            const collectionRef = firestore.collection("school");

            // Query Firestore to find the school document with name "KMUTNB"
            collectionRef
              .where("school-name", "==", school)
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((schoolDoc) => {
                  // เข้าไปยัง sub collection 'driver' ในเอกสารของโรงเรียน
                  const driverRef = schoolDoc.ref.collection("driver");

                  // ลบข้อมูลที่อยู่ใน sub collection 'driver'
                  driverRef.get().then((driverSnapshot) => {
                    driverSnapshot.forEach((driverDoc) => {
                      // ใช้ doc(id).delete() เพื่อลบเอกสาร
                      driverRef.doc(driverDoc.id).delete();
                    });

                    // อัปโหลดข้อมูลจาก JSON ไปยัง sub collection 'driver'
                    jsonData.forEach((item) => {
                      driverRef.add(item);
                    });

                    // เพิ่มฟิลด์ "latest-driver-update" ในเอกสารโรงเรียน
                    schoolDoc.ref.update({
                      "latest-driver-update": moment().format(
                        "MMMM Do YYYY, h:mm:ss a"
                      ),
                    });

                    console.log("Data uploaded to Firestore successfully!");
                    //alert("Upload to Firestore successful! (4)");
                    alert(
                      "เพิ่มข้อมูลสำเร็จแล้ว! กรุณารอสักครู่ระบบจะทำการรีเฟรชหน้าจออัตโนมัติ"
                    );
                  });
                });
              })
              .catch((error) => {
                console.error("Error getting school documents:", error);
                //alert("Error getting school documents");
                alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
              });

            setTimeout(() => {
              window.location.href = "../../Panel3Driver.html";
            }, 10000);
          } else {
            console.error("Data is invalid");
            const invalidDataMsg = result.invalidData.join(", ");
            alert(
              `ข้อมูลลำดับที่ ${invalidDataMsg} ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง`
            );
          }
        });
      })
      .catch((err) => {
        console.error("Upload to storage failed:", err);
        //alert("Upload to storage failed (5)");
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      });
  };
  reader.readAsArrayBuffer(file);
}

// // Event listener for the file input
// const uploadForm = document.getElementById("uploadDriverForm");
// uploadForm.addEventListener("change", (e) => {
//   const xlsxfile = e.target.files[0];
//   // Check if the uploaded file is an .xlsx file and has the correct name
//   if (xlsxfile && xlsxfile.name.endsWith(".xlsx")
//   && xlsxfile.name.startsWith("form_driver")) {
//     upload(xlsxfile);
//   } else {
//     alert("Please upload a valid file named 'form_driver.xlsx'.");
//   }
// });

async function fetchLatestDriverUpdate() {
  const db = getFirestore();
  const schoolRef = collection(db, "school");
  const querySnapshot = await getDocs(
    query(schoolRef, where("school-name", "==", currentUser.school_name))
  );

  let date = null;

  querySnapshot.forEach((schoolDoc) => {
    // ดึงข้อมูล field "latest-driver-update" จากเอกสาร
    const data = schoolDoc.data();
    const latestDriverUpdate = data["latest-driver-update"];
    if (latestDriverUpdate) {
      date = latestDriverUpdate;
    } else {
      date = "ยังไม่มีประวัติการอัพเดทล่าสุด";
    }
  });

  return date;
}

// Event listener for the file input
const uploadForm = document.getElementById("uploadForm");
uploadForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const fileInput = document.getElementById("uploadDriverForm");
  const xlsxfile = fileInput.files[0];
  // Check if the uploaded file is an .xlsx file and has the correct name
  if (
    xlsxfile &&
    xlsxfile.name.endsWith(".xlsx") &&
    xlsxfile.name.startsWith("form_driver")
  ) {
    upload(xlsxfile);
  } else {
    //alert("Please upload a valid file named 'form_driver.xlsx'.");
    alert("กรุณาอัปโหลด ไฟล์ชื่อ form_driver.xlsx เท่านั้น");
  }
});

// for latest driver update
const latestDriverUpdate = await fetchLatestDriverUpdate();
const latestDriverUpdateElement = document.getElementById("latestDriverUpdate");
if (latestDriverUpdateElement) {
  latestDriverUpdateElement.innerText =
    "( Latest Driver Update: " + latestDriverUpdate + " )";
} else {
  latestDriverUpdateElement.innerText =
    "( Latest Driver Update: No upload history found. )";
}

async function validateForm(jsonData) {
  let response = await fetch(
    "https://perforkid.azurewebsites.net/web/validateForm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: [
          "index",
          "driver-ID",
          "name-surname",
          "car-number",
          "phone",
          "email",
          "address",
        ],
        data: jsonData,
      }),
    }
  );

  let data = await response.json();

  if (data.success) {
    console.log("Validation successful");
    return true;
  } else {
    console.error("Validation failed");
    return { success: false, invalidData: data.invalidData };
  }
}
