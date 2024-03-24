const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, listAll, getMetadata, getDownloadURL } = require("firebase/storage");

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);


// ✅ get Files by ( schoolName, folderName )
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
        res.status(200).json({ files: fileNames });
    } catch (error) {
        console.error("Error listing files:", error);
        res.status(500).json({ error: "Error getting files." });
    }
}


// ?? download File by ( schoolName, folderName, fileName )
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
        res.status(500).json({ error: "Error downloading file." });
    }
}
