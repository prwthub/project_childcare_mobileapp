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
        console.log('No matching documents found in the "school" collection.');
    }
}

// ดึงข้อมูลมาเข้าช่องกรอก (เหมือน Announcement Edit Post) (ยังไม่สำเร็จ)
async function editSchoolInfo() { 
    try {
        const file = document.getElementById('imageInputEdit').files[0];
        const hasNewImage = !!file;

        const schoolName = currentUser.school_name;
        const schoolRef = FirebaseAPI.collection(db, 'school');

        console.log("School Edit button submit clicked");
        const query = FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", currentUser.school_name));
        const schoolQuerySnapshot = await FirebaseAPI.getDocs(query);

        if (!schoolQuerySnapshot.empty) {
            const schoolDocument = schoolQuerySnapshot.docs[0];
            const announcementRef = FirebaseAPI.collection(schoolDocument.ref, 'announcement');

            const announcementQuerySnapshot = await FirebaseAPI.getDocs(
                FirebaseAPI.query(announcementRef, FirebaseAPI.where("date", "==", new Date(timestamp)))
            );

            console.log("Date compare code block passed");

            if (!announcementQuerySnapshot.empty) {
                const announcementDocument = announcementQuerySnapshot.docs[0];
                const announcementData = announcementDocument.data();

                let image = null;
                if (hasNewImage && !keepOldImage) {
                    const storageRef = FirebaseAPI.ref(FirebaseAPI.storage, `${schoolName}/announcementPost/${file.name}`);
                    await FirebaseAPI.uploadBytes(storageRef, file);
                    image = await FirebaseAPI.getDownloadURL(storageRef);

                    if (announcementData.image) {
                        const imageRef = FirebaseAPI.ref(FirebaseAPI.storage, announcementData.image);

                        // Delete the image from storage
                        await FirebaseAPI.deleteObject(imageRef);
                        console.log('Image deleted successfully!');
                    }
                } else {
                    image = keepOldImage ? announcementData.image : null;
                }

                const schoolName = document.getElementById('schoolNameInitialEdit').value;
                const schoolTitleTh = document.getElementById('schoolTitleThEdit').value;
                const schoolTitleEn = document.getElementById('schoolTitleEnEdit').value;
                const schoolDescriptionTh = document.getElementById('schoolDescriptionThEdit').value;
                const schoolDescriptionEn = document.getElementById('schoolDescriptionEnEdit').value;
                const schoolWebsite =  document.getElementById('schoolWebsiteEdit').value;


                await FirebaseAPI.updateDoc(announcementDocument.ref, {
                    "school-name": schoolName,
                    "school-title-th": schoolTitleTh,
                    "school-title-en": schoolTitleEn,
                    "school-description-th": schoolDescriptionTh,
                    "school-description-en": schoolDescriptionEn,
                    "schoolWebsite": schoolWebsite
                });

                console.log('Announcement edited successfully!');
                window.alert('Announcement edited successfully!');
                document.getElementById("announcementFormEdit").reset();
            } else {
                console.log("Announcement not found.");
            }
        } else {
            console.log("School document not found.");
        }
    } catch (error) {
        console.error('Error editing announcement:', error);
    }
}

// อัพเดทข้อมูลลง Firestore + Storage (ยังไม่สำเร็จ)
async function submitSchoolInfo() {

    const postHeader = document.getElementById('postHeaderAdd').value;
    const postContent = document.getElementById('postContentAdd').value;
    const schoolName = currentUser.school_name;

    const file = document.getElementById('imageInputAdd').files[0];
    const db = FirebaseAPI.getFirestore();

    try {
        let image = null;
        if (file) {
            const storageRef = FirebaseAPI.ref(FirebaseAPI.storage, `${schoolName}/announcementPost/${file.name}`);
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
                image: image
            }).then(() => {
                location.reload();
            });
            console.log('Announcement added successfully!');
            window.alert('Announcement added successfully!');
            document.getElementById('announcementForm').reset();
            document.getElementById('imagePreviewAdd').innerHTML = '';

        } else {
            console.log("School document not found.");
        }
    } catch (error) {
        console.error('Error uploading image or adding announcement:', error);
    }
}

// รีเซ็ต Form (ใช้งานได้)
function cancelSchoolInfoChange() {
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const announcementForm = document.getElementById('schoolEditForm');

    cancelAddBtn.addEventListener('click', function () {
        announcementForm.reset();
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
