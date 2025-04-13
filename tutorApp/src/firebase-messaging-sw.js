//loads the Firebase App library which allows to inatilise & setup firebase 
//oads This loads the Firebase Messaging library allows the service worker to handle push notifications and background messages
importScripts('https://www.gstatic.com/firebasejs/9.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.9.1/firebase-messaging-compat.js');

//firebase setup
firebase.initializeApp({
    apiKey: "AIzaSyB99oXSEEEkotTXb9dbUnbaaSCAE_RG9Us",
    authDomain: "tutor-7e57e.firebaseapp.com",
    projectId: "tutor-7e57e",
    storageBucket: "tutor-7e57e.firebasestorage.app",
    messagingSenderId: "879563118009",
    appId: "1:879563118009:web:074714e1e0deea98915268",
    measurementId: "G-PYT78PPNED"
});


//get firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message ", payload);

  //get notification title from the payload
  const notificationTitle = payload.notification.title;

  const notificationOptions = {
    body: payload.notification.body,
  };

  //displays the notification using the service worker
  self.registration.showNotification(notificationTitle, notificationOptions);
});