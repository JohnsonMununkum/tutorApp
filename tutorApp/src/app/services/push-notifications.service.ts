//imports injectable, injector, auth, firestore, firemessaging 
import { Injectable, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { catchError, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
//forge for signing jwts using rsa sha256
import * as forge from 'node-forge';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  //constructor takes in angularFireMessaging, angularFireAuth, angularFirestore, authService, injector, httpClient, and toastService
  constructor(private afMessaging: AngularFireMessaging,  private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,private authService: AuthService,private injector: Injector,private http: HttpClient, private toast: ToastService) {}
    //url to service account firebase for signing jwts
    private serviceAccountUrl = 'assets/service-account.json';
    private serverKey = "";
    //url for sending messages firebase messaging
    private fcmUrl = 'https://fcm.googleapis.com/v1/projects/tutor-7e57e/messages:send';
    //url to change a jwt to a token
    private readonly tokenUrl: string = "https://oauth2.googleapis.com/token";
 
  //inatilise push notifications for a user 
  init(user: firebase.default.User){
    //request permission for notifications
    this.requestPermission(user).subscribe(
      (token) => {
        console.log('Token received:', token);
      },
      (error) => {
        console.error('Permission request failed', error);
      }
    );

    //listen for messages
    this.listenForMessages().subscribe((message) => {
      console.log('Received message:', message);

      const messageData = message.notification.title + message.notification.body

      //show the message
      this.toast.showToast(messageData, 'success');
    });

    //rgistering the service worker for push notifications
    this.registerServiceWorker();
  }

  //reuests permission from the user 
  requestPermission(user: firebase.default.User): Observable<any> {
    return new Observable((observer) => {
      this.afMessaging.requestToken.subscribe(
        (token) => {
          console.log('Notification permission granted! Token:', token);
           //save the token to Firestore under the student's document
           //if user exists get role from firestore
            if (user) {
                this.authService.getRole(user.uid).subscribe({
                next: (role) => {
                if (role == "Student") {
                    console.log("role is" +role)
                    this.authService.updateFcmToken(user,token)
                } else{
                  //if user is not a student get token
                    this.getAccessTokens().then((token) => {
                        this.serverKey = token;
                        console.log("accessToken:", this.serverKey);
                      }).catch((error) => {
                        console.error("Error fetching access token:", error);
                      });
                    //calling the authservice to get student tokens fr seding a notification
                   this.authService.fetchStudentsFcmToken()
                }
            }
              
          })
        }

          observer.next(token);
        },
        (error) => {
          console.error('Notification permission denied:', error);
          observer.error(error);
        }
      );
    });
  }

  //method to listen for messages from firestore messaging
  listenForMessages(): Observable<any> {
    return this.afMessaging.messages;
  }

  

  //method to send notifications using firebase cloud messaging
  sendNotification(tokens: string[], title: string | undefined, body: string): Promise<void> {
    return this.getAccessTokens()
      .then(async (accessToken) => {
        //creating a header w contnt type & token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        });
  
        //creatinf a http post request for tokens
        const requests = tokens.map(token => {
          const message = {
            message: {
              token: token,
              notification: {
                title: title,
                body: body
              }
            }
          };
  
          return this.http.post(
            'https://fcm.googleapis.com/v1/projects/tutor-7e57e/messages:send',
            message,
            { headers }
          ).toPromise();
        });
  
        //waiting for all rquests to finish
        await Promise.all(requests);
        console.log("Notifications sent to all tokens.");
      })
      .catch((error) => {
        console.error("Error sending notifications:", error);
        throw error;
      });
  }
  
  

  //registering service worker for firebase messaging
  //allows push notifications to work when not on the app or its in the background
  registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);

        });
    }
  }


  //gets the service account JSON 
  //returns an observable that shows the service workers details
  private getServiceAccount(): Observable<any> {
    return this.http.get<any>(this.serviceAccountUrl).pipe(
      catchError((error) => {
        console.error('Error fetching service account:', error);
        throw error;
      })
    );
  }

  
   //method to do base64 url encoding
   //creating jwt header
   private base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  //method to get tokens by creating & signing a jt
  //allows push notifications
  public async getAccessTokens(): Promise<string> {
    try {
      //get service account details 
      const serviceAccount = await this.getServiceAccount().toPromise();
      const now = Math.floor(Date.now() / 1000);

      //jwt headder
      const header = {
        alg: 'RS256',
        typ: 'JWT',
      };

      //token expires in 1 hour
      //initalising the claim set
      const claimSet = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: this.tokenUrl,
        exp: now + 3600, 
        iat: now,
      };

      const jwt = this.base64UrlEncode(JSON.stringify(header)) + '.' + this.base64UrlEncode(JSON.stringify(claimSet));
      //signing the jwt w the service accounts private key
      const signature = this.signJwt(jwt, serviceAccount.private_key);
      //creating jwt
      const signedJwt = jwt + '.' + signature;

      //parameters for the token request
      const params = new HttpParams().set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer').set('assertion', signedJwt);

      //creating post reuest to make jwt a token
      const response: any = await this.http
        .post(this.tokenUrl, params, {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
        .toPromise();

      //returning the token
      return response.access_token;
    } catch (error) {
      console.error('Error in getAccessToken:', error);
      throw new Error('Error fetching access token: ' + error);
    }
  }

  //method to sign the jwt using a private key
  private signJwt(jwt: string, privateKey: string): string {
    const pki = forge.pki;
    //maing the privatekeyobj usable
    const privateKeyObj = pki.privateKeyFromPem(privateKey);
    //creating a sha256 message digest
    const md = forge.md.sha256.create();
    //updating the digest with the jwt string
    md.update(jwt, 'utf8');
    //signing using the private key
    const signature = privateKeyObj.sign(md);
    //returning the base64 url signature 
    return this.base64UrlEncode(signature);
  }
}
