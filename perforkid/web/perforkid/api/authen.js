const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
    authDomain: "perforkid-application.firebaseapp.com",
    projectId: "perforkid-application",
    storageBucket: "perforkid-application.appspot.com",
    messagingSenderId: "741346506533",
    appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
    measurementId: "G-TE2LC6M05D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ sign in and generate token
exports.signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Sign in user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Generate JWT token
        const token = await user.getIdToken();

        // Return token in response
        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error signing in:", error);
        return res.status(500).json({ error: "Failed to sign in" });
    }
};