//injectable defines the class as a service & firebase to get realtime database updates 
//replaysubject cahces & replays the updated data for new users
import { Injectable } from '@angular/core';
import { getDatabase, ref, set, get, push, onValue } from 'firebase/database';
import { ReplaySubject } from 'rxjs'; 

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  //variables 
  db: any;
  //created an array to hold messages 
  messagesSubject: ReplaySubject<any[]> = new ReplaySubject(1); 

  constructor() {
    //initalize firebase realtime database & load all messages 
    this.db = getDatabase();
    this.loadMessages(); 
  }

  //method to sendmessage
  sendMessage(user: string | undefined | null, message: string): void {
    //get a reference for the new message
    const messagesRef = ref(this.db, 'messages');
    const newMessageRef = push(messagesRef); 
    
    //use Anonymous if theres no name 
    const userName = user ?? 'Anonymous'; 

    //setting the new message in the firebase data
    //saves the username, message & time
    set(newMessageRef, {
      userName: userName,     
      text: message,           
      timestamp: Date.now(),  
    });
  }

  //method to load messages from firebase database
  loadMessages(): void {
    const messagesRef = ref(this.db, 'messages');

    //real time listener 
    onValue(messagesRef, (snapshot) => {
       //check if there are any messages
       //if there are get them
      if (snapshot.exists()) {
        const messages = snapshot.val();
        console.log("Real-time messages:", messages);

        //put the  firebase data into an array of messages
        //get the messageid , username, text & time
        const messagesArray = Object.keys(messages).map((key) => ({
          id: key,                 
          userName: messages[key].userName, 
          text: messages[key].text,        
          timestamp: messages[key].timestamp, 
        }));

        //output all the message
        this.messagesSubject.next(messagesArray);
      } else {
        //if there are no message ouput an empty array
        this.messagesSubject.next([]);
      }
    });
  }

  //method to getmessges
  getMessages() {
    //returning them as an observable
    return this.messagesSubject.asObservable(); 
  }
}
