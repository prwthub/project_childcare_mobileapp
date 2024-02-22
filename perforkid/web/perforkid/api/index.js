const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors()); // ใช้ CORS middleware

const { getSchool, 
        getSchoolBySchoolName } = require('./school.js');

const { getTeacherBySchoolName,
        getTeacherBySchoolNameAndClassRoom,
        getTeacherBySchoolNameAndTeachingRoom } = require('./teacher.js');

const { getDriverBySchoolName,
        getDriverBySchoolNameAndCarNumber } = require('./driver.js');

const { getStudentBySchoolName,
        getStudentBySchoolNameAndRoom,
        getRoomBySchoolNameAndRoom } = require('./student.js');

const { getStudentCarBySchoolName,
        getStudentCarBySchoolNameAndCarNumber,
        getCarBySchoolNameAndCarNumber } = require('./studentCar.js');

const { listStorageFiles, 
        downloadStorageFile } = require('./storage.js');




// school
app.post('/school/getSchool', getSchool);
app.post('/school/getSchoolBySchoolName', getSchoolBySchoolName);


// teacher
app.post('/teacher/getTeacherBySchoolName', getTeacherBySchoolName);
app.post('/teacher/getTeacherBySchoolNameAndClassRoom', getTeacherBySchoolNameAndClassRoom);
app.post('/teacher/getTeacherBySchoolNameAndTeachingRoom', getTeacherBySchoolNameAndTeachingRoom);


// driver
app.post('/driver/getDriverBySchoolName', getDriverBySchoolName);
app.post('/driver/getDriverBySchoolNameAndCarNumber', getDriverBySchoolNameAndCarNumber);


// student , room
app.post('/student/getStudentBySchoolName', getStudentBySchoolName);
app.post('/student/getStudentBySchoolNameAndRoom', getStudentBySchoolNameAndRoom);
app.post('/room/getRoomBySchoolNameAndRoom', getRoomBySchoolNameAndRoom);


// studentCar , car
app.post('/studentCar/getStudentCarBySchoolName', getStudentCarBySchoolName);
app.post('/studentCar/getStudentCarBySchoolNameAndCarNumber', getStudentCarBySchoolNameAndCarNumber);
app.post('/car/getCarBySchoolNameAndCarNumber', getCarBySchoolNameAndCarNumber);


// storage
app.post('/storage/listStorageFiles', listStorageFiles);
app.post('/storage/downloadStorageFile', downloadStorageFile);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});