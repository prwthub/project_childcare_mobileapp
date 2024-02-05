import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

Future initFirebase() async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: FirebaseOptions(
            apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
            authDomain: "perforkid-application.firebaseapp.com",
            projectId: "perforkid-application",
            storageBucket: "perforkid-application.appspot.com",
            messagingSenderId: "741346506533",
            appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
            measurementId: "G-TE2LC6M05D"));
  } else {
    await Firebase.initializeApp();
  }
}
