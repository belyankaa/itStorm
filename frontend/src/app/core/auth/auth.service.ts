import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DefaultResponseType} from "../../../types/default-response.type";
import {Observable, Subject, throwError} from "rxjs";
import {LoginResponseType} from "../../../types/login-response.type";
import {environment} from "../../../environments/environment";
import {UserInfoType} from "../../../types/user-info.type";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private accessTokenKey: string = 'accessToken';
    private refreshTokenKey: string = 'refreshToken';
    private userIdKey: string = 'userId';

    private isLogged: boolean = false;
    public isLogged$: Subject<boolean> = new Subject<boolean>();

    constructor(private http: HttpClient) {
        this.isLogged = !!localStorage.getItem(this.accessTokenKey)
    }

    public getIsLoggedIn(): boolean {
        return this.isLogged
    }

    public login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | LoginResponseType> {
        return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {email, password, rememberMe})
    }

    public signup(name: string, email: string, password: string): Observable<DefaultResponseType | LoginResponseType> {
        return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {name, email, password})
    }

    public logout(): Observable<DefaultResponseType> {
        const refreshToken: string | null = this.getTokens().refreshToken;
        return this.http.post<DefaultResponseType>(environment.api + 'logout', {refreshToken})
    }

    public setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        this.isLogged = true;
        this.isLogged$.next(true);
    }

    public removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey,);
        localStorage.removeItem(this.refreshTokenKey);
        this.isLogged = false;
        this.isLogged$.next(false);
    }

    public getTokens(): { accessToken: string | null, refreshToken: string | null } {
        return {
            accessToken: localStorage.getItem(this.accessTokenKey),
            refreshToken: localStorage.getItem(this.refreshTokenKey)
        }
    }

    public refreshTokens(): Observable<DefaultResponseType | LoginResponseType> {
        const tokens = this.getTokens();
        if (tokens && tokens.refreshToken) {
            return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {
                refreshToken: tokens.refreshToken
            });
        }
        throw throwError(() => 'Can not use token')
    }

    public userId(id: string | null) {
        if (id) {
            localStorage.setItem(this.userIdKey, id);
        } else {
            localStorage.removeItem(this.userIdKey);
        }
    }
}
