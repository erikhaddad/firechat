import {
    Component,
    ViewEncapsulation
} from '@angular/core';
import {FirebaseListObservable} from 'angularfire2/database';
import {
    IModerator, IRoomMessages, IMessage, IRoomMetadata, IUser, Message, IRoomUsers,
    ISuspendedUsers
} from './common/data-model';
import {DataService} from './common/data.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MdIconRegistry, MdSnackBar} from '@angular/material';
import {AuthService} from './auth/auth.service';
import {Router} from '@angular/router';

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

    users: IUser[];

    testUsers: IUser[];

    users$: FirebaseListObservable<IUser[]>;

    constructor (public auth: AuthService,
                 private dataService: DataService,
                 private router: Router,
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

        this.testUsers = [
            {
                $key: '',
                id: '0',
                name: 'Jason Hall',
                email: 'jasonhall@example.com',
                avatar: 'http://lorempixel.com/50/50/people/0',
                status: 'online',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '1',
                name: 'Russell Hopkins',
                email: 'russell_83@example.com ',
                avatar: 'http://lorempixel.com/50/50/people/1',
                status: 'online',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '2',
                name: 'Ronald Lopez',
                email: 'ronald-lopez@example.com',
                avatar: 'http://lorempixel.com/50/50/people/2',
                status: 'online',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '3',
                name: 'Judy Reynolds',
                email: 'judy-87@example.com',
                avatar: 'http://lorempixel.com/50/50/people/3',
                status: 'left 3 min ago',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '4',
                name: 'Sara Stanley',
                email: 'sarastanley@example.com',
                avatar: 'http://lorempixel.com/50/50/people/4',
                status: 'left 5 min ago',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '5',
                name: 'Robert Wagner',
                email: 'robert85@example.com',
                avatar: 'http://lorempixel.com/50/50/people/5',
                status: 'left 3 hours ago',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '6',
                name: 'Jacqueline Snyder',
                email: 'jacqueline82@example.com',
                avatar: 'http://lorempixel.com/50/50/people/6',
                status: 'left 5 hours ago',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '7',
                name: 'Paul Wallace',
                email: 'paulwallace@example.com',
                avatar: 'http://lorempixel.com/50/50/people/7',
                status: 'left 12 hours ago',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '8',
                name: 'Tammy Reyes',
                email: 'tammy-reyes@example.com',
                avatar: 'http://lorempixel.com/50/50/people/8',
                status: 'left 18 hours ago',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '9',
                name: 'Marie King',
                email: 'marieking@example.com',
                avatar: 'http://lorempixel.com/50/50/people/9',
                status: 'left 1 day ago',
                invites: [],
                muted: [],
                rooms: []
            },
            {
                $key: '',
                id: '10',
                name: 'Emily Barrett',
                email: 'emily_82@example.com',
                avatar: 'http://lorempixel.com/50/50/people/10',
                status: 'left 3 days ago',
                invites: [],
                muted: [],
                rooms: []
            }
        ];
        this.users = [];
        this.users = this.testUsers;

        this.currentUser = this.users[0];

        this.users$ = dataService.users;

        console.log(this.auth);
    }

    signOut(message: string): void {
        this.auth.signOut();
        this.router.navigate(['/landing']);

        this.snackBar.open(message, null, {
            duration: 1000
        });
    }
}
