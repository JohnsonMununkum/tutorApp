import { Component, OnInit } from '@angular/core';
//imports authservice & router 
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';

  //consturctor takes in router & auhservice
  constructor(private authService: AuthService, private router: Router) {}

  //login method 
  //if user provides correct details they are logged in successfully
  onLogin() {
    this.authService.login(this.email, this.password)
      .then((result) => {
        console.log('Logged in successfully:', result);
      })
      .catch((error) => {
        console.error('Error logging in:', error);
      });
  }


  //logout method
  //if user loggs out send them to the login page
  logout() {
    this.authService.logout()
      .then(() => {
        console.log('Logged out successfully');
        this.router.navigateByUrl('/login'); 
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  }
}