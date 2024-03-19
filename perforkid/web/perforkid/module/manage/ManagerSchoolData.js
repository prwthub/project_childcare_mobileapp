import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

const db = FirebaseAPI.getFirestore();

const form = document.getElementById('schoolEditForm');
form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const schoolName = currentUser.school_name;
    console.log("Form submitted");

    try {
        const db = FirebaseAPI.getFirestore();

        const schoolBannerEdit = document.getElementById('bannerInputEdit').files[0];
        const schoolImageEdit = document.getElementById('imageInputEdit').files[0];

        const schoolTitleThEdit = document.getElementById('schoolTitleThEdit').value;
        const schoolTitleEnEdit = document.getElementById('schoolTitleEnEdit').value;

        const schoolDescriptionThEdit = document.getElementById('schoolDescriptionThEdit').value;
        const schoolDescriptionEnEdit = document.getElementById('schoolDescriptionEnEdit').value;
        const schoolWebsiteEdit = document.getElementById('schoolWebsiteEdit').value;

        const body = {};

        // เช็คว่าไฟล์หรือข้อมูลที่ต้องการใช้ไม่เป็นค่าว่าง (null) ก่อนที่จะใส่ในตัวแปร body
        if (schoolTitleThEdit != "") {
            body["school-title-th"] = schoolTitleThEdit;
        }

        if (schoolTitleEnEdit != "") {
            body["school-title-en"] = schoolTitleEnEdit;
        }

        if (schoolDescriptionThEdit != "") {
            body["school-description-th"] = schoolDescriptionThEdit;
        }

        if (schoolDescriptionEnEdit != "") {
            body["school-description-en"] = schoolDescriptionEnEdit;
        }

        if (schoolWebsiteEdit != "") {
            body["school-website"] = schoolWebsiteEdit;
        }

        console.log("body: ", body);

        try {

            if (!schoolBannerEdit && !schoolImageEdit && Object.keys(body).length === 0) {
                console.log("No new image or information to update!");
                alert("No new image or information to update!");
                return;
            }


            if (schoolBannerEdit || schoolImageEdit) {
                console.log("Found new image to update!")
    
                async function uploadAndRetrieveURL(storageRef, file) {
                    const uploadTaskSnapshot = await FirebaseAPI.uploadBytes(storageRef, file);
                    const fileRef = uploadTaskSnapshot.ref;
                    const downloadURL = await FirebaseAPI.getDownloadURL(fileRef);
                    return downloadURL
                }
    
                if (schoolImageEdit) {
                    const storageRef = FirebaseAPI.ref(FirebaseAPI.storage, `school/${schoolName}/image_library/school_profile/${schoolImageEdit.name}`);
                    const schoolImageRef = await uploadAndRetrieveURL(storageRef, schoolImageEdit);
                    body["school-image"] = schoolImageRef;
                }
            
                if (schoolBannerEdit) {
                    const storageRef = FirebaseAPI.ref(FirebaseAPI.storage, `school/${schoolName}/image_library/school_profile/${schoolBannerEdit.name}`);
                    const bannerImageRef = await uploadAndRetrieveURL(storageRef, schoolBannerEdit);
                    body["school-banner"] = bannerImageRef;
                }
    
            } else {
                console.log("No new image to update!")
            }


            const schoolRef = FirebaseAPI.collection(db, 'school');
            const schoolQuerySnapshot = await FirebaseAPI.getDocs(
                FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", schoolName))
            );
    
            if (!schoolQuerySnapshot.empty) {
    
                const schoolData = schoolQuerySnapshot.docs[0];
    
                await FirebaseAPI.updateDoc(schoolData.ref, body).then(() => {
                    console.log('School Information added successfully!');
                    alert("School Information added successfully!");
                    location.reload();
                });
    
            } else {
                console.log("School document not found.");
            }

        } catch (error) {
            console.error('Error uploading image or updating school information:', error);
        }

    } catch (Exception) {
        console.log(Exception);
    }
});

