import {
  Component, OnDestroy, OnInit, ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database';
import {
  IModerator, IRoomMessages, IMessage, IRoom, IUser, Message, IRoomUsers,
  ISuspendedUsers, ILanguage, Languages, Themes
} from './common/data.model';
import {DataService} from './common/data.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog, MatDialogConfig, MatDialogRef, MatIconRegistry, MatSnackBar} from '@angular/material';
import {AuthService} from './auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {RoomMetadataComponent} from './room-metadata/room-metadata.component';

import {Observable} from 'rxjs/Observable';
import {AppStateService} from './common/app-state.service';

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

  currentUser$: Observable<IUser>;
  currentUser: IUser;

  rooms$: Observable<IRoom[]>;
  rooms: IRoom[];

  currentRoom$: Observable<IRoom>;
  currentRoom: IRoom;

  roomUsers$: Observable<IRoomUsers[]>;
  roomUsers: IRoomUsers[];

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

  private roomMetadataDialogRef: MatDialogRef<RoomMetadataComponent>;

  constructor(public authService: AuthService,
              private dataService: DataService,
              private appState: AppStateService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
              public viewContainerRef: ViewContainerRef,
              public snackBar: MatSnackBar,
              iconRegistry: MatIconRegistry,
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

    this.title = 'firechat';

    authService.authState$.subscribe(authUser => {
      if (authUser != null) {
        this.currentUser$ = dataService.getUser(authUser.uid);

        this.currentUser$.subscribe(user => {
          this.currentUser = user;
        });
      }
    });

    this.roomUsers = [];
    this.rooms = [];

    this.rooms$ = this.dataService.getRooms();
    this.rooms$.subscribe(rooms => {
      this.rooms = rooms;
    });
  }

  ngOnInit() {
    this.appState.params.subscribe(param => {
      this.roomId = param;

      if (typeof this.roomId !== 'undefined') {
        console.log('found a roomId id in app component!', this.roomId);

        this.currentRoom$ = this.dataService.getRoom(this.roomId);
        this.currentRoom$.subscribe(room => {
          this.currentRoom = room;
          console.log('got currentRoom', this.currentRoom);
        });

        this.roomUsers$ = this.dataService.getRoomUsers(this.roomId);
        this.roomUsers$.subscribe(users => {
          this.roomUsers = users;
        });
      }
    });
  }

  ngOnDestroy() {
  }

  logout(evt: Event) {
    const message = 'You have been signed out';
    this.authService.signOut();
    this.router.navigate(['/sign-in']);

    this.snackBar.open(message, null, {
      duration: 1000
    });
  }

  createNewRoom(evt: Event) {
    const config = new MatDialogConfig();
    // config.height = '400px';
    // config.width = '600px';
    config.viewContainerRef = this.viewContainerRef;

    this.roomMetadataDialogRef = this.dialog.open(RoomMetadataComponent, config);

    // if room already exists, pass it to the dialog for editing
    // this.roomMetadataDialogRef.componentInstance.currentPost = post;

    this.roomMetadataDialogRef.afterClosed().subscribe(room => {
      const promise = this.dataService.createRoom(room);

      promise
        .then(
          result => {
            console.log('new room', result);
            this.router.navigate(['/messages/room', result.key]);
          },
          err => console.error(err, 'You do not have access!')
        );
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
