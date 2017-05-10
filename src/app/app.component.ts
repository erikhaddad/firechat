import {
    Component, OnDestroy, OnInit, ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {
    IModerator, IRoomMessages, IMessage, IRoom, IUser, Message, IRoomUsers,
    ISuspendedUsers, ILanguage, Languages, Themes
} from './common/data-model';
import {DataService} from './common/data.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MdDialog, MdDialogConfig, MdDialogRef, MdIconRegistry, MdSnackBar} from '@angular/material';
import {AuthService} from './auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {RoomMetadataComponent} from './room-metadata/room-metadata.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
    title: string;

    LANGUAGES = Languages;
    THEMES = Themes;

    roomId: string;
    paramSubscription: any;

    currentUser$: FirebaseObjectObservable<IUser>;
    currentUser: IUser;

    rooms: IRoom[];
    rooms$: FirebaseListObservable<IRoom[]>;

    roomUsers: IRoomUsers[];
    roomUsers$: FirebaseListObservable<IRoomUsers[]>;

    // ["en", "es", "pt", "de", "ja", "hi", "nl"]
    languages: ILanguage[] = [
        {
            id: this.LANGUAGES.English,
            abbreviation: 'en',
            name: 'English'
        },
        {
            id: this.LANGUAGES.Spanish,
            abbreviation: 'es',
            name: 'Spanish'
        },
        {
            id: this.LANGUAGES.Portuguese,
            abbreviation: 'pt',
            name: 'Portuguese'
        },
        {
            id: this.LANGUAGES.German,
            abbreviation: 'de',
            name: 'German'
        }
    ];

    private roomMetadataDialogRef: MdDialogRef<RoomMetadataComponent>;

    constructor (public authService: AuthService,
                 private dataService: DataService,
                 private route: ActivatedRoute,
                 private router: Router,
                 public dialog: MdDialog,
                 public viewContainerRef: ViewContainerRef,
                 public snackBar: MdSnackBar,
                 iconRegistry: MdIconRegistry,
                 sanitizer: DomSanitizer) {

        iconRegistry.addSvgIcon(
            'google',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/authService/google.svg'));

        iconRegistry.addSvgIcon(
            'facebook',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/authService/facebook.svg'));

        iconRegistry.addSvgIcon(
            'twitter',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/authService/twitter.svg'));

        iconRegistry.addSvgIcon(
            'github',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/authService/github.svg'));

        iconRegistry.addSvgIcon(
            'logo_white',
            sanitizer.bypassSecurityTrustResourceUrl('assets/images/logo_fireplace_white.svg'));

        iconRegistry.addSvgIcon(
            'logo_color',
            sanitizer.bypassSecurityTrustResourceUrl('assets/images/logo_fireplace_color.svg'));

        this.title = 'firechat';

        authService.authState$.subscribe(authUser => {
            this.currentUser$ = dataService.getUser(authUser.uid);
            this.currentUser$.subscribe(user => {
                this.currentUser = user;
                console.log(user);
            });
        });

        this.roomUsers = [];
        this.rooms = [];

        this.rooms$ = this.dataService.rooms;
        this.rooms$.subscribe(rooms => {
            console.log('rooms', rooms);
            this.rooms = rooms;
        });

        console.log(this.authService);
    }

    ngOnInit() {
        this.paramSubscription = this.route.params.subscribe(params => {
            this.roomId = params['roomId'];

            if (typeof this.roomId !== 'undefined') {
                console.log('found a room id in app component!', this.roomId);

                console.log('deleting room messages for', this.roomId);
                this.dataService.deleteRoomMessages(this.roomId);

                this.roomUsers$ = this.dataService.getRoomUsers(this.roomId);
                this.roomUsers$.subscribe(users => {
                    console.log('room users', users);
                    this.roomUsers = users;
                });
            }
        });
    }

    ngOnDestroy() {}

    logout(evt: Event) {
        const message = 'You have been signed out';
        this.authService.signOut();
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

        this.roomMetadataDialogRef.afterClosed().subscribe(room => {
            console.log('Dialog result:', room);

            const promise = this.dataService.createRoom(room);

            promise
                .then(result => {
                    this.router.navigate(['/messages/room', result.$key]);
                })
                .catch(err => console.log(err, 'You do not have access!'));
        });
    }

    updateUserPreferenceLanguage(evt: Event, languageId: number) {
        this.currentUser.preferences.language = languageId;
        this.dataService.updateUser(this.currentUser);
    }

    updateUserPreferenceModerate(evt: Event, val: boolean) {
        this.currentUser.preferences.moderate = val;
        this.dataService.updateUser(this.currentUser);
    }

    updateUserPreferenceTheme(evt: Event, themeId: number) {
        this.currentUser.preferences.theme = themeId;
        this.dataService.updateUser(this.currentUser);
    }
}
