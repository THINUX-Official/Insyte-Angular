import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCheckbox} from '@angular/material/checkbox';
import {Router} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconButton,
    MatIcon,
    MatCheckbox,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login {

  version = environment.version;
  hide = true;
  isLoading = false;
  loginError = '';

  signInForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  forgetPassword(): void {
    this.loginError = 'Please contact your system administrator to reset the password.';
  }

  login(): void {
    this.loginError = '';

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      username: this.signInForm.value.username ?? '',
      password: this.signInForm.value.password ?? '',
      rememberMe: this.signInForm.value.rememberMe ?? false,
    };

    this.authService.login(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.authService.storeSession(response);
          const route = this.authService.getDashboardRoute(response.roles);
          this.router.navigate([route]);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.loginError = 'Invalid username or password. Please try again.';
        }
      });
  }
}
