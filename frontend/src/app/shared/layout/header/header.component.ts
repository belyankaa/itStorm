import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserService} from "../../../core/auth/user.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    public isLoggedIn: boolean = this.authService.getIsLoggedIn();
    public userInfoName!: string;

    constructor(private authService: AuthService,
                private userService: UserService,
                private _snackBar: MatSnackBar,
                private router: Router) {

    }

    ngOnInit(): void {
        this.authService.isLogged$.subscribe((isLoggedIn: boolean): void => {
            this.isLoggedIn = isLoggedIn;

            if (this.isLoggedIn) {
                this.setUserInfoName();
            }
        });

        if (this.isLoggedIn) {
            this.setUserInfoName();
        }
    }

    private setUserInfoName(): void {
        this.userService.getUserInfo()
            .subscribe({
                next: (data: UserInfoType | DefaultResponseType) => {
                    if ((data as DefaultResponseType).error !== undefined) {
                        throw new Error();
                    }

                    this.userInfoName = (data as UserInfoType).name;
                },
                error: (error: HttpErrorResponse) => {
                    this.authService.logout();
                    this.authService.removeTokens();
                    this.authService.userId(null);
                }
            })
    }

    public logout(): void {
        this.authService.logout()
            .subscribe({
                next: (data: DefaultResponseType) => {
                    if (data.error) {
                        throw new Error();
                    }

                    this._snackBar.open('Вы успешно вышли с аккаунта');
                    this.removeUserInfo();
                    this.router.navigate(['/']);
                },
                error: (error: HttpErrorResponse) => {
                    this._snackBar.open('Ошибка выхода');
                    this.removeUserInfo();
                    this.router.navigate(['/']);
                }
            })
    }

    private removeUserInfo(): void {
        this.authService.removeTokens();
        this.authService.userId(null);
    }
}
