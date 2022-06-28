import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/authentication.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {

  returnUrl: string;

  loginForm = new FormGroup({
    username: new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
    password: new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
  });

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthenticationService
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login() {
    this.authService.login({
      username: this.loginForm.controls.username.value,
      password: this.loginForm.controls.password.value
    }).subscribe(loggedIn => {
      if(loggedIn) this.snackBar.open('Logged in!', '🥳', this.snackBarConfig);
      else this.snackBar.open('Login failed!', '😰', this.snackBarConfig);
      this.router.navigate([this.returnUrl]);
    });
  }
}
