import { Component, OnInit } from '@angular/core';
//adding imports 
//firebase setup, camera for verification & authentication service
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
  standalone:false
})
export class VerifyPage implements OnInit {
  //variables 
  photoUrl: string | null = null;
  uploading = false;
  message = '';
  userId = '';

  //constuctor that takes in firebase, auth, storage, firestore & auth 
  constructor(
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private router: Router,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit() {

      //checking if the user is logged in 
      //if not logged in direct user to login page
      this.afAuth.authState.subscribe(user => {
        if (user) {
         this.userId= user.uid

        } else {
          this.router.navigate(['/login']);
        }
      });

    
  }


  //get image of user id using camera 
  async captureID() {
    try {
      //using capcitor plugin to take the pic
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
  
      //save the image url
      this.photoUrl = image.dataUrl!;
      // clearing any messages from before
      this.message = '';
      //if an error occurs print to console
    } catch (error) {
      console.error('Camera error:', error);
      this.message = 'Unable to access camera.';
    }
  }
  

  //upload the image to Firebase storage 
  async uploadID() {
    //if there is no photo send thi message
    if (!this.photoUrl) {
      this.message = 'No photo captured.';
      return;
    }

    //there is a phtot & uploading set to true
    this.uploading = true;
    const user = await this.afAuth.currentUser;
    //if user not logged return
    if (!user) return;

    //creating a filepath for the image using users info
    const filePath = `verifications/${user.uid}/${user.uid}.jpg`;
    //creating reference to the location
    const fileRef = this.storage.ref(filePath);
    //upload thee image
    const task = fileRef.putString(this.photoUrl, 'data_url');

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
        // saving the verification details in firebase
          this.firestore.collection('verifications').doc(user.uid).set({
            uid: user.uid,
            idUrl: url,
            status: 'pending',
            uploadedAt: new Date()
          });
          //set isloading to false to clear the photo image
          this.uploading = false;
          this.message = 'ID uploaded. Awaiting verification.';
          this.photoUrl = null;
        });
      })
    ).subscribe();

    //direct user to home if verified
    this.auth.verifyUser(this.userId, () => {
      this.router.navigate(['/home']);
    })
  }
}


