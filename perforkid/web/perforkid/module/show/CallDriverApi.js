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

async function fetchDriver() {
    let response = await fetch(
        "https://perforkid.azurewebsites.net/web/driver/getDriverBySchoolName",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ schoolName: currentUser.school_name }),
        }
    );

    let data = await response.json();

    console.log(data.driverData);
    return data.driverData;
}

async function generateDriverTable() {
    
    var itemsData = [];
    const storageRef = ref(storage, `school/${currentUser.school_name}/images-driver`);
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
            <th>driver-ID</th>
            <th>image</th>
            <th>name-surname</th>
            <th>car-number</th>
            <th>phone</th>
            <th>email</th>
            <th>address</th>
            <!-- <th>upload image</th> -->
        </tr>
    `;
    
    let schoolData = await fetchDriver();
    for (const school of schoolData) {
        const foundImage = itemsData.includes(`${school["driver-ID"]}.png`);
        if (foundImage) {
            const driverImageRef = ref(storage, `school/${currentUser.school_name}/images-driver/${school["driver-ID"]}.png`);
            try {
                const imageUrl = await getDownloadURL(driverImageRef);
                console.log(`${school["driver-ID"]} driverImage exists`);
                tableHtml += `
                <tr>
                    <td>${school["driver-ID"]}</td>
                    <td style="text-align: center;">
                        <label for="fileInput-${school['driver-ID']}">
                            <img id="previewImg-${school['driver-ID']}" src="${imageUrl}" style="height: 100px; cursor: pointer;">
                        </label>
                        <input id="fileInput-${school['driver-ID']}" type="file" accept="image/*" style="display: none;">
                        <div>
                            <button id="delFile-${school['driver-ID']}">Delete</button>
                        </div>
                    </td>
                    <td>${school["name-surname"]}</td>
                    <td>${school["car-number"]}</td>
                    <td>${school["phone"]}</td>
                    <td>${school["email"]}</td>
                    <td>${school["address"]}</td>
                    <!-- <td><input id="fileInput-${school["driver-ID"]}" type="file" accept="image/*"></td> -->
                </tr>`;
            } catch (error) {
                console.error('Error getting download URL:', error);
            }
        } else {
            tableHtml += `
            <tr>
                <td>${school["driver-ID"]}</td>
                <td style="text-align: center;">
                    <label for="fileInput-${school['driver-ID']}">
                        <img id="previewImg-${school["driver-ID"]}" src="../../picture/user.jpg" style="height:100px">
                    </label>
                    <input id="fileInput-${school['driver-ID']}" type="file" accept="image/*" style="display: none;">
                    <div>
                        <button id="delFile-${school["driver-ID"]}" style="display:none;"> Delete </button>
                    </div>
                </td>
                <td>${school["name-surname"]}</td>
                <td>${school["car-number"]}</td>
                <td>${school["phone"]}</td>
                <td>${school["email"]}</td>
                <td>${school["address"]}</td>
                <!-- <td><input id="fileInput-${school["driver-ID"]}" type="file" accept="image/*"></td> -->
            </tr>`;
        }    
    }
    tableHtml += `</table>`;
    document.getElementById("schoolTable").innerHTML = tableHtml;

    // เพิ่ม event listener ให้กับ input element ในแต่ละ row
    schoolData.forEach((school) => {
        const fileInput = document.getElementById(`fileInput-${school["driver-ID"]}`);
        if (fileInput) {
            fileInput.addEventListener("change", function () {
                handleImageUpload(this, school["driver-ID"]);
            });
        }
        
        const delButtonPng = document.getElementById(`delFile-${school["driver-ID"]}`);
        if (delButtonPng) { 
            delButtonPng.addEventListener("click", function () {
                let fileName = `${school["driver-ID"]}.png`;
                handleDeleteImage(fileName);
            });
        } 
    });
}

async function handleImageUpload(input, driverID) {
    const file = input.files[0];
    if (!file.name.startsWith(driverID)) {
        alert("File name does not match driver-ID");
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
        const previewImg = document.getElementById(`previewImg-${driverID}`);
        previewImg.src = e.target.result;

        const delButton = document.getElementById(`delFile-${driverID}`);
        delButton.style.display = "inline";
    };
    reader.readAsDataURL(file);

    const storageRef = ref(storage, `school/${currentUser.school_name}/images-driver/${file.name}`);
    await uploadBytes(storageRef, file);
    console.log("Image uploaded successfully");
}


async function handleDeleteImage(driverID) {
    console.log(`Delete image ${driverID} . . .`);
    const imageRef = ref(storage, `school/${currentUser.school_name}/images-driver/${driverID}`);

    try {
        await deleteObject(imageRef);
        console.log(`Image ${driverID} deleted successfully`);
        alert("Image deleted successfully");

        let [id, ext] = driverID.split(".")
        const previewImg = document.getElementById(`previewImg-${id}`);
        if (previewImg) {
            previewImg.src = "../../picture/user.jpg";
        } 

    } catch (error) {
        console.error('Error deleting image:', error);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    generateDriverTable();
});