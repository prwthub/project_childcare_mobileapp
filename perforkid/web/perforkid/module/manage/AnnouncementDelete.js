import currentUser from "../user/currentUser.js";
import * as FirebaseAPI from "../../firebaseConfig/FirebaseAPI.js";

export async function deleteAnnouncement(timestamp) {
    const db = FirebaseAPI.getFirestore();
    const schoolRef = FirebaseAPI.collection(db, 'school');

    try {
        const schoolQuerySnapshot = await FirebaseAPI.getDocs(
            FirebaseAPI.query(schoolRef, FirebaseAPI.where("school-name", "==", currentUser.school_name))

        );
        console.log(currentUser.school_name);
            
        if (!schoolQuerySnapshot.empty) {
            const schoolDocument = schoolQuerySnapshot.docs[0];
            const announcementRef = FirebaseAPI.collection(schoolDocument.ref, 'announcement');
            console.log("Timestamp\n" + timestamp);
            const convertedTimestampDate = new Date(decodeURIComponent(timestamp));
            console.log("convertedTimestampDate\n" + convertedTimestampDate);
            const query = FirebaseAPI.query(announcementRef, FirebaseAPI.where("date", "==", new Date(timestamp)));


            const announcementQuerySnapshot = await FirebaseAPI.getDocs(query);
            console.log(announcementQuerySnapshot);
            if (!announcementQuerySnapshot.empty) {
                const announcementDoc = announcementQuerySnapshot.docs[0];

                const announcementData = announcementDoc.data();
                console.log(announcementData.date);
                console.log(convertedTimestampDate);
                // Check if there's an image associated with the announcement
                if (announcementData.image) {
                    const imageRef = FirebaseAPI.ref(FirebaseAPI.storage, announcementData.image);

                    // Delete the image from storage
                    await FirebaseAPI.deleteObject(imageRef);
                    console.log('Image deleted successfully!');
                }

                await FirebaseAPI.deleteDoc(announcementDoc.ref);
                alert('Announcement deleted successfully!');
                console.log('Announcement deleted successfully!');
            } else {
                console.log("Announcement not found.");
            }
        } else {
            console.log("School document not found.");
        }
    } catch (error) {
        console.error('Error deleting announcement:', error);
    }
}
