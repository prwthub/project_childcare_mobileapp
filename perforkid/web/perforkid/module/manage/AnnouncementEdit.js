import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

const cancelEditBtn = document.getElementById('cancelEditBtn');

cancelEditBtn.addEventListener('click', function () {
    const editOverlay = document.getElementById('editOverlay');
    editOverlay.style.display = 'none';
    document.getElementById("announcementFormEdit").reset();
});
// Define timeRefParams in a scope both functions can access
// console.log('DOMContentLoaded event triggered');
// const params = new URLSearchParams(window.location.search);
// const timeRefParams = params.get('timestamp');

// Now you have the selected timeRefParams, you can use it as needed in this page.
// console.log(`Selected Post: ` + timeRefParams);
// document.title = "Post " + timeRefParams;

export async function editAnnouncement(timestamp) {
    try {
        const keepOldImageCheckbox = document.getElementById('keepOldImage');
        const keepOldImage = keepOldImageCheckbox.checked;

        const file = document.getElementById('imageInputEdit').files[0];
        const hasNewImage = !!file;

        const db = FirebaseAPI.getFirestore();
        const schoolName = currentUser.school_name;
        const schoolRef = FirebaseAPI.collection(db, 'school');

        console.log("Announcement Edit post button submit clicked");

        const schoolQuerySnapshot = await FirebaseAPI.getDocs(
            FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", schoolName))
        );

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

                // Assuming you have fields with ids 'postHeaderEdit' and 'postContentEdit'
                const postHeader = document.getElementById('postHeaderEdit').value;
                const postContent = document.getElementById('postContentEdit').value;

                await FirebaseAPI.updateDoc(announcementDocument.ref, {
                    header: postHeader,
                    content: postContent,
                    date: new Date(),
                    image: image,
                    editStatus: "Y"
                });

                console.log('แก้ไขประกาศเรียบร้อยแล้ว!');
                window.alert('แก้ไขประกาศเรียบร้อยแล้ว!');
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



