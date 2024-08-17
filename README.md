# Push notifications with Angular and Ionic with firebase

# App with Angular and Ionic

## Ionic commands

```powershell
npm install @capacitor/push-notifications
npx cap sync
```

In this case, I made it on **Android**.

## Android

The Push Notification API uses [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) SDK for handling notifications. See [Set up a Firebase Cloud Messaging client app on Android](https://firebase.google.com/docs/cloud-messaging/android/client) and follow the instructions for creating a Firebase project and registering your application. There is no need to add the Firebase SDK to your app or edit your app manifest - the Push Notifications provides that for you. All that is required is your Firebase project's `google-services.json` file added to the module (app-level) directory of your app.

Android 13 requires a permission check in order to receive push notifications. You are required to call `checkPermissions()` and `requestPermissions()` accordingly, when targeting SDK 33.

### Variables

This plugin will use the following project variables (defined in your app's `variables.gradle` file):

- `firebaseMessagingVersion` version of `com.google.firebase:firebase-messaging` (default: 23.3.1)

```groovy
ext {
	firebaseMessagingVersion = '23.3.1'
}
```

## Push Notification Icon

On Android, the Push Notifications icon with the appropriate name should be added to the `AndroidManifest.xml` file:

```xml
<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@mipmap/ic_launcher" />
```

If no icon is specified Android will use the application icon, but push icon should be white pixels on a transparent backdrop. As the application icon is not usually like that, it will show a white square or circle. So it's recommended to provide the separate icon for Push Notifications.

Android Studio has an icon generator you can use to create your Push Notifications icon.

## Push Notification channel

From Android 8.0 (API level 26) and higher, notification channels are supported and recommended. The SDK will derive the `channelId` for incoming push notifications in the following order:

1. **Firstly it will check if the incoming notification has a `channelId` set.** When sending a push notification from either the FCM dashboard, or through their API, it's possible to specify a `channelId`.
2. **Then it will check for a possible given value in the `AndroidManifest.xml`.** If you prefer to create and use your own default channel, set `default_notification_channel_id` to the ID of your notification channel object as shown; FCM will use this value whenever incoming messages do not explicitly set a notification channel.

```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="@string/default_notification_channel_id" />
```

1. **Lastly it will use the fallback `channelId` that the Firebase SDK provides for us.** FCM provides a default notification channel with basic settings out of the box. This channel will be created by the Firebase SDK upon receiving the first push message.

> **Warning** When using option 1 or 2, you are still required to create a notification channel in code with an ID that matches the one used the chosen option. You can use [`createChannel(...)`](https://ionicframework.com/docs/native/push-notifications#createchannel) for this. If you don't do this, the SDK will fallback to option 3.
> 

### In this case, I didn’t use a default channel in the AndroidManifest.

---

## Capacitor Plugins

```tsx
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'notifications-app',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

## Push notification service

I created a `PushNotificationService.ts` applying singletone pattern.

```tsx
export class PushNotificationsService {
  constructor(
    @Optional() @SkipSelf() sharedService: PushNotificationsService,
    private readonly http: HttpClient,
    private readonly modalController: ModalController
  ) {
    if (sharedService) {
      throw new Error('PushNotificationsService is already provided');
    }
  }
}
```

### The following functions are in `PushNotificationsService`

```tsx
async initPushNotifications() {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      return;
    }
    await this.registerNotifications();
    await this.addListeners();
    await this.createChannels();
}
```

```tsx
  async registerNotifications() {
    let status = await PushNotifications.checkPermissions();
    if (status.receive === 'prompt') {
      status = await PushNotifications.requestPermissions();
    }
    if (status.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }
    await PushNotifications.register();
    return Promise.resolve();
  }

  async addListeners() {
    await PushNotifications.addListener('registration', (token) => {
      this.tokenDevice = token.value;
      this.registerToken().subscribe({
        next: () => {
          console.log('Token registered successfully');
        },
        error: (error) => {
          console.error('Error registering the device', error);
        },
      });
    });
    await PushNotifications.addListener('registrationError', (error) => {
      this.sendDeleteToken().subscribe({
        next: () => {
          console.log('Token deleted successfully');
        },
        error: (error) => {
          console.error('Error registering the device', error);
        },
      });
    });
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        if (notification.data.userTokenDevice !== this.tokenDevice) {
          const groupId = notification.data.groupId;
          const saveNotificationDTO: SaveNotificationDTO = {
            title: notification.title,
            description: notification.body,
            groupId: groupId,
          };
          this.saveNotification(saveNotificationDTO).subscribe({
            next: (response) => {
              this.notificationReceived.next(response);
            },
            error: (error) => {
              console.error('Error saving notification', error);
            },
          });
        }
      }
    );
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification) => {
        const action = notification.actionId;
        if (action === 'tap') {
          this.modalController.dismiss();
          const groupId = notification.notification.data.groupId;
          const groupName = notification.notification.data.groupName;
          const modal = await this.modalController.create({
            component: GroupTasksComponent,
            componentProps: {
              groupId: groupId,
              groupName: groupName,
            },
          });
          modal.present();
        }
      }
    );
    return Promise.resolve();
  }

  async createChannels() {
    await PushNotifications.createChannel({
      id: 'group',
      name: 'Group notifications',
      description: 'Group notifications',
      importance: 5,
      visibility: 1,
    });
    await PushNotifications.createChannel({
      id: 'task-created',
      name: 'Task created',
      description: 'Task created',
      importance: 2,
      visibility: 0,
    });
    await PushNotifications.createChannel({
      id: 'task-completed',
      name: 'Task completed',
      description: 'Task completed',
      importance: 5,
      visibility: 1,
    });
    return Promise.resolve();
  }
```

## In `main.ts` file, I added the service as a provider

```tsx
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
```

---

# API with NestJs

```powershell
npm install firebase-admin
```

Para usar la el servicio, se agrega de la siguiente manera.

To use the Firebase service, you have to add it in the following way.

firebase file is `firebase-service-account-key.json`  from firebase. Project in console>Project Settings > Service accounts [Firebase Admin SDK > Generate new private key]

![image.png](Push%20notifications%20with%20Angular%20and%20Ionic%20with%20fir%2058113f93c3434cdbaef70e868126374b/image.png)

```tsx
import { Provider } from "@nestjs/common";
import * as firebase from "firebase-admin";
import * as serviceAccountJSON from "../configs/firebase-service-account-key.json";

const serviceAccount = {
    "type": serviceAccountJSON.type,
    "projectId": serviceAccountJSON.project_id,
    "privateKeyId": serviceAccountJSON.private_key_id,
    "privateKey": serviceAccountJSON.private_key,
    "clientEmail": serviceAccountJSON.client_email,
    "clientId": serviceAccountJSON.client_id,
    "authUri": serviceAccountJSON.auth_uri,
    "tokenUri": serviceAccountJSON.token_uri,
    "authProviderX509CertUrl": serviceAccountJSON.auth_provider_x509_cert_url,
    "clientX509CertUrl": serviceAccountJSON.client_x509_cert_url,
    "universeDomain": serviceAccountJSON.universe_domain
}

const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
});

export const FIREBASE_APP = "FIREBASE_APP";

export const firebaseAdminProvider: Provider = {
    provide: FIREBASE_APP,
    useValue: firebaseApp
}
```

**`utils.module.ts`**

```tsx
@Module({
  providers: [UtilsService, firebaseAdminProvider],
  exports: [UtilsService, firebaseAdminProvider],
})
export class UtilsModule {}
```

**`tasks.module.ts`**

```tsx
import { UtilsModule } from 'notification/utils';

@Module({
    imports: [EntitiesModule, UtilsModule],
    controllers: [TasksController],
    providers: [TasksService, CompleteGroupTaskListener],
})
export class TasksModule {}
```

**`complete-group-task.listener.ts`**

```tsx
import { Inject, Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { FIREBASE_APP } from 'notification/utils/providers/firebase-admin.provider';

@Injectable()
export class CompleteGroupTaskListener {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseService: firebase.app.App,
  ) {}
}
```

### Send notification to topic

```tsx
private async sendTaskCompletedNotification(event: CompleteGroupTaskEvent) {
    try {
      await this.firebaseService.messaging().sendEach([
        {
          topic: event.groupCode,
          notification: {
            title: `Task ${event.taskTitle} completed`,
            body: `Task completed by ${event.userName} in group ${event.groupName}`,
          },
          data: {
            groupId: event.groupId,
            groupName: event.groupName,
            userTokenDevice: event.userTokenDevice || '',
          },
          android: {
            notification: { 
              channelId: 'task-completed',
            }
          }
        },
      ]);
    } catch (error) {
      console.error(
        `Error sending task completed notification to group ${event.groupName}`,
        error,
      );
    }
  }
```