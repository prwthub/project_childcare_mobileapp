const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(cors());

const { signIn,
        signUp,
        signOut,
        createFirstPin,
        signInWithPin } = require('./authen.js');

const { getSchool, 
        getSchoolBySchoolName,
        sendEmail } = require('./school.js');

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
        getRoomBySchoolNameAndRoom } = require('./student.js');

const { getStudentCarBySchoolName,
        getStudentCarBySchoolNameAndCarNumber,
        getStudentCarBySchoolNameAndRoom,
        getStudentCarBySchoolNameAndId,
        updateStudentCarStatusBySchoolNameAndId } = require('./studentCar.js');

const { sendCarLocation,
        checkUpdateStatusAndGetStudentLocation,
        getCarLocationAndCalculateDistance } = require('./car.js');

const { createParentCard,
        createVisitorCard,
        getCardBySchoolNameAndCardTypeAndToken,
        getCardBySchoolNameAndCardType,
        getCardBySchoolNameAndCardTypeAndStudentName,
        getCardBySchoolNameAndCardId,
        deleteExpireCardBySchoolName } = require('./card.js');


// ? ===========================================================================================================================================================================
// authen

app.post('/authen/signIn', signIn);                                                                             // ✅ sign in and generate token

app.post('/authen/signUp', signUp);                                                                             // ✅ sign up

app.post('/authen/signOut', signOut);                                                                           // ❌🔒 sign out and revoke token
// ! token แม้ว่าจะ revoke แล้ว แต่ก็ยังสามารถใช้งานได้

app.post('/authen/createFirstPin', createFirstPin);                                                             // ✅🔒 create first pin
// * ต้องมี token และนำไปใช้เมื่อต้องการสร้าง pin ครั้งแรก (เมื่อ login ครั้งแรก)
// ! เมื่อ login จะมี message บอกว่า login ครั้งแรก ให้สร้าง pin ครั้งแรก

app.post('/authen/signInWithPin', signInWithPin);                                                               // ✅🔒 sign in with pin and generate new token
// * ต้องมี token และนำไปใช้เมื่อเข้าสู่ระบบอีกครั้ง เหมือนแอปธนาคาร ที่ต้องใส่ pin ทุกครั้ง



// ? ===========================================================================================================================================================================
// school

app.post('/school/getSchool', getSchool);                                                                       // ✅   get all school data 
// * จะนำไปใช้ใน dropdown เลือก school ตอนสมัคร

app.post('/school/getSchoolBySchoolName', getSchoolBySchoolName);                                               // ✅🔒 get School by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของโรงเรียน

app.post('/school/sendEmail', sendEmail);                                                                       // ✅ send email to school (web)
// * ไม่ต้องมี token และนำไปใช้เมื่อต้องการส่ง email ไปยังโรงเรียน ใช้ในส่วนการทำงานของ web



// ? ===========================================================================================================================================================================
// initial 

app.post('/initial/teacher/getTeacherInitialBySchoolNameAndEmail', getTeacherInitialBySchoolNameAndEmail);      // ✅🔒✉️ get teacher data by ( schoolName, email )
// * ต้องมี token และ email ของ user token ต้องเป็น email เดียวกันกับ req ใช้เมื่อต้องการดูข้อมูลของครู (ทำเผื่อไว้)

app.post('/initial/driver/getDriverInitialBySchoolNameAndEmail', getDriverInitialBySchoolNameAndEmail);         // ✅🔒✉️ get driver data by ( schoolName, email )
// * ต้องมี token และ email ของ user token ต้องเป็น email เดียวกันกับ req ใช้เมื่อต้องการดูข้อมูลของครู (ทำเผื่อไว้)

app.post('/initial/parent/getParentInitialBySchoolNameAndEmail', getParentInitialBySchoolNameAndEmail);         // ✅🔒✉️ get student data by ( schoolName, email )
// * ต้องมี token และ email ของ user token ต้องเป็น email เดียวกันกับ req ใช้เมื่อต้องการดูข้อมูลของครู (ทำเผื่อไว้)



// ? ===========================================================================================================================================================================
// announcement

app.post('/announcement/getAnnouncementBySchoolName', getAnnouncementBySchoolName);                             // ✅🔒 get all announcement data by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของประกาศของโรงเรียน

app.post('/announcement/getAnnouncementBySchoolNameAndId', getAnnouncementBySchoolNameAndId);                   // ✅🔒 get announcement data by ( schoolName, Id )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของประกาศของโรงเรียน แบบระบุไอดี



// ? ===========================================================================================================================================================================
// teacher

app.post('/teacher/getTeacherBySchoolName', getTeacherBySchoolName);                                            // ✅🔒 get all teacher data by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของครูทุกคนในโรงเรียน

app.post('/teacher/getTeacherBySchoolNameAndTeacherEmail', getTeacherBySchoolNameAndTeacherEmail);              // ✅🔒 get teacher data by ( schoolName, teacherEmail )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของครู โดยระบุ email

app.post('/teacher/getTeacherBySchoolNameAndTeacherId', getTeacherBySchoolNameAndTeacherId);                    // ✅🔒 get teacher data by ( schoolName, teacherId )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของครู โดยระบุ id

app.post('/teacher/getTeacherBySchoolNameAndClassRoom', getTeacherBySchoolNameAndClassRoom);                    // ✅🔒 get all teacher data by ( schoolName, classRoom )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของครูทุกคนในโรงเรียน ที่ประจำชั้นห้องนี้

app.post('/teacher/getTeacherBySchoolNameAndTeachingRoom', getTeacherBySchoolNameAndTeachingRoom);              // ✅🔒 get all teacher data by ( schoolName, teachingRoom )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของครูทุกคนในโรงเรียน ที่สอนห้องนี้



// ? ===========================================================================================================================================================================
// driver

app.post('/driver/getDriverBySchoolName', getDriverBySchoolName);                                               // ✅🔒 get all driver data by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของคนขับรถทุกคนในโรงเรียน

app.post('/driver/getDriverBySchoolNameAndDriverEmail', getDriverBySchoolNameAndDriverEmail);                   // ✅🔒 get driver data by ( schoolName, driverEmail )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของคนขับรถ โดยระบุ email

app.post('/driver/getDriverBySchoolNameAndDriverId', getDriverBySchoolNameAndDriverId);                         // ✅🔒 get driver data by ( schoolName, driverId )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของคนขับรถ โดยระบุ id

app.post('/driver/getDriverBySchoolNameAndCarNumber', getDriverBySchoolNameAndCarNumber);                       // ✅🔒 get driver data by ( schoolName, carNumber )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของคนขับรถ โดยระบุ carNumber



// ? ===========================================================================================================================================================================
// student , room

app.post('/student/getStudentBySchoolName', getStudentBySchoolName);                                            // ✅🔒 get all student data by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของนักเรียนทุกคนในโรงเรียน

app.post('/student/getStudentBySchoolNameAndRoom', getStudentBySchoolNameAndRoom);                              // ✅🔒 get all student data by ( schoolName, studentRoom )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของนักเรียนทุกคนในโรงเรียน โดยระบุห้อง

app.post('/room/getRoomBySchoolName', getRoomBySchoolName);                                                     // ✅🔒 get all room name by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของห้องเรียนทั้งหมดในโรงเรียน

app.post('/room/getRoomBySchoolNameAndRoom', getRoomBySchoolNameAndRoom);                                       // ✅🔒 get room data by ( schoolName, studentRoom )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของห้องเรียนในโรงเรียน โดยระบุห้อง



// ? ===========================================================================================================================================================================
// studentCar , car

app.post('/studentCar/getStudentCarBySchoolName', getStudentCarBySchoolName);                                   // ✅🔒 get all student car data by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของนักเรียนที่ขึ้นรถรับส่งทุกคนในโรงเรียน

app.post('/studentCar/getStudentCarBySchoolNameAndCarNumber', getStudentCarBySchoolNameAndCarNumber);           // ✅🔒 get all student car data by ( schoolName, carNumber )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของนักเรียนที่ขึ้นรถรับส่งทุกคนในโรงเรียน โดยระบุเบอร์รถ

app.post('/studentCar/getStudentCarBySchoolNameAndRoom', getStudentCarBySchoolNameAndRoom);                     // ✅🔒 get all student car data by ( schoolName, studentRoom )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของนักเรียนที่ขึ้นรถรับส่งทุกคนในโรงเรียน โดยระบุห้องเรียน

app.post('/studentCar/getStudentCarBySchoolNameAndId', getStudentCarBySchoolNameAndId);                         // ✅🔒 get student car data by ( schoolName, studentId )
// * ต้องมี token และนำไปใช้เมื่อต้องการแสดงข้อมูลของนักเรียนที่ขึ้นรถรับส่ง โดยระบุ id

app.post('/studentCar/updateStudentCarStatusBySchoolNameAndId', updateStudentCarStatusBySchoolNameAndId);       // ✅🔒 update student car status by ( schoolName, studentId, goStatus, backStatus )              
// * ต้องมี token และนำไปใช้เมื่อต้องการจะอัพเดท status ของนักเรียนที่ขึ้นรถรับส่ง โดยระบุ id และ status ที่ต้องการอัพเดท
// ! goStatus มี ไปกับรถรับส่ง, ไปกับผู้ปกครอง, ไม่มาเรียน
// ! backStatus มี กลับกับรถรับส่ง, กลับกับผู้ปกครอง, ไม่มาเรียน



// ? ===========================================================================================================================================================================
// car location

app.post('/car/sendCarLocation', sendCarLocation);                                                              // ✅🔒 send car location to realtime database ( schoolName, carNumber, lat, long )
// * ต้องมี token และนำไปใช้เมื่อต้องการส่งตำแหน่งรถไปยัง firebase realtime database 

app.post('/car/checkUpdateStatusAndGetStudentLocation', checkUpdateStatusAndGetStudentLocation);                // ✅🔒 check update status and get student location by ( schoolName, carNumber )
// * check update = true  -> get new address -> get lat,long -> save,get student location 
// * check update = false ->				                         ->   get student location	  
// * ต้องมี token และนำไปใช้เมื่อเข้าสู่หน้ารถรับส่ง โดยจะทำการเช็คก่อนว่า address ของนักเรียนมีการเปลี่ยนแปลงหรือไม่
// *  ถ้ามีจะทำการดึง lat,long ของ address ใหม่ เก็บไว้ใน firestore และนำไปใช้ต่อ

app.post('/car/getCarLocationAndCalculateDistance', getCarLocationAndCalculateDistance);                        // ✅ get car location and calculate distance by ( schoolName, carNumber, addressStudents )
// * ไม่ต้องมี token และนำไปใช้เมื่อต้องการดึงตำแหน่งรถ และคำนวนระยะห่างระหว่างรถกับที่อยู่ของนักเรียนทุกคน
// * โดยระบุ schoolName, carNumber, addressStudents (ได้จาก checkUpdate...)


// ! parent ใช้ checkUpdateStatusAndGetStudentLocation ->      getCarLocationAndCalculateDistance
// ! driver ใช้ checkUpdateStatusAndGetStudentLocation -> sendCarLocation, getCarLocationAndCalculateDistance



// ? ===========================================================================================================================================================================
// card

app.post('/card/createParentCard', createParentCard);                                                           // ✅🔒✉️ create parent card ( schoolName, parentEmail, parentName, studentId, parentImage )
// * ต้องมี token และ email ของ user token ต้องเป็น email เดียวกันกับ req ใช้เมื่อต้องการสร้างบัตรสำหรับผู้ปกครอง
// ! รูปจำเป็นต้องมีการแปลงเป็น base64 ก่อน 

app.post('/card/createVisitorCard', createVisitorCard);                                                         // ✅🔒✉️ create visitor card ( schoolName, visitorName ,parentEmail, parentName, studentId, visitorImage )
// * ต้องมี token และ email ของ user token ต้องเป็น email เดียวกันกับ req ใช้เมื่อต้องการสร้างบัตรสำหรับผู้มาติดต่อแทน
// ! รูปจำเป็นต้องมีการแปลงเป็น base64 ก่อน 

app.post('/card/getCardBySchoolNameAndCardTypeAndToken', getCardBySchoolNameAndCardTypeAndToken);               // ✅🔒 get all card data by ( schoolName, cardType ) and token
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของบัตรทั้งหมดที่สร้างโดยเจ้าของ token และระบุประเภทบัตร (all, parent, visitor)

app.post('/card/getCardBySchoolNameAndCardType', getCardBySchoolNameAndCardType);                               // ✅🔒 get all card data by ( schoolName, cardType )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของบัตรทั้งหมดในโรงเรียน โดยระบุประเภทบัตร (all, parent, visitor)

app.post('/card/getCardBySchoolNameAndCardTypeAndStudentName', getCardBySchoolNameAndCardTypeAndStudentName);   // ✅🔒 get all card data by ( schoolName, cardType, studentName )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของบัตรทั้งหมดในโรงเรียน โดยระบุประเภทบัตร (all, parent, visitor) และชื่อนักเรียน

app.post('/card/getCardBySchoolNameAndCardId', getCardBySchoolNameAndCardId);                                   // ✅🔒 get card data by ( schoolName, cardId )
// * ต้องมี token และนำไปใช้เมื่อต้องการดูข้อมูลของบัตร โดยระบุ id

app.post('/card/deleteExpireCardBySchoolName', deleteExpireCardBySchoolName);                                   // ✅🔒 delete expire card by ( schoolName )
// * ต้องมี token และนำไปใช้เมื่อต้องการลบบัตรของผู้มาติดต่อแทนที่หมดอายุ



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














const { webGetTeacherBySchoolName,
        webGetDriverBySchoolName,
        webGetStudentBySchoolNameAndStudentRoom,
        webGetStudentCarBySchoolNameAndCarNumber,
        getImageBySchoolNameAndTypeAndId } = require('./web.js');

app.post('/web/teacher/getTeacherBySchoolName', webGetTeacherBySchoolName);

app.post('/web/driver/getDriverBySchoolName', webGetDriverBySchoolName);

app.post('/web/student/getStudentBySchoolNameAndStudentRoom', webGetStudentBySchoolNameAndStudentRoom);

app.post('/web/studentCar/getStudentCarBySchoolNameAndCarNumber', webGetStudentCarBySchoolNameAndCarNumber);

app.post('/image/getImageBySchoolNameAndTypeAndId', getImageBySchoolNameAndTypeAndId);