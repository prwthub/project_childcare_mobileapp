var admin = require("firebase-admin");

var serviceAccount = require("./perforkid.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
module.exports = { admin, db };
