const { EmailClient } = require("@azure/communication-email");
const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");

const functions = require("./function.js");


// ✅ get School 
exports.getSchool = async (req, res) => {
    try {
        const schoolsRef = db.collection('school');
        const snapshot = await schoolsRef.get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        console.log(data);
        return res.status(200).json({ schoolData: data });
    } catch (error) {
        console.error("Error getting schools:", error);
        return res.status(500).json({ error: "Error getting schools." });
    }
};



// ✅🔒 get School by ( schoolName )
exports.getSchoolBySchoolName = async (req, res) => {
    const { schoolName } = req.body; 
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // get school by school name
        const schoolsRef = db.collection('school');
        const querySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (querySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(data);
        return res.status(200).json({ schoolData: data });
    } catch (error) {
        console.error("Error getting school by name:", error);
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            return res.status(500).json({ error: "Error getting school by name." });
        }
    }
};



// ✅ send email (web)
exports.sendEmail = async (req, res) => {
    const { schoolName, email, schoolCode, schoolAdminCode } = req.body; 

    try {
        console.log("Send Email initiated")
        const connectionString = `endpoint=https://perforkidcommunicationservice.japan.communication.azure.com/;accesskey=n/2c0Xtpx91TsoJ+caO2PBuCuHT+a6WRATudOWG+8OpCZKRsb9FgYit3idlSu3zAF0Rt1RfaBEgCYuyRjCUnWQ==`;
        const client = new EmailClient(connectionString);

        const message = {
            senderAddress: "DoNotReply@99c6f0e9-0ccb-482b-8929-a38f6d0ec6a9.azurecomm.net",
            content: {
                subject: `Thank you very much for using Perforkid Service. ${schoolName}`,
                plainText: `Management has never been easier. Glad to have you here ${schoolName}
                \nYour email "${email}" has been registered successfully.
                \nPlease set up everything before sharing code to Parents and others"
                \nYour School Code (Share this to everyone after you finish setting up) : ${schoolCode}
                \nYour Super Admin School Code (Share this to people trusted with controlling the system) : ${schoolAdminCode}`
            },
            recipients: {
                to: [
                    {
                        address: email,
                        displayName: "Perforkid Backend Service",
                    },
                ],
            },
        };

        const poller = await client.beginSend(message);
        const response = await poller.pollUntilDone();
        console.log(response);
        return res.status(200).send("Email sent successfully.");
    } catch (error) {
        console.error("Failed to send email:", error);
        return res.status(500).send("Failed to send email.", error);
    }
}
