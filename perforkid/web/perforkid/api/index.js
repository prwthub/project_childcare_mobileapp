const express = require('express');
const app = express();
app.use(express.json());

const { getSchool, 
        getSchoolByName } = require('./school.js');

const { getStudentBySchoolAndRoom,
        getRoomBySchoolAndRoom } = require('./student.js');

const { getTeacherBySchool,
        getTeacherBySchoolAndClassRoom,
        getTeacherBySchoolAndTeachingRoom } = require('./teacher.js');

// school
app.post('/getSchool', getSchool);
app.post('/getSchoolBySchoolName', getSchoolByName);


// student
app.post('/getStudentBySchoolAndRoom/:schoolName/:studentRoom', getStudentBySchoolAndRoom);
app.post('/getRoomBySchoolAndRoom/:schoolName/:studentRoom', getRoomBySchoolAndRoom);


// teacher
app.post('/getTeacherBySchool/:schoolName', getTeacherBySchool);
app.post('/getTeacherBySchoolAndClassRoom/:schoolName/:classRoom', getTeacherBySchoolAndClassRoom);
app.post('/getTeacherBySchoolAndTeachingRoom/:schoolName/:teachingRoom', getTeacherBySchoolAndTeachingRoom);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});