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

// API Endpoint for listing files in storage
exports.listStorageFiles = async (req, res) => {
    try {
        const folderPath = "school/data/";
        const storageRef = ref(storage, folderPath);
        const files = await listAll(storageRef);

        // Collect file names
        const fileNames = [];
        files.items.forEach(async (itemRef) => {
            const metadata = await getMetadata(itemRef);
            if (metadata && metadata.name) {
                fileNames.push(metadata.name);
            }
        });

        // Return file names
        res.status(200).json(fileNames);
    } catch (error) {
        console.error("Error listing files:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// API Endpoint for downloading file from storage
exports.downloadStorageFile = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = "school/data/" + fileName;
        const fileRef = ref(storage, filePath);
        const downloadURL = await getDownloadURL(fileRef);

        // Redirect user to download URL
        res.redirect(downloadURL);
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
