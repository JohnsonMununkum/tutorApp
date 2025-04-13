import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
//imports router , chatservice, pushnotifcations, & authentication
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {
  //variables
  isLoggedIn: boolean = false;
  //messages array to hold messages 
  messages: any[] = []; 
  message: string = '';
  userName: string | null = '';

  //consturctor that takes in firebase, cchatservice , routr & pushnotifications
  constructor(private afAuth: AngularFireAuth, private chatService: ChatService,private router: Router, private pushNotificationsService: PushNotificationsService,private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {

      //check to see if user is logged in
      //if they are set isloggedin yo true
      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.isLoggedIn = true;  
          const username = user.email?.split('@')[0];
          this.userName = user.displayName || username || ''; 

         //getting real time chat updates 
          this.chatService.getMessages().subscribe((msg) => {
            this.messages = msg;
            console.log('Messages from service:', msg); 
            console.log(this.message)
          });

          this.pushNotificationsService.init(user)

          this.cdRef.detectChanges();  

        } else {
          //if user is logged out set isloffedin to false
          this.isLoggedIn = false;  
        }
      });


  
  }

  //if user is logged in send message with their name 
  sendMessage(): void {
    if (this.message.trim() && this.isLoggedIn) {
      this.chatService.sendMessage(this.userName, this.message);
      this.message = '';
    }
  }


    //if user logs out , set isloggedin to false & direct them to login page
    logout() {
      this.afAuth.signOut().then(() => {
        this.isLoggedIn = false;  
        this.router.navigate(['/login']);  
      }).catch(error => {
        console.error('Error during logout: ', error);
      });
    }

}
