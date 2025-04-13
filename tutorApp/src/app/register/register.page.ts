import { Component, OnInit } from '@angular/core';
//imports authservice, toastservice & router 
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage{
  //variables 
  //deault role for register is set to student 
  userName: string = ''; 
  email: string = '';
  password: string = '';
  selectedRole: string = 'Student'; 
  subjectName: string = '';

  //constructor takes in authservice, toastservice & router 
  constructor(private authService: AuthService, private router: Router,private toastService:ToastService) {}

  //user enters name, email, password, role & subject
  //if user is a tutor direct them to the taskposting page
  //if they are a student direct them to the home page
  onRegister() {
    this.authService.register(this.userName,this.email, this.password, this.selectedRole, this.subjectName)
      .then(() => {
        console.log('User registered successfully!');
        const path = this.selectedRole === "Tutor" ? "/task-posting" : "/home";
        this.router.navigateByUrl(path);        
      })
      .catch(error => {
        console.error('Error registering user:', error);
      });
  }
}
