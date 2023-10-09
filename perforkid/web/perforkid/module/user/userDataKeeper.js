// Import currentUser
import currentUser from './currentUser.js';

// ในส่วนนี้คือการดึง currentUser จาก sessionStorage
const storedUser = sessionStorage.getItem('currentUser');

if (storedUser) {
    // แปลง JSON ที่ถูกเก็บไว้ใน sessionStorage กลับเป็น Object
    const storedCurrentUser = JSON.parse(storedUser);

    // ตั้งค่าค่า email และ school_name จาก storedCurrentUser
    currentUser.email = storedCurrentUser.email;
    currentUser.school_name = storedCurrentUser.school_name;
}

// ตั้งค่าข้อความใน element ตามค่าใน currentUser
document.getElementById('email').textContent = currentUser.email;
document.getElementById('schoolName').textContent = currentUser.school_name;



// เพิ่มการดักฟังเวนต์บนปุ่ม "Clear Storage"

