import { Injectable, Injector, runInInjectionContext } from '@angular/core';
//imports firestore tutor, user, task , review & rxjs operators 
//rxjs operators modify or filter data from observables
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Tutor } from '../models/tutor.model'; 
import { User } from '../models/user.model';
import { Task } from '../models/task.model';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class TutorService {

  //constrctor that takes in firestore & injector
  constructor(private firestore: AngularFirestore,private injector: Injector) {}

  //get all tutors from the Firestore database
  //tutors collection in Firestore , get realtime updates & return the tutors data
  getAllTutors(): Observable<any[]> {
    return this.firestore
      .collection('tutors') 
      .snapshotChanges()     
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Tutor;
            return { ...data }; 
          })
        ),
        catchError((error) => {
          console.error('Error fetching tutors:', error);
          return throwError(error);  
        })
      );
  }

  //method to get all users 
  getAllUsers(): Observable<Tutor[]> {
    return this.firestore
      .collection('users', ref => ref.where('role', '==', 'Tutor')) 
      .snapshotChanges()
      .pipe(
        switchMap(actions => {
          const tutorObservables = actions.map(a => {
            const data = a.payload.doc.data() as Tutor;
            const docId = a.payload.doc.id;
  
            let obs$: Observable<Tutor>;
  
            runInInjectionContext(this.injector, () => {
              obs$ = this.firestore
                .collection<Review>(`users/${docId}/reviews`)
                .valueChanges()
                .pipe(
                  map((reviews: Review[]) => ({
                    ...data,
                    reviews
                  }))
                );
            });
  
            return obs$!;
          });
  
          return combineLatest(tutorObservables);
        }),
        catchError(error => {
          console.error('Error fetching tutors with reviews:', error);
          return throwError(() => error);
        })
      );
  }
  
  //method to get user by uid
  getUserByUid(uid: string | undefined): Observable<Tutor> {
    if (!uid) {
      return throwError(() => new Error('UID is undefined'));
    }
  
    const userDocRef = this.firestore.doc<Tutor>(`users/${uid}`);
  
    return userDocRef.valueChanges().pipe(
      switchMap((userData) => {
        if (!userData) {
          return throwError(() => new Error('User not found'));
        }
  
        //return the observable created in the injection 
        return runInInjectionContext(this.injector, () => {
          return this.firestore
            .collection<Review>(`users/${uid}/reviews`)
            .valueChanges()
            .pipe(
              map((reviews: Review[]) => ({
                ...userData,
                reviews
              }))
            );
        });
      }),
      catchError((error) => {
        console.error('Error fetching user by UID:', error);
        return throwError(() => error);
      })
    );
  }
  
  
  

  //method to get users based on their role
  getUsersByRole(role: string): Observable<User[]> {
    return this.firestore
      .collection('users', ref => ref.where('role', '==', role)) 
      .snapshotChanges() 
      .pipe(
        map(actions => 
          actions.map(a => {
            const data = a.payload.doc.data() as User;
            const id = a.payload.doc.id;

          //teturn user data with reviews 
          return { id, ...data};
          })
        ),
        catchError((error) => {
          console.error('Error fetching tutors:', error);
          return throwError(error); 
        })
      );
  }

   //get users & the reviews 
   getUsersWithReviews(role: string): Observable<User[]> {
    //get all users based on role
    return this.firestore
      .collection('users', (ref) => ref.where('role', '==', role))
      .snapshotChanges()
      .pipe(
        map((actions) => {
          const usersWithReviews: any[] = [];

          actions.forEach((a) => {
            const data = a.payload.doc.data() as User;
            const id = a.payload.doc.id;

            //get reviews from the user's reviews using runInInjectionContext
            runInInjectionContext(this.injector, () => {
              const reviews = this.firestore
                .collection('users')
                .doc(id)
                .collection('reviews')
                .valueChanges();

              //push the user data with reviews into the usersWithReviews array
              usersWithReviews.push({
                id,
                ...data,
                reviews: reviews,
              });
            });
          });

          //return userwithreviews
          return usersWithReviews;
        }),
        catchError((error) => {
          console.error('Error fetching users with reviews:', error);
          return throwError(error); 
        })
      );
  }

  

  //get a tutor by id
  getTutorById(id: string): Observable<any> {
    return this.firestore
      .doc(`tutors/${id}`)
      .snapshotChanges()
      .pipe(
        map((action) => {
          const data = action.payload.data() as Tutor;
          return { ...data };
        })
      );
  }

  postReview(tutorUid: string, review: Review) {
    return this.firestore
      .collection('users')
      .doc(tutorUid)
      .collection('reviews')
      .add(review)
      .then((docRef) => {
        //review added successfully
        console.log('Review added with ID: ', docRef.id);
        return { success: true, message: 'Review posted successfully!' };
      })
      .catch((error) => {
        console.error('Error adding review: ', error);
        return { success: false, message: 'Error posting review.' };
      });
  }
  

  addTask(task: Task): Promise<void> {
    // make a new id for the task
    const taskId = this.firestore.createId();  
    
    //runInInjectionContext so thst firestore operation is done properly 
    return runInInjectionContext(this.injector, () => {
      return this.firestore.collection('tasks').doc(taskId).set(task);
    });
  }

   //get all tasks from the firestore
   getTasks(): Observable<Task[]> {
    return this.firestore.collection<Task>('tasks').valueChanges();
  }

  //get all tasks by a users id
  getTasksByUser(userId: string): Observable<Task[]> {
    return this.firestore.collection<Task>('tasks', ref => ref.where('userId', '==', userId)).valueChanges();
  }

  //add a bew tutor to the firestore
  addTutor(tutor: any): Promise<any> {
    return this.firestore.collection('tutors').add(tutor);
  }

  //update a tutor
  updateTutor(id: string, tutor: any): Promise<void> {
    return this.firestore.doc(`tutors/${id}`).update(tutor);
  }

  //delete a tutor
  deleteTutor(id: string): Promise<void> {
    return this.firestore.doc(`tutors/${id}`).delete();
  }
}

