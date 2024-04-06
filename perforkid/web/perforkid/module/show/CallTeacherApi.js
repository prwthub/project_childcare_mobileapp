import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
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

async function fetchTeacher() {
    let response = await fetch(
        "https://perforkid.azurewebsites.net/web/teacher/getTeacherBySchoolName",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ schoolName: currentUser.school_name }),
        }
    );

    let data = await response.json();

    console.log(data.teacherData);
    return data.teacherData;
}

async function generateTeacherTable() {
    let tableHtml = `
    <table>
        <tr>
            <th>teacher-ID</th>
            <th>name-surname</th>
            <th>class-room</th>
            <th>teaching-room</th>
            <th>subject</th>
            <th>email</th>
            <th>address</th>
            <th>image</th>
            <th>upload image</th>
        </tr>
    `;

    var itemsData = [];
    const storageRef = ref(storage, `school/${currentUser.school_name}/teacher-images`);
    try {
        var { items } = await listAll(storageRef);
        for (const itemRef of items) {
            itemsData.push( itemRef.name );
        }
    } catch (error) {
        console.error('Error listing files:', error);
    }

    console.log(itemsData);
    
    let schoolData = await fetchTeacher();
    for (const school of schoolData) {
        const foundPNG = itemsData.includes(`${school["teacher-ID"]}.png`);
        const foundJPG = itemsData.includes(`${school["teacher-ID"]}.jpg`);
        if (foundPNG) {
            const teacherImageRef = ref(storage, `school/${currentUser.school_name}/teacher-images/${school["teacher-ID"]}.png`);
            try {
                const imageUrl = await getDownloadURL(teacherImageRef);
                console.log(`${school["teacher-ID"]} teacherImage exists`);
                tableHtml += `
                <tr>
                    <td>${school["teacher-ID"]}</td>
                    <td>${school["name-surname"]}</td>
                    <td>${school["class-room"]}</td>
                    <td>${school["teaching-room"]}</td>
                    <td>${school["subject"]}</td>
                    <td>${school["email"]}</td>
                    <td>${school["address"]}</td>
                    <td><img id="previewImg-${school["teacher-ID"]}" src="${imageUrl}" style="height:100px"></td>
                    <td><input id="fileInput-${school["teacher-ID"]}" type="file" accept="image/*"></td>
                </tr>`;
            } catch (error) {
                console.error('Error getting download URL:', error);
            }
        } else if (foundJPG) {
            const teacherImageRef = ref(storage, `school/${currentUser.school_name}/teacher-images/${school["teacher-ID"]}.jpg`);
            try {
                const imageUrl = await getDownloadURL(teacherImageRef);
                console.log(`${school["teacher-ID"]} teacherImage exists`);
                tableHtml += `
                <tr>
                    <td>${school["teacher-ID"]}</td>
                    <td>${school["name-surname"]}</td>
                    <td>${school["class-room"]}</td>
                    <td>${school["teaching-room"]}</td>
                    <td>${school["subject"]}</td>
                    <td>${school["email"]}</td>
                    <td>${school["address"]}</td>
                    <td><img id="previewImg-${school["teacher-ID"]}" src="${imageUrl}" style="height:100px"></td>
                    <td><input id="fileInput-${school["teacher-ID"]}" type="file" accept="image/*"></td>
                </tr>`;
            } catch (error) {
                console.error('Error getting download URL:', error);
            }  
        } else {
            tableHtml += `
            <tr>
                <td>${school["teacher-ID"]}</td>
                <td>${school["name-surname"]}</td>
                <td>${school["class-room"]}</td>
                <td>${school["teaching-room"]}</td>
                <td>${school["subject"]}</td>
                <td>${school["email"]}</td>
                <td>${school["address"]}</td>
                <td><img id="previewImg-${school["teacher-ID"]}" src="../../picture/user.jpg" style="height:100px"></td>
                <td><input id="fileInput-${school["teacher-ID"]}" type="file" accept="image/*"></td>
            </tr>`;
        }    
    }


    tableHtml += `</table>`;
    document.getElementById("schoolTable").innerHTML = tableHtml;

    // เพิ่ม event listener ให้กับ input element ในแต่ละ row
    schoolData.forEach((school) => {
        document.getElementById(`fileInput-${school["teacher-ID"]}`).addEventListener("change", function () {
            handleImageUpload(this, school["teacher-ID"]);
        });
    });
}

async function handleImageUpload(input, teacherID) {
    const file = input.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }

    if (!file.name.startsWith(teacherID)) {
        if (file.name.endsWith(".jpg") || file.name.endsWith(".png")) {
            alert("File name does not match teacher-ID");
            return;
        }
    }

    // สร้าง FileReader object เพื่ออ่านไฟล์รูปภาพ
    const reader = new FileReader();

    // เมื่อไฟล์อ่านเสร็จสิ้นแล้ว
    reader.onload = function (e) {
        // ให้แสดงภาพที่อ่านได้ใน tag <img> เพื่อแสดง preview
        const previewImg = document.getElementById(`previewImg-${teacherID}`);
        previewImg.src = e.target.result;
    };

    // อ่านไฟล์รูปภาพ
    reader.readAsDataURL(file);

    const storageRef = ref(storage, `school/${currentUser.school_name}/teacher-images/${file.name}`);
    await uploadBytes(storageRef, file);
    console.log("Image uploaded successfully");
    // alert("Image uploaded successfully");
}


document.addEventListener("DOMContentLoaded", function () {
    generateTeacherTable();
});