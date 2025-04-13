import { ChangeDetectorRef, Component, Injector, OnInit, runInInjectionContext } from '@angular/core';
//import the tutorservice, tutor, router, authentication, user, review , pushnotifications
import { TutorService } from '../services/tutor.service';
import { Tutor } from '../models/tutor.model';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';
import { Review } from '../models/review.model';
import { PushNotificationsService } from '../services/push-notifications.service';
import { ToastService } from '../services/toast.service';
//javascript library that add touch jesture to the home page
import 'hammerjs';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false
})
export class HomePage implements OnInit {
  //created empty array to hold the tutor data
  tutors: Tutor[] = []; 

  isLoggedIn: boolean = false;
  isVerified: boolean = false;

  //consturctor takes in authentiction, tutorservice, router, pushnotifications & toastservice
  constructor(private afAuth: AngularFireAuth,private authService: AuthService,public tutorService: TutorService,private injector: Injector, private router: Router, private cdRef: ChangeDetectorRef,private pushNotificationsService: PushNotificationsService,private toast: ToastService) { }

  ngOnInit() {
   
      //check to see if user is  logged in
      //if they are set islogged in to true
      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.isLoggedIn = true;  

          this.pushNotificationsService.init(user)

          //get verification status
          this.authService.getVerificationStatus(user.uid, (isVerified: boolean) => {
            this.isVerified = isVerified;
          });

        } else {
          //if user is logged out set isloggedin to false 
          this.isLoggedIn = false;  
        }
      });

  
    runInInjectionContext(this.injector, () => {
    
      this.tutorService.getAllUsers().subscribe(users => {
        this.tutors = users
        this.cdRef.detectChanges();
      });
      
      
    });
 
  }


    //gesture contol to tap on a tutors profile
    onProfileTap(tutor: Tutor) {

      //rotating screen
      const body = document.body;
      body.classList.toggle('rotate-screen'); 

      console.log("profile tapped")

      var name = tutor.name || tutor.uid
  
      const serializableTutor = JSON.parse(JSON.stringify(tutor));
      this.router.navigate(['/profile/'+ name], { state: { tutor: serializableTutor } });
    
    }


    //logout set isloggedin to false & direct them to login page
    logout() {
      this.afAuth.signOut().then(() => {
        this.isLoggedIn = false;  
        this.router.navigate(['/login']); 
      }).catch(error => {
        console.error('Error during logout: ', error);
      });
    }

    //method to go to reviews 
    goToReview(tutorUid: string) {
      this.router.navigate(['/review', tutorUid]);
    }
    

}
