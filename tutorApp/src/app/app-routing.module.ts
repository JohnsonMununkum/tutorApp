import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
//imports to the apps pghes 
import { HomePage } from './home/home.page';        
import { LoginPage } from './login/login.page';      
import { RegisterPage } from './register/register.page';  
import { TaskPostingPage } from './task-posting/task-posting.page';
import { ReviewPage } from './review/review.page';
import { VerifyPage } from './verify/verify.page';
import { ChatPage } from './chat/chat.page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  { path: 'home', component:HomePage }, 
  { path: 'login', component: LoginPage }, 
  { path: 'register',component: RegisterPage }, 
  { path: 'task-posting',component: TaskPostingPage }, 
  { path: 'profile/:u',  component: ReviewPage  },
  { path: 'chat',component: ChatPage },
  {
    path: 'verify',
    component: VerifyPage
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
