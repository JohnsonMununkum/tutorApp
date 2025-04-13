import { Injectable, Injector, NgZone, runInInjectionContext } from '@angular/core';
//imports auth, router, firestores rxjs operators, user, tutor & toastservice
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore'; 
import { map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ToastService } from './toast.service';
import { Tutor } from '../models/tutor.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //method to get access token
    getAccessTokens(): string | PromiseLike<string> {
        throw new Error('Method not implemented.');
    }
   //variables 
  user: Observable<firebase.default.User | null>;
  userRole: string | null | undefined;
  //created an empty array to hold student tokens
  studentTokens: string[] = [];

  //constructor takes in auth, router firestire, & toatservice
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore, 
    private toastService: ToastService,
    private injector: Injector
  ) {
    this.user = afAuth.authState;
  }

  //regiser method 
  //creates a new user with username, email, password, role & subject
  async register(userName: string,email: string, password: string, role: string, subjectName: string): Promise<any> {
    try {
      //allows the function to run eith a angular injection
      return await runInInjectionContext(this.injector, async () => {
        //using firebase auth to createUserWithEmail
        const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
     

        if (user) {
          //save the user
          this.userRole = role
       
          //create user data uisng Tutor
          const userData: Tutor = {
            email: user.email || '',
            role: role,
            uid: user.uid,
            name: userName,
            subject: subjectName,
            verified:false
          };

          //saving userdata in frestore under users collection
          await runInInjectionContext(this.injector, async () => {
            return this.firestore.collection('users').doc(user.uid).set(userData);
          })

        
        //update the user display name in firebase auth
        user.updateProfile({
          displayName: userName,
        }).then(() => {
          console.log('User display name set to:', userName);
        }).catch((error) => {
          console.error('Error updating display name:', error);
        });

    
          //show success toast using toastservice
          this.toastService.showToast('Registration successful!', 'success');

          return userCredential;
        }

        //return null if there is no no user 
         return null; 
      });
    } catch (error) {
      console.error('Error registering user:', error);
      this.toastService.showToast(""+error, 'danger');
      throw error;
    }
  }

//login method
async login(email: string, password: string): Promise<any> {
  return this.afAuth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      //throw error if there are no users
      if (!user) {
        throw new Error('No user found');
      }

      this.toastService.showToast('Login successful!', 'success');
      
     runInInjectionContext(this.injector, async () => {
      // get users role from firestore after login
      // return the role and user details
      return this.firestore.collection('users').doc(user.uid).get()
        .toPromise()
        //get user data if document exists
        .then(doc => {
          if (doc && doc.exists) {
            const userData = doc.data() as User; 
            const role = userData.role;
            this.userRole = role
            //direct user to taskposting page if they are a tuttor
            //& home page if they are a student
            const path = role === "Tutor" ? "/task-posting" : "/home";
            this.router.navigateByUrl(path);
            return { role, user: userCredential.user }; 
          } else {
            throw new Error('User data not found');
          }
        });
    })
  })
    .catch(error => {
      console.error('Login failed', error);
      this.toastService.showToast(""+error, 'danger');
      throw error;
    });
}

  //logout method
  logout(): Promise<void> {
    return this.afAuth.signOut();
  }

  //get current user
  getCurrentUser(): Observable<any> {
    return this.afAuth.authState;
  }

  //get role
  getRole(userId: string): Observable<string> {
    return runInInjectionContext(this.injector, () => {
      return this.firestore.collection('users').doc(userId).valueChanges().pipe(
        map((data: any) => data?.role)
      );
    });
  }
  
  //get student tokens
  fetchStudentsFcmToken(){
    runInInjectionContext(this.injector, () => {
            //get the students collection
            this.firestore.collection('students').get().subscribe({
              next: (querySnapshot) => {
                const tokens: string[] = [];
                //loop through each document
                querySnapshot.forEach(doc => {

                  const data = doc.data() as { fcmToken?: string };
                  //if a token exists add it to the tokens array
                  if (data.fcmToken) {
                    tokens.push(data.fcmToken);
                  }
                });
               this.studentTokens = tokens;
                console.log("All student tokens fetched:", this.studentTokens);
              },
              error: (err) => {
                console.error("Error fetching student tokens:", err);
              }
   
            })         })
  }

  //update token method
  //update studnt token in firestore
  updateFcmToken(user: firebase.default.User, token: String | null){
    runInInjectionContext(this.injector, () => {
      //update the students collection for a given user uid with their new token
      this.firestore.collection('students').doc(user.uid).set({
          fcmToken: token
        }, { merge: true }).then(() => {
          console.log("Token saved to Firestore.");
        }).catch(err => {
          console.error("Failed to save token to Firestore:", err);
        })
      })
  }


  //verify user method
  //make the user verified in firestore 
  verifyUser(userId: string, callback?: () => void) {
    runInInjectionContext(this.injector, () => {
      this.firestore.collection('users').doc(userId).update({
        verified: true
      }).then(() => {
        this.toastService.showToast('Verified successfully!', 'success');
  
        if (callback) {
          callback();
        }
  
      }).catch(err => {
        console.error('Verification failed:', err);
      });
    });
  }
  
  //check firestore to se if user is verified 
  //if they are verified callbsck = true if not callback = false 
  getVerificationStatus(userId: string, callback: (verified: boolean) => void) {
    runInInjectionContext(this.injector, () => {
      this.firestore.collection('users').doc(userId).get().subscribe(doc => {
        if (doc.exists) {
          const data = doc.data() as Tutor;
          callback(data?.verified === true);
        } else {
          callback(false);
        }
      }, error => {
        console.error('Error fetching user:', error);
        callback(false); 
      });
    });
  }
  
  
  
  //check if the user is authenticated
  //return true if the user is logged in, if not false
  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user)  
    );
  }

}
