import {
    Component, ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {FirebaseListObservable} from 'angularfire2/database';
import {
    IModerator, IRoomMessages, IMessage, IRoom, IUser, Message, IRoomUsers,
    ISuspendedUsers, ILanguage, Languages
} from './common/data-model';
import {DataService} from './common/data.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MdDialog, MdDialogConfig, MdDialogRef, MdIconRegistry, MdSnackBar} from '@angular/material';
import {AuthService} from './auth/auth.service';
import {Router} from '@angular/router';
import {RoomMetadataComponent} from './room-metadata/room-metadata.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    title: string;

    selectedLanguage: string;
    isModerated: boolean;
    isDarkTheme: boolean;

    currentUser: IUser;

    rooms: IRoom[];
    users: IUser[];

    testRooms: IRoom[];
    testUsers: IUser[];

    users$: FirebaseListObservable<IUser[]>;

    languages: ILanguage[];

    private roomMetadataDialogRef: MdDialogRef<RoomMetadataComponent>;

    constructor (public auth: AuthService,
                 private dataService: DataService,
                 private router: Router,
                 public dialog: MdDialog,
                 public viewContainerRef: ViewContainerRef,
                 public snackBar: MdSnackBar,
                 iconRegistry: MdIconRegistry,
                 sanitizer: DomSanitizer) {

        iconRegistry.addSvgIcon(
            'google',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/auth/google.svg'));

        iconRegistry.addSvgIcon(
            'facebook',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/auth/facebook.svg'));

        iconRegistry.addSvgIcon(
            'twitter',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/auth/twitter.svg'));

        iconRegistry.addSvgIcon(
            'github',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/auth/github.svg'));

        iconRegistry.addSvgIcon(
            'logo_white',
            sanitizer.bypassSecurityTrustResourceUrl('assets/images/logo_fireplace_white.svg'));

        iconRegistry.addSvgIcon(
            'logo_color',
            sanitizer.bypassSecurityTrustResourceUrl('assets/images/logo_fireplace_color.svg'));

        this.title = 'firechat';

        this.selectedLanguage = 'en';
        this.isModerated = false;
        this.isDarkTheme = true;

        this.testRooms = [
            {
                $key: '1234',
                name: 'Test Room 1',
                description: 'This is a test room',
                type: 'public',
                createdByUserId: 'abcd',
                createdAt: +Date,
                authorizedUsers: {}
            }
        ];
        this.rooms = this.testRooms;

        this.testUsers = [
            {
                $key: '',
                id: '0',
                name: 'Jason Hall',
                email: 'jasonhall@example.com',
                avatar: 'http://lorempixel.com/50/50/people/0',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '1',
                name: 'Russell Hopkins',
                email: 'russell_83@example.com ',
                avatar: 'http://lorempixel.com/50/50/people/1',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '2',
                name: 'Ronald Lopez',
                email: 'ronald-lopez@example.com',
                avatar: 'http://lorempixel.com/50/50/people/2',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '3',
                name: 'Judy Reynolds',
                email: 'judy-87@example.com',
                avatar: 'http://lorempixel.com/50/50/people/3',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '4',
                name: 'Sara Stanley',
                email: 'sarastanley@example.com',
                avatar: 'http://lorempixel.com/50/50/people/4',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '5',
                name: 'Robert Wagner',
                email: 'robert85@example.com',
                avatar: 'http://lorempixel.com/50/50/people/5',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '6',
                name: 'Jacqueline Snyder',
                email: 'jacqueline82@example.com',
                avatar: 'http://lorempixel.com/50/50/people/6',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '7',
                name: 'Paul Wallace',
                email: 'paulwallace@example.com',
                avatar: 'http://lorempixel.com/50/50/people/7',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '8',
                name: 'Tammy Reyes',
                email: 'tammy-reyes@example.com',
                avatar: 'http://lorempixel.com/50/50/people/8',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '9',
                name: 'Marie King',
                email: 'marieking@example.com',
                avatar: 'http://lorempixel.com/50/50/people/9',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            },
            {
                $key: '',
                id: '10',
                name: 'Emily Barrett',
                email: 'emily_82@example.com',
                avatar: 'http://lorempixel.com/50/50/people/10',
                createdAt: '',
                invites: [],
                muted: [],
                rooms: [],
                notifications: []
            }
        ];
        this.users = [];
        this.users = this.testUsers;

        this.currentUser = this.users[0];

        this.users$ = dataService.users;
        this.users$.subscribe(users => {
            console.log('database users', users);
        });

        // ["en", "es", "pt", "de", "ja", "hi", "nl"]
        /*
        this.languages = [
            {
                id: 'en',
                abbreviation: 'en',
                name: 'English'
            },
            {
                id: 'es',
                abbreviation: 'ES',
                name: 'Spanish'
            },
            {
                id: 'pt',
                abbreviation: 'PT',
                name: 'Portuguese'
            },
            {
                id: 'de',
                abbreviation: 'DE',
                name: 'German'
            },
            {
                id: 'ja',
                abbreviation: 'JA',
                name: 'Japanese'
            },
            {
                id: 'hi',
                abbreviation: 'HI',
                name: 'Hindi'
            },
            {
                id: 'nl',
                abbreviation: 'NL',
                name: 'Dutch'
            }
        ];
        */
        this.languages = [
            {
                id: Languages.English,
                abbreviation: 'en',
                name: 'English'
            },
            {
                id: Languages.Spanish,
                abbreviation: 'ES',
                name: 'Spanish'
            },
            {
                id: Languages.Portuguese,
                abbreviation: 'PT',
                name: 'Portuguese'
            },
            {
                id: Languages.German,
                abbreviation: 'DE',
                name: 'German'
            }
        ];
        console.log(this.auth);
    }

    logout(evt: Event) {
        const message = 'You have been signed out';
        this.auth.signOut();
        this.router.navigate(['/sign-in']);

        this.snackBar.open(message, null, {
            duration: 1000
        });
    }

    createNewRoom(evt: Event) {
        const config = new MdDialogConfig();
        // config.height = '400px';
        // config.width = '600px';
        config.viewContainerRef = this.viewContainerRef;

        this.roomMetadataDialogRef = this.dialog.open(RoomMetadataComponent, config);

        // if room already exists, pass it to the dialog for editing
        // this.roomMetadataDialogRef.componentInstance.currentPost = post;

        this.roomMetadataDialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }
}
