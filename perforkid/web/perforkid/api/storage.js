const { db } = require("../util/admin.js");

// Import Firebase modules
const { initializeApp } = require("firebase/app");
const { getStorage, ref, listAll, getMetadata, getDownloadURL } = require("firebase/storage");

// Initialize Firebase app
const firebaseConfig = {
    apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
    authDomain: "perforkid-application.firebaseapp.com",
    projectId: "perforkid-application",
    storageBucket: "perforkid-application.appspot.com",
    messagingSenderId: "741346506533",
    appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
    measurementId: "G-TE2LC6M05D"
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// get Files by ( schoolName, folderName )
exports.listStorageFiles = async (req, res) => {
    const { schoolName, folderName } = req.body;
    try {
        const folderPath = "school/" + schoolName + "/" + folderName;
        const storageRef = ref(storage, folderPath);
        const files = await listAll(storageRef);

        // Collect file names asynchronously using Promise.all
        const fileNamesPromises = files.items.map(async (itemRef) => {
            const metadata = await getMetadata(itemRef);
            if (metadata && metadata.name) {
                return metadata.name;
            }
        });

        // Wait for all file name promises to resolve
        const fileNames = await Promise.all(fileNamesPromises);

        // Return file names
        res.status(200).json(fileNames);
    } catch (error) {
        console.error("Error listing files:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// download File by ( schoolName, folderName, fileName )
exports.downloadStorageFile = async (req, res) => {
    const { schoolName, folderName, fileName } = req.body;
    try {
        const filePath = "school/" + schoolName + "/" + folderName + "/" + fileName;
        const fileRef = ref(storage, filePath);
        const downloadURL = await getDownloadURL(fileRef);

        // Redirect user to download URL
        res.redirect(downloadURL);
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
