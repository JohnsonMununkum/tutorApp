import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Component, Injector, OnInit, runInInjectionContext } from '@angular/core';
//imports tutorservice, tutor, router auth & toastservice 
import { TutorService } from '../services/tutor.service';  
import { Tutor } from '../models/tutor.model'; 
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';
import { Review } from '../models/review.model';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
  standalone: false
})
export class ReviewPage implements OnInit {
  //variables
  //rating starts from 0
  tutorUid: string = '';
  rating: Number =  0;
  reviewText: string = '';

  tutor: Tutor | null = null;

  //consturctor takes in  tutorservice, tutor, router auth & toastservice 
  constructor(private route: ActivatedRoute,private afAuth: AngularFireAuth,public tutorService: TutorService,private injector: Injector, private router: Router, private cdRef: ChangeDetectorRef, private toast: ToastService) { }

  ngOnInit() {
     //get the data passed during navigation
     const navigation = this.router.getCurrentNavigation();
     //check to see if tutors data was passed during navigation
     //if it was set the tutor variable from navigation & its uid
     if (navigation?.extras.state?.['tutor']) {
      this.tutor = navigation.extras.state['tutor'];
      this.tutorUid = this.tutor?.uid || '';
      //get the updated info
      this.updateInfo();
      console.log('Received tutor:', this.tutor);
      console.log('Is reviews an array', Array.isArray(this.tutor?.reviews));
    }
  }

//method to submiy a review
submitReview() {
  //get the current user
  this.afAuth.currentUser.then(user => {
    if (user) {
      //get the users username from email if display name is not there
      const username = user.email?.split('@')[0];
      //creating a review text, rating number uid of user & username
      const review ={
        text: this.reviewText,
        rating: this.rating as number,
        reviewerUid: user.uid,
        reviewer: user.displayName || username || ''
      };

      //runInInjectionContext to see if dependency injection is working
      runInInjectionContext(this.injector, () => {
        //calling the tutorservice to post the review
      this.tutorService.postReview(this.tutorUid, review).then(response => {
        //update tutor info if review was posted successfully else return the response message
        if (response.success) {
          this.updateInfo()
           this.toast.showToast('Posted successful!', 'success');
        } else {
           this.toast.showToast(response.message, 'success');
        }
      });
    })
    }
  });
}

//method to update user info
updateInfo(){
  runInInjectionContext(this.injector, () => {
    //calling the tutorservice to get the updated tutor info by uid
    this.tutorService.getUserByUid(this.tutor?.uid).subscribe(users => {
      //update tutor with new data
    this.tutor = users
    //change detetection yo update the view w the new data
    this.cdRef.detectChanges(); 
  });
})
}

}
