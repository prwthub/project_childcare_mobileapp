var admin = require("firebase-admin");

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

var serviceAccount = {
  "type": "service_account",
  "project_id": "perforkid-application",
  "private_key_id": "e4ae95ea8bce2722b243ffea3e7d5eb1d075d6f1",
  "private_key": privateKey,
  "client_email": "service-account-665@perforkid-application.iam.gserviceaccount.com",
  "client_id": "106958719222707816086",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account-665%40perforkid-application.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
module.exports = { admin, db };
