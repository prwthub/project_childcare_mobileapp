import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

const cancelAddBtn = document.getElementById('cancelAddBtn');
const addPostStartBtn = document.getElementById('addPostStartBtn');
const addOverlay = document.getElementById('addOverlay');
const announcementForm = document.getElementById('announcementFormAdd');

cancelAddBtn.addEventListener('click', function () {
    addOverlay.style.display = 'none';
    addPostStartBtn.style.display = 'block';
    announcementForm.reset();
});

addPostStartBtn.addEventListener('click', function () {
    addOverlay.style.display = 'block';
    addPostStartBtn.style.display = 'none';
    announcementForm.reset();
});

const submitFormFirst = document.getElementById('submitAddBtn');
// submitFormFirst.addEventListener('click', function (e) {
//     const submitConfirm = confirm("Please check the integrity of the content, proceed?");
//     if (!submitConfirm) {
//         e.preventDefault(); // Prevents the form from submitting if user cancels
//     } else {
//       submitAnnouncement();
//     }
// });

submitFormFirst.addEventListener('click', function (e) {
    const postHeader = document.getElementById('postHeaderAdd').value;
    const postContent = document.getElementById('postContentAdd').value;
    const confirmSubmit = confirm("โปรดตรวจสอบความสมบูรณ์ของเนื้อหา ดำเนินการต่อหรือไม่");
    if (confirmSubmit) {
        if (!postHeader || !postContent) {
            e.preventDefault(); // Prevent form submission
            alert('กรุณากรอกข้อมูลให้ครบทั้งส่วนหัวเรื่องและเนื้อหา'); // Provide a message to the user
        } else {
            submitAnnouncement();
        }}
    });


export async function submitAnnouncement() {

    const postHeader = document.getElementById('postHeaderAdd').value;
    const postContent = document.getElementById('postContentAdd').value;
    const schoolName = currentUser.school_name;

    const file = document.getElementById('imageInputAdd').files[0];
    const db = FirebaseAPI.getFirestore();

    try {
        let image = null;
        if (file) {
            const storageRef = FirebaseAPI.ref(FirebaseAPI.storage, `school/${schoolName}/announcementPost/${file.name}`);
            await FirebaseAPI.uploadBytes(storageRef, file);
            image = await FirebaseAPI.getDownloadURL(storageRef);
        }

        const schoolRef = FirebaseAPI.collection(db, 'school');
        const schoolQuerySnapshot = await FirebaseAPI.getDocs(
            FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", schoolName))
        );

        if (!schoolQuerySnapshot.empty) {
            const schoolDocument = schoolQuerySnapshot.docs[0];
            const announcementRef = FirebaseAPI.collection(schoolDocument.ref, 'announcement');

            await FirebaseAPI.addDoc(announcementRef, {
                header: postHeader,
                content: postContent,
                date: new Date(),
                image: image,
                editStatus: "N"
            }).then(()=>{
                location.reload();
            });
            console.log('เพิ่มประกาศเรียบร้อยแล้ว!');
            window.alert('เพิ่มประกาศเรียบร้อยแล้ว!');
            document.getElementById('announcementForm').reset();
            document.getElementById('imagePreviewAdd').innerHTML = '';
        } else {
            console.log("School document not found.");
        }
    } catch (error) {
        console.error('Error uploading image or adding announcement:', error);
    }
}
