import {Component} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  })

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private activatedRoute: ActivatedRoute) {

  }

  public login(): void {
    if (!this.loginForm.value.email || !this.loginForm.value.password) {
      return;
    }

    this.authService.login(this.loginForm.value.email!, this.loginForm.value.password!, this.loginForm.value.rememberMe!)
      .subscribe({
        next: (data: DefaultResponseType | LoginResponseType) => {
          if ((data as DefaultResponseType).error !== undefined || !(data as LoginResponseType).accessToken || !(data as LoginResponseType).refreshToken ||
            !(data as LoginResponseType).userId) {
            throw new Error();
          }

          this._snackBar.open('Вы успешно авторизирвались');
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
        },
        error: (error: HttpErrorResponse): void => {
          this._snackBar.open(error.error.message)
        }
      })
  }
}
