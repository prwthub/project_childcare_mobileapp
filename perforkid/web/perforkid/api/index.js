const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(cors());

const { signIn,
        signUp,
        signOut } = require('./authen.js');

const { getSchool, 
        getSchoolBySchoolName } = require('./school.js');

const { getTeacherInitialBySchoolNameAndEmail,
        getDriverInitialBySchoolNameAndEmail,
        getParentInitialBySchoolNameAndEmail } = require('./initial.js');

const { getAnnouncementBySchoolName,
        getAnnouncementBySchoolNameAndId } = require('./announcement.js');

const { getTeacherBySchoolName,
        getTeacherBySchoolNameAndTeacherEmail,
        getTeacherBySchoolNameAndTeacherId,
        getTeacherBySchoolNameAndClassRoom,
        getTeacherBySchoolNameAndTeachingRoom } = require('./teacher.js');

const { getDriverBySchoolName,
        getDriverBySchoolNameAndDriverEmail,
        getDriverBySchoolNameAndDriverId,
        getDriverBySchoolNameAndCarNumber } = require('./driver.js');

const { getStudentBySchoolName,
        getStudentBySchoolNameAndRoom,
        getRoomBySchoolName,
        getRoomBySchoolNameAndRoom,
        getScheduleBySchoolNameAndRoom } = require('./student.js');

const { getStudentCarBySchoolName,
        getStudentCarBySchoolNameAndCarNumber,
        getStudentCarBySchoolNameAndRoom,
        getStudentCarBySchoolNameAndId,
        updateStudentCarStatusBySchoolNameAndId,
        getCarBySchoolNameAndCarNumber } = require('./studentCar.js');

const { sendCarLocation,
        getCarLocation,
        calculateCarDistance,
        checkUpdateStatus,
        createStudentCarLocation,
        getStudentCarLocation,
        getLatAndLong,
        checkUpdateStatusAndGetStudentLocation,
        calculateAddressStudentsDistance } = require('./car.js');

const { createParentCard,
        createVisitorCard,
        getCardBySchoolNameAndCardType,
        getCardBySchoolNameAndCardId,
        deleteExpireCardBySchoolName } = require('./card.js');

const { listStorageFiles, 
        downloadStorageFile } = require('./storage.js');

// authen
app.post('/authen/signIn', signIn);                                                                             // ✅ sign in and generate token
app.post('/authen/signUp', signUp);                                                                             // ✅ sign up
app.post('/authen/signOut', signOut);                                                                           // ✅ sign out and revoke token

// school
app.post('/school/getSchool', getSchool);                                                                       // ✅   get all school data
app.post('/school/getSchoolBySchoolName', getSchoolBySchoolName);                                               // ✅🔒 get school data by school name


// initial 
app.post('/initial/teacher/getTeacherInitialBySchoolNameAndEmail', getTeacherInitialBySchoolNameAndEmail);      // ✅🔒✉️ get teacher data by school name and teacher email
app.post('/initial/driver/getDriverInitialBySchoolNameAndEmail', getDriverInitialBySchoolNameAndEmail);         // ✅🔒✉️ get driver data by school name and driver email
app.post('/initial/parent/getParentInitialBySchoolNameAndEmail', getParentInitialBySchoolNameAndEmail);         // ✅🔒✉️ get student data by school name and parent email


// announcement
app.post('/announcement/getAnnouncementBySchoolName', getAnnouncementBySchoolName);                             // ✅🔒 get all announcement data by school name
app.post('/announcement/getAnnouncementBySchoolNameAndId', getAnnouncementBySchoolNameAndId);                   // ✅🔒 get announcement data by school name and firestore-id


// teacher
app.post('/teacher/getTeacherBySchoolName', getTeacherBySchoolName);                                            // ✅🔒 get all teacher data by school name
app.post('/teacher/getTeacherBySchoolNameAndTeacherEmail', getTeacherBySchoolNameAndTeacherEmail);              // ✅🔒 get teacher data by school name and teacher email
app.post('/teacher/getTeacherBySchoolNameAndTeacherId', getTeacherBySchoolNameAndTeacherId);                    // ✅🔒 get teacher data by school name and teacher id
app.post('/teacher/getTeacherBySchoolNameAndClassRoom', getTeacherBySchoolNameAndClassRoom);                    // ✅🔒 get all teacher data by school name and class room 
app.post('/teacher/getTeacherBySchoolNameAndTeachingRoom', getTeacherBySchoolNameAndTeachingRoom);              // ✅🔒 get all teacher data by school name and teaching room 


// driver
app.post('/driver/getDriverBySchoolName', getDriverBySchoolName);                                               // ✅🔒 get all driver data by school name
app.post('/driver/getDriverBySchoolNameAndDriverEmail', getDriverBySchoolNameAndDriverEmail);                   // ✅🔒 get driver data by school name and driver email
app.post('/driver/getDriverBySchoolNameAndDriverId', getDriverBySchoolNameAndDriverId);                         // ✅🔒 get driver data by school name and driver id
app.post('/driver/getDriverBySchoolNameAndCarNumber', getDriverBySchoolNameAndCarNumber);                       // ✅🔒 get driver data by school name and car number


// student , room
app.post('/student/getStudentBySchoolName', getStudentBySchoolName);                                            // ✅🔒 get all student data by school name
app.post('/student/getStudentBySchoolNameAndRoom', getStudentBySchoolNameAndRoom);                              // ✅🔒 get all student data by school name and room
app.post('/room/getRoomBySchoolName', getRoomBySchoolName);                                                     // ✅🔒 get all room name by school name
app.post('/room/getRoomBySchoolNameAndRoom', getRoomBySchoolNameAndRoom);                                       // ✅🔒 get room data by school name and room
app.post('/schedule/getScheduleBySchoolNameAndRoom', getScheduleBySchoolNameAndRoom);                           // ?? get schedule (storage) data by school name and room


// studentCar , car
app.post('/studentCar/getStudentCarBySchoolName', getStudentCarBySchoolName);                                   // ✅🔒 get all student car data by school name
app.post('/studentCar/getStudentCarBySchoolNameAndCarNumber', getStudentCarBySchoolNameAndCarNumber);           // ✅🔒 get all student car data by school name and car number
app.post('/studentCar/getStudentCarBySchoolNameAndRoom', getStudentCarBySchoolNameAndRoom);                     // ✅🔒 get all student car data by school name and room
app.post('/studentCar/getStudentCarBySchoolNameAndId', getStudentCarBySchoolNameAndId);                         // ✅🔒 get student car data by school name and id
app.post('/studentCar/updateStudentCarStatusBySchoolNameAndId', updateStudentCarStatusBySchoolNameAndId);       // ✅🔒 update student car status by school name and id and status
app.post('/car/getCarBySchoolNameAndCarNumber', getCarBySchoolNameAndCarNumber);                                // ✅🔒 get car data by school name and car number
// get car location (realtime database ???)                                                                     // ?? get car location by school name and car number                  


// car location
app.post('/car/sendCarLocation', sendCarLocation);                                                              // ✅🔒 send car location to firebase realtime database
app.post('/car/getCarLocation', getCarLocation);                                                                // ✅🔒 get car location by schoolName and carNumber
app.post('/car/calculateCarDistance', calculateCarDistance);                                                    // ✅🔒 calculate car distance by start lat, start long, end 
app.post('/car/checkUpdateStatus', checkUpdateStatus);                                                          // ✅🔒 check update status by school name and car number before call create car location
app.post('/car/createStudentCarLocation', createStudentCarLocation);                                            // ✅🔒 create student car location by school name, car number, lat, long
app.post('/car/getStudentCarLocation', getStudentCarLocation);                                                  // ✅🔒 get student car location by school name and car number
app.post('/car/getLatAndLong', getLatAndLong);                                                                  // ไม่ใช้ เพราะ มันใช้ google map api ที่ต้องใช้ key และเสียค่าใช้จ่าย
app.post('/car/checkUpdateStatusAndGetStudentLocation', checkUpdateStatusAndGetStudentLocation);                // ✅🔒 check update status and get student location by school name and car number
app.post('/car/calculateAddressStudentsDistance', calculateAddressStudentsDistance);                             // ✅ calculate address students distance by school name and car number


// card
app.post('/card/createParentCard', createParentCard);                                                           // ✅🔒✉️ create parent card
app.post('/card/createVisitorCard', createVisitorCard);                                                         // ✅🔒✉️ create visitor card
app.post('/card/getCardBySchoolNameAndCardType', getCardBySchoolNameAndCardType);                               // ✅🔒 get all card data by school name and card type
app.post('/card/getCardBySchoolNameAndCardId', getCardBySchoolNameAndCardId);                                   // ✅🔒 get card data by school name and card id
app.post('/card/deleteExpireCardBySchoolName', deleteExpireCardBySchoolName);                                   // ✅🔒 delete expire card by school name


// storage
app.post('/storage/listStorageFiles', listStorageFiles);                                                        // ✅ list all storage files by folder name
app.post('/storage/downloadStorageFile', downloadStorageFile);            

const PORT = process.env.PORT || 3000;

app.use('/api', express.static(path.join(__dirname, 'api')));
app.use('/authen', express.static(path.join(__dirname, '..', 'authen')));
app.use('/firebaseConfig', express.static(path.join(__dirname, '..', 'firebaseConfig')));
app.use('/module', express.static(path.join(__dirname, '..', 'module')));
app.use('/picture', express.static(path.join(__dirname, '..', 'picture')));
app.use('/style', express.static(path.join(__dirname, '..', 'style')));
app.use('/util', express.static(path.join(__dirname, '..', 'util')));

app.get('/', (req, res) => { 
        res.sendFile(path.join(__dirname, '..', 'AdminLanding.html'));
 })

app.get('/:page', (req, res) => {
        
        const { page } = req.params;
        console.log("Navigating to", page)
        const filePath = path.join(__dirname, '..', `${page}`);
      
        // Check if the requested HTML file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            // If the file doesn't exist, put 'html' to troubleshoot.
            res.sendFile(filePath + '.html')
          } else {
            // If the file exists, serve it
            res.sendFile(filePath);
          }
        });
      });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});