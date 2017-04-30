// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    firebase: {
        apiKey: 'AIzaSyDsMPviUM0pipcmyoI0a68SpSbHkY4dCrA',
        authDomain: 'firechat-a3f10.firebaseapp.com',
        databaseURL: 'https://firechat-a3f10.firebaseio.com',
        projectId: 'firechat-a3f10',
        storageBucket: 'firechat-a3f10.appspot.com',
        messagingSenderId: '392232891051'
    }
};
