import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { authInterceptorProvider } from './app/shared/auth/auth.interceptor';
import { environment } from './environments/environment';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { PushNotificationsService } from './app/shared/notifications/push-notifications.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    authInterceptorProvider,
    importProvidersFrom(
      IonicModule.forRoot({}),
      HttpClientModule
    ),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    PushNotificationsService
  ],
});
