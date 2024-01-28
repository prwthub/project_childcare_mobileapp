import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

const db = FirebaseAPI.getFirestore();


// ดึงข้อมูลโรงเรียนปัจจุบันมาแสดง (ใช้งานได้)
async function loadSchoolInfo() {
    const schoolRef = FirebaseAPI.collection(db, 'school');
    const query = FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", currentUser.school_name));
    const schoolQuerySnapshot = await FirebaseAPI.getDocs(query);

    if (!schoolQuerySnapshot.empty) {
        for (const schoolDoc of schoolQuerySnapshot.docs) {
            const schoolData = schoolDoc.data();

            const schoolBannerElement = document.getElementById('schoolBanner');
            schoolBannerElement.innerHTML = `<img src="${schoolData['school-banner']}" alt="Banner Image">`;

            const schoolImageElement = document.getElementById('schoolImage');
            schoolImageElement.innerHTML = `<img src="${schoolData['school-image']}" alt="School Profile Image">`;

            document.getElementById('schoolNameInitial').textContent = schoolData['school-name'];
            document.getElementById('schoolTitleTh').textContent = schoolData['school-title-th'];
            document.getElementById('schoolTitleEn').textContent = schoolData['school-title-en'];
            document.getElementById('schoolDescriptionTh').textContent = schoolData['school-description-th'];
            document.getElementById('schoolDescriptionEn').textContent = schoolData['school-description-en'];
            document.getElementById('schoolWebsite').textContent = schoolData['school-website'];
        }
    } else {
        console.log('No School found!');
    }
}

// ดึงข้อมูลมาเข้าช่องกรอกแก้ไข (ใช้งานได้)
async function editSchoolInfo() {
    try {

        const editOverlay = document.getElementById('editOverlay');
        editOverlay.style.display = 'block';
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        document.getElementById('imagePreviewEdit').innerHTML = document.getElementById('schoolImage').innerHTML;
        document.getElementById('bannerPreviewEdit').innerHTML = document.getElementById('schoolBanner').innerHTML;
        document.getElementById('schoolTitleThEdit').value = document.getElementById('schoolTitleTh').textContent;
        document.getElementById('schoolTitleEnEdit').value = document.getElementById('schoolTitleEn').textContent
        document.getElementById('schoolDescriptionThEdit').value = document.getElementById('schoolDescriptionTh').textContent
        document.getElementById('schoolDescriptionEnEdit').value = document.getElementById('schoolDescriptionEn').textContent
        document.getElementById('schoolWebsiteEdit').value = document.getElementById('schoolWebsite').textContent

    } catch (Exception) {
        console.log(Exception);
    }
}

// อัพเดทข้อมูลลง Firestore + Storage (ใช้งานได้)
async function submitSchoolInfo() {
    console.log("You clicked submit form!")
    const bannerImage = document.getElementById('bannerInputEdit').files[0];
    const schoolImage = document.getElementById('imageInputEdit').files[0];
    const schoolName = currentUser.school_name;
    const schoolTitleTh = document.getElementById('schoolTitleThEdit').value;
    const schoolTitleEn = document.getElementById('schoolTitleEnEdit').value;
    const schoolDescriptionTh = document.getElementById('schoolDescriptionThEdit').value;
    const schoolDescriptionEn = document.getElementById('schoolDescriptionEnEdit').value;
    const schoolWebsite = document.getElementById('schoolWebsiteEdit').value;
    const db = FirebaseAPI.getFirestore();

    const body = {
        "school-name": schoolName,
        "school-title-th": schoolTitleTh,
        "school-title-en": schoolTitleEn,
        "school-description-th": schoolDescriptionTh,
        "school-description-en": schoolDescriptionEn,
        "school-website": schoolWebsite
    }

    try {

        if (bannerImage || schoolImage) {
            console.log("Found new image to update!")
            const storageRef = FirebaseAPI.ref(FirebaseAPI.storage, `school/${schoolName}/image_library/school_profile`);

            async function uploadAndRetrieveURL(storageRef, file) {
                const uploadTaskSnapshot = await FirebaseAPI.uploadBytes(storageRef, file);
                const fileRef = uploadTaskSnapshot.ref;
                const downloadURL = await FirebaseAPI.getDownloadURL(fileRef);
                return downloadURL
            }

            if (schoolImage) {
                const schoolImageRef = await uploadAndRetrieveURL(storageRef, schoolImage);
                body["school-image"] = schoolImageRef;
            }
            
            if (bannerImage) {
                const bannerImageRef = await uploadAndRetrieveURL(storageRef, bannerImage);
                body["school-banner"] = bannerImageRef;
            }

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
            });

        } else {
            console.log("School document not found.");
        }
    } catch (error) {
        console.error('Error uploading image or updating school information:', error);
    }
}

// รีเซ็ต Form (ใช้งานได้)
function cancelSchoolInfoChange() {
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const schoolForm = document.getElementById('schoolEditForm');
    editOverlay.style.display = 'none';
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    cancelAddBtn.addEventListener('click', function () {
        schoolForm.reset();
    });
}

// พรีวิวรูปที่จะบันทึก (ใช้งานได้)
function setupImagePreview(inputId, previewId, formId) {
    const imageInput = document.getElementById(inputId);
    const imagePreview = document.getElementById(previewId);
    const form = document.getElementById(formId);

    // Add event listener for file input change
    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.className = 'img-fluid';
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
        }

        reader.readAsDataURL(file);
    });

    // Add event listener for form reset
    form.addEventListener('reset', function () {
        imagePreview.innerHTML = '';
    });
}

async function testfunc() {
    console.log("Async, It does works wonder");
}

export { loadSchoolInfo, editSchoolInfo, submitSchoolInfo, setupImagePreview, cancelSchoolInfoChange, testfunc };
