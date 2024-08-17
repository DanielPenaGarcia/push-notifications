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