import {Component} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  public signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^([А-Я][а-я]{1,}\s*)+$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/)]],
    agreement: [false, Validators.requiredTrue]
  })

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  public signUp(): void {
    if (!this.signupForm.value.name || !this.signupForm.value.email || !this.signupForm.value.password) {
      return;
    }

    this.authService.signup(this.signupForm.value.name!, this.signupForm.value.email!, this.signupForm.value.password!)
      .subscribe({
        next: (data: DefaultResponseType | LoginResponseType) => {
          if ((data as DefaultResponseType).error !== undefined || !(data as LoginResponseType).accessToken || !(data as LoginResponseType).refreshToken ||
            !(data as LoginResponseType).userId) {
            throw new Error();
          }

          this._snackBar.open('Вы успешно зарегистрировались');
          this.authService.setTokens((data as LoginResponseType).accessToken, (data as LoginResponseType).refreshToken);
          this.authService.userId((data as LoginResponseType).userId);

          this.activatedRoute.queryParams
            .subscribe(params => {
              if (params.hasOwnProperty('backToArticle')) {
                this.router.navigate(['/articles/' + params['backToArticle']]);
              } else {
                this.router.navigate(['/']);
              }
            })
        }, error: (error: HttpErrorResponse) => {
          this._snackBar.open(error.error.message);
        }
      })
  }

}
