import {
  Component, OnDestroy, OnInit, ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database';
import {
  Moderator, RoomMessages, Message, Room, User, RoomUsers,
  SuspendedUsers, Language, Languages, Themes
} from './common/data.model';
import {RtdbService} from './common/rtdb.service';
import {FirestoreService} from './common/firestore.service';
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

  currentUser$: Observable<User>;
  currentUser: User;

  rooms$: Observable<Room[]>;
  rooms: Room[];

  currentRoom$: Observable<Room>;
  currentRoom: Room;

  roomUsers$: Observable<User[]>;
  roomUsers: User[];

  // ["en", "es", "pt", "de", "ja", "hi", "nl"]
  languages: Language[] = [
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
              private rtdbService: RtdbService,
              private firestoreService: FirestoreService,
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
        this.currentUser$ = firestoreService.getUser(authUser.uid);

        this.currentUser$.subscribe(user => {
          this.currentUser = user;
        });
      }
    });

    this.roomUsers = [];
    this.rooms = [];

    this.rooms$ = this.firestoreService.getRooms();
    this.rooms$.subscribe(rooms => {
      console.log('rooms updated', this.rooms);
      this.rooms = rooms;
    });
  }

  ngOnInit() {
    this.appState.params.subscribe(param => {
      this.roomId = param;

      if (typeof this.roomId !== 'undefined') {
        console.log('found a roomId id in app component!', this.roomId);

        this.currentRoom$ = this.firestoreService.getRoom(this.roomId);
        this.currentRoom$.subscribe(room => {
          this.currentRoom = room;
          console.log('got currentRoom', this.currentRoom);
        });

        this.roomUsers$ = this.firestoreService.getRoomUsers(this.roomId);
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
      if (room.name) {
        this.firestoreService.createRoom(room).
          then(
            newRoomId => {
              this.router.navigate(['/messages/room', newRoomId]);
            }
          );
      }
    });
  }

  updateUserPreferenceLanguage(evt: Event, languageId: number) {
    this.currentUser.preferences.language = languageId;
    this.firestoreService.updateUser(this.currentUser);
  }

  updateUserPreferenceModerate(evt: Event, val: boolean) {
    this.currentUser.preferences.moderate = val;
    this.firestoreService.updateUser(this.currentUser);
  }

  updateUserPreferenceTheme(evt: Event, themeId: number) {
    this.currentUser.preferences.theme = themeId;
    this.firestoreService.updateUser(this.currentUser);
  }
}
