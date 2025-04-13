import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//firebase, angularFire enviorment.ts for firebase config apps pages messaging module , pushnotifications  & tutoservice imports
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';  
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging'; 
import { AsyncPipe } from '../../node_modules/@angular/common';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { FormsModule } from '@angular/forms'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TutorService } from './services/tutor.service';
import { TaskPostingPage } from './task-posting/task-posting.page';
import { ReviewPage } from './review/review.page';
import { PushNotificationsService } from './services/push-notifications.service';
import { HttpClientModule } from '@angular/common/http';
import { ChatPage } from './chat/chat.page';
import { initializeApp } from 'firebase/app';  
import { getDatabase } from 'firebase/database';  
import { VerifyPage } from './verify/verify.page';

//CUSTOM_ELEMENTS_SCHEMA lets Angular recognize custom html tags
@NgModule({
  declarations: [AppComponent, HomePage, LoginPage, RegisterPage, TaskPostingPage, ReviewPage, ChatPage, VerifyPage],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireMessagingModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },TutorService, PushNotificationsService, AsyncPipe],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
