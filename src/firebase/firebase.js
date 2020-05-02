import firebase from "firebase";
import "firebase/auth";
import "firebase/storage";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB269j_WlqcopSD1aV-u7YeD4mdJpFqtiI",
  authDomain: "slack-dupe.firebaseapp.com",
  databaseURL: "https://slack-dupe.firebaseio.com",
  projectId: "slack-dupe",
  storageBucket: "slack-dupe.appspot.com",
  messagingSenderId: "423637207426",
  appId: "1:423637207426:web:f843633ebbb1aeb46e679b",
  measurementId: "G-LBBR9ZYB82",
};
firebase.initializeApp(firebaseConfig);

export default firebase;
