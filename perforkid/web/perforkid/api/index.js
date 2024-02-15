const express = require('express');
const app = express();

const { getSchool, 
        getSchoolByName } = require('./school.js');

const { getStudentBySchoolAndRoom } = require('./student.js');

const { getTeacherBySchool,
        getTeacherBySchoolAndClassRoom,
        getTeacherBySchoolAndTeachingRoom } = require('./teacher.js');

// school
app.get('/getSchool', getSchool);
app.get('/getSchool/:schoolName', getSchoolByName);

// student
app.get('/getStudentBySchoolAndRoom/:schoolName/:studentRoom', getStudentBySchoolAndRoom);

// teacher
app.get('/getTeacherBySchool/:schoolName', getTeacherBySchool);
app.get('/getTeacherBySchoolAndClassRoom/:schoolName/:classRoom', getTeacherBySchoolAndClassRoom);
app.get('/getTeacherBySchoolAndTeachingRoom/:schoolName/:teachingRoom', getTeacherBySchoolAndTeachingRoom);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});