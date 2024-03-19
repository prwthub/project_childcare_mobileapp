import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {getFirestore,collection,addDoc,getDocs,query,where} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
const db = getFirestore(app);

const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

const styleElement = document.createElement('style');

async function fetchSchoolData() {
    const schoolRef = collection(db, 'school');
    const schoolQuerySnapshot = await getDocs(query(schoolRef, where("school-name", "==", currentUser.school_name)));

    if (!schoolQuerySnapshot.empty) {
        schoolQuerySnapshot.forEach(doc => {
            const data = doc.data();
            // document.getElementById("schoolImage").setAttribute("src", data["school-image"] || "../../picture/school-logo.png");
            // document.getElementById("schoolBanner").setAttribute("src", data["school-banner"] || "../../picture/school-banner.png");
            document.getElementById("schoolImage").innerHTML = `<img src="${data["school-image"] || "../../picture/school-logo.png"}" alt="School Profile Image">`;
            document.getElementById("schoolBanner").innerHTML = `<img src="${data["school-banner"] || "../../picture/school-banner.png"}" alt="Banner Image">`;


            document.getElementById("schoolNameInitial").textContent = data["school-name"] || "( ไม่มีข้อมูล )";
            document.getElementById("schoolTitleTh").textContent = data["school-title-th"] || "( ไม่มีข้อมูล )";
            document.getElementById("schoolTitleEn").textContent = data["school-title-en"] || "( ไม่มีข้อมูล )";
            
            document.getElementById("schoolDescriptionTh").textContent = data["school-description-th"] || "( ไม่มีข้อมูล )";
            document.getElementById("schoolDescriptionEn").textContent = data["school-description-en"] || "( ไม่มีข้อมูล )";
            document.getElementById("schoolWebsite").textContent = data["school-website"] || "( ไม่มีข้อมูล )";
        });
    }
}

fetchSchoolData().then(() => {
    const currentSchoolNameTH = document.getElementById("schoolTitleTh").textContent;
    const currentSchoolNameEN = document.getElementById("schoolTitleEn").textContent;
    document.getElementById("schoolTitleThEdit").setAttribute("placeholder", currentSchoolNameTH);
    document.getElementById("schoolTitleEnEdit").setAttribute("placeholder", currentSchoolNameEN);

    const currentSchoolDescriptionTH = document.getElementById("schoolDescriptionTh").textContent;
    const currentSchoolDescriptionEN = document.getElementById("schoolDescriptionEn").textContent;
    document.getElementById("schoolDescriptionThEdit").setAttribute("placeholder", currentSchoolDescriptionTH);
    document.getElementById("schoolDescriptionEnEdit").setAttribute("placeholder", currentSchoolDescriptionEN);

    const currentSchoolWebsite = document.getElementById("schoolWebsite").textContent;
    document.getElementById("schoolWebsiteEdit").setAttribute("placeholder", currentSchoolWebsite);
});