import { ChangeDetectorRef, Component, Injector, OnInit, runInInjectionContext } from '@angular/core';
//imports firebase, tutorservice, router authntiction & push notification
import { Task } from '../models/task.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TutorService } from '../services/tutor.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { PushNotificationsService } from '../services/push-notifications.service';

@Component({
  selector: 'app-task-posting',
  templateUrl: './task-posting.page.html',
  styleUrls: ['./task-posting.page.scss'],
  standalone: false
})
export class TaskPostingPage implements OnInit {
  //variables
  isLoggedIn: boolean = false;
  //empty list to hold tasks
  tasks: Task[] = [];

  userName: String = '';
  userRole: String = '';

  //task contains title, description, userid, name
  task: Task = {
    title: '',
    description: '',
    userId: '',
    userName: ''
  };

  //constructor that holds tutorservice , authentication, pushnotifications, injector
  constructor(private afAuth: AngularFireAuth, public tutorService: TutorService, private injector: Injector, private router: Router, private cdRef: ChangeDetectorRef, private toastService: ToastService, private authService: AuthService, private fcm: PushNotificationsService) { }


  ngOnInit() {


    this.afAuth.onAuthStateChanged(user => {
      console.log('Auth state changed:', user);

      //user logged in set islogged in to true 
      if (user) {

        this.isLoggedIn = true; 

        this.userName = user.displayName || '';

        //get the role of the user 
        runInInjectionContext(this.injector, () => {
          this.authService.getRole(user.uid).subscribe({
            next: (role) => {
              this.userRole = role;
              console.log('Fetched role:', role);
              this.cdRef.detectChanges();
            },
            error: (err) => {
              console.error('Error fetching role:', err);
            }
          });
        });
      } else{
        this.isLoggedIn = false;
      }
    });


    //task array updated w data from firestore
    runInInjectionContext(this.injector, () => {
      this.tutorService.getTasks().subscribe(tasks => {
        this.tasks = tasks;  
        this.cdRef.detectChanges(); 
      });
    })

    console.log(' role:', this.userRole);

  }


  //post the tutors service 
  postTask() {

    //user has to be authenticated to show uid or displyname
    this.afAuth.currentUser.then(user => {
      if (user) {
        const username = user.email?.split('@')[0];
        const newTask = {
          ...this.task,
          userId: user.uid,
          userName: user.displayName || username || "",
        };

        //calling the tutor service to add the task
        this.tutorService.addTask(newTask)
          .then(() => {
            console.log('Task added successfully!');
            const tokens = this.authService.studentTokens
            this.fcm.sendNotification(tokens, user.displayName || username, 'has posted a task!')
              .then(response => {
                console.log('Notification sent successfully:', response);
              })
              .catch(error => {
                console.error('Notification failed:', error);
              });


            //task added successfully
            this.toastService.showToast('Task added successfully!', 'success');
          })
          .catch(error => {
            console.error('Error adding task: ', error);

            //task was not added successfully
            this.toastService.showToast('Error adding task: ' + error, 'danger');
          });
      } else {
        //if user is not logged in
        console.error('No user found');
        this.toastService.showToast('User not logged in', 'danger');
      }
    }).catch(error => {
      console.error('Error fetching user: ', error);
      this.toastService.showToast('Error fetching user: ' + error, 'danger');
    });

  }


   //logout
   //login set to false & direct user to login page
   logout() {
    this.afAuth.signOut().then(() => {
      this.isLoggedIn = false;  
      this.router.navigate(['/login']);  
    }).catch(error => {
      console.error('Error during logout: ', error);
    });
  }

}
