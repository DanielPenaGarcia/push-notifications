import { Router } from '@angular/router';
import { Injectable, Provider } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, TimeoutError, throwError, from, scheduled, asyncScheduler, lastValueFrom } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    
    private readonly PUBLIC_PATHS = [
        "/auth"
    ];
    private readonly MAX_TIMEOUT = 10000;

    constructor(
        private readonly router: Router, 
        private readonly authService: AuthService,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const handleRequest$ = from(this.handle(request, next));
        return scheduled(handleRequest$, asyncScheduler);        
    }

    async handle(request: HttpRequest<any>, next: HttpHandler){
        if (this.isPrivatePath(request.url)) {
            request = await this.setupPrivatePath(request);
        }else{
            request = this.setupPublicPath(request);
        }
        return lastValueFrom(next.handle(request).pipe(
            timeout(this.MAX_TIMEOUT),
            catchError(error => {
                if (error instanceof TimeoutError) {
                    return throwError(()=>error);
                }
                if (error instanceof HttpErrorResponse) {                        
                    if (error.status === 401 || error.status == 403) {
                        this.authService.signOut();
                    } else if (!error.status){
                    } else{
                    }                        
                    return throwError(()=>error);
                }
                return throwError(()=>error);
            }),
            tap({
                next: (event: HttpEvent<any>) => { }                
            })
        ));
    }        

    setupPrivatePath = async(request: HttpRequest<any>) => {
        const token:string = (await this.authService.getToken())!;           
        return request.clone({
            setHeaders: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    setupPublicPath = (request: HttpRequest<any>) => {
        return request.clone({
            setHeaders: {}
        });
    }

    isPrivatePath = (url: string) => {
        return !this.PUBLIC_PATHS.some(
            path => url.startsWith(path)
        );
    }
}

export const authInterceptorProvider: Provider = {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
};