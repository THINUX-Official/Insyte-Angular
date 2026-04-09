import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCheckbox} from '@angular/material/checkbox';
import {Router} from '@angular/router';
import {Auth} from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatInput,
    MatIconButton,
    MatSuffix,
    MatIcon,
    MatCheckbox,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login {

  version = environment.version;
  signInForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });
  hide = true;

  constructor(private authService: Auth, private router: Router) {
  }

  forgetPassword() {

  }

  login(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const payload = {
      username: this.signInForm.value.username ?? '',
      password: this.signInForm.value.password ?? '',
      rememberMe: this.signInForm.value.rememberMe ?? false,
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.authService.storeSession(response);
        const route = this.authService.getDashboardRoute(response.roles);
        this.router.navigate([route]);
      }, error: (err) => {
        console.error('Login failed', err);
      }
    })
  }
}
