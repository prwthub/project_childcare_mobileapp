import { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";

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

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

async function fetchStudent() {
    let [f, b] = room.split("-");
    const newRoomName = `${f}/${b}`;
    let response = await fetch(
        "https://perforkid.azurewebsites.net/web/student/getStudentBySchoolNameAndStudentRoom",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                schoolName: currentUser.school_name,
                studentRoom: newRoomName
            }),
        }
    );

    let data = await response.json();
    if (response.status === 404) {
        console.log("No student found");
        return [];
    }

    console.log(data.studentData);
    return data.studentData;
}

async function generateStudentTable() {
    let schoolData = await fetchStudent();
    if (schoolData.length === 0) {
        return;
    }

    var itemsData = [];
    const storageRef = ref(storage, `school/${currentUser.school_name}/images-student`);
    try {
        var { items } = await listAll(storageRef);
        for (const itemRef of items) {
            itemsData.push( itemRef.name );
        }
    } catch (error) {
        console.error('Error listing files:', error);
    }
    console.log("itemsData : ",itemsData);
    
    let tableHtml = `
    <table>
        <tr>
            <th>student-ID</th>
            <th>name-surname</th>
            <th>class-room</th>
            <th>father-name</th>
            <th>father-phone</th>
            <th>father-email</th>
            <th>mother-name</th>
            <th>mother-phone</th>
            <th>mother-email</th>
            <th>address</th>
            <th>image</th>
            <th>upload image</th>
        </tr>
    `;
    
    
    for (const school of schoolData) {
        const foundImage = itemsData.includes(`${school["student-ID"]}.png`);
        if (foundImage) {
            const studentImageRef = ref(storage, `school/${currentUser.school_name}/images-student/${school["student-ID"]}.png`);
            try {
                const imageUrl = await getDownloadURL(studentImageRef);
                console.log(`${school["student-ID"]} studentImage exists`);
                tableHtml += `
                <tr>
                    <td>${school["student-ID"]}</td>
                    <td>${school["name-surname"]}</td>
                    <td>${school["class-room"]}</td>
                    <td>${school["father-name"]}</td>
                    <td>${school["father-phone"]}</td>
                    <td>${school["father-email"]}</td>
                    <td>${school["mother-name"]}</td>
                    <td>${school["mother-phone"]}</td>
                    <td>${school["mother-email"]}</td>
                    <td>${school["address"]}</td>
                    <td style="text-align: center;">
                        <img id="previewImg-${school["student-ID"]}" src="${imageUrl}" style="height:100px">
                        <div>
                            <button id="delFile-${school["student-ID"]}"> Delete </button>
                        </div>
                    </td>
                    <td><input id="fileInput-${school["student-ID"]}" type="file" accept="image/*"></td>
                </tr>`;
            } catch (error) {
                console.error('Error getting download URL:', error);
            }
        } else {
            tableHtml += `
            <tr>
                <td>${school["student-ID"]}</td>
                <td>${school["name-surname"]}</td>
                <td>${school["class-room"]}</td>
                <td>${school["father-name"]}</td>
                <td>${school["father-phone"]}</td>
                <td>${school["father-email"]}</td>
                <td>${school["mother-name"]}</td>
                <td>${school["mother-phone"]}</td>
                <td>${school["mother-email"]}</td>
                <td>${school["address"]}</td>
                <td style="text-align: center;">
                    <img id="previewImg-${school["student-ID"]}" src="../../picture/user.jpg" style="height:100px">
                    <div>
                        <button id="delFile-${school["student-ID"]}" style="display:none;"> Delete </button>
                    </div>
                </td>
                <td><input id="fileInput-${school["student-ID"]}" type="file" accept="image/*"></td>
            </tr>`;
        }    
    }
    tableHtml += `</table>`;
    document.getElementById("schoolTable").innerHTML = tableHtml;

    // เพิ่ม event listener ให้กับ input element ในแต่ละ row
    schoolData.forEach((school) => {
        const fileInput = document.getElementById(`fileInput-${school["student-ID"]}`);
        if (fileInput) {
            fileInput.addEventListener("change", function () {
                handleImageUpload(this, school["student-ID"]);
            });
        }
        
        const delButtonPng = document.getElementById(`delFile-${school["student-ID"]}`);
        if (delButtonPng) { 
            delButtonPng.addEventListener("click", function () {
                let fileName = `${school["student-ID"]}.png`;
                handleDeleteImage(fileName);
            });
        } 
    });
}

async function handleImageUpload(input, studentID) {
    const file = input.files[0];
    if (!file.name.startsWith(studentID)) {
        alert("File name does not match student-ID");
        return;
    }

    if (!file.name.endsWith(".png")) {
        alert("File must be a PNG image");
        return;   
    }

    // สร้าง FileReader object เพื่ออ่านไฟล์รูปภาพ
    const reader = new FileReader();

    // เมื่อไฟล์อ่านเสร็จสิ้นแล้ว
    reader.onload = function (e) {
        const previewImg = document.getElementById(`previewImg-${studentID}`);
        previewImg.src = e.target.result;

        const delButton = document.getElementById(`delFile-${studentID}`);
        delButton.style.display = "inline";
    };
    reader.readAsDataURL(file);

    const storageRef = ref(storage, `school/${currentUser.school_name}/images-student/${file.name}`);
    await uploadBytes(storageRef, file);
    console.log("Image uploaded successfully");
}


async function handleDeleteImage(studentID) {
    console.log(`Delete image ${studentID} . . .`);
    const imageRef = ref(storage, `school/${currentUser.school_name}/images-student/${studentID}`);

    try {
        await deleteObject(imageRef);
        console.log(`Image ${studentID} deleted successfully`);
        alert("Image deleted successfully");

        let [id, ext] = studentID.split(".")
        const previewImg = document.getElementById(`previewImg-${id}`);
        if (previewImg) {
            previewImg.src = "../../picture/user.jpg";
        } 

    } catch (error) {
        console.error('Error deleting image:', error);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    generateStudentTable();
});