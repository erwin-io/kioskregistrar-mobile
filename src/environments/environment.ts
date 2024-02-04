// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  apiBaseUrl: 'http://192.168.254.140:3000/api/v1',
  // apiBaseUrl: 'http://localhost:3000/api/v1',
  firebase: {
    apiKey: 'AIzaSyCHVyQ6GHhYcca0iLm_8HyXtq7Spp4iKzw',
    authDomain: 'tailor-booking-app.firebaseapp.com',
    databaseURL: 'https://tailor-booking-app-default-rtdb.firebaseio.com',
    projectId: 'tailor-booking-app',
    storageBucket: 'tailor-booking-app.appspot.com',
    messagingSenderId: '254255626739',
    appId: '1:254255626739:web:f1e9ee7f5935287f8f3a86',
    measurementId: 'G-KJ35F95QN6'
  },
  pusher: {
    key: '21c010133c493e5d1b02',
    cluster: 'ap1',
  },
  oneSignalAppId: '8e2928f7-9433-42a3-ac5a-cb4dc60db8d1',
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
