import {Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {AngularFireList, AngularFireObject} from 'angularfire2/database';
import {
  IModerator, IRoomMessages, IMessage, IRoom, IUser, Message, IRoomUsers,
  ISuspendedUsers, Room, RoomMessages, Themes, Languages
} from '../common/data-model';
import {DataService} from '../common/data.service';
import {AuthService} from '../auth/auth.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
  keyframes
} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  animations: [
    trigger('bounceInOut', [
      transition('void => *', [
        animate(300, keyframes([
          style({opacity: 0, transform: 'scale(0.1)', offset: 0}),
          style({opacity: 1, transform: 'scale(1.2)', offset: 0.3}),
          style({opacity: 1, transform: 'scale(1)', offset: 1})
        ]))
      ]),
      transition('* => void', [
        animate(300, keyframes([
          style({opacity: 1, transform: 'scale(1)', offset: 0}),
          style({opacity: 1, transform: 'scale(1.2)', offset: 0.7}),
          style({opacity: 0, transform: 'scale(0.1)', offset: 1})
        ]))
      ])
    ]),
    trigger('flyInOut', [
      state('in', style({width: '60%', transform: 'translateX(0)', opacity: 1})),
      transition('void => *', [
        style({width: 10, transform: 'translateX(50px)', opacity: 0}),
        group([
          animate('0.3s 0.1s ease', style({
            transform: 'translateX(0)',
            width: '60%'
          })),
          animate('0.3s ease', style({
            opacity: 1
          }))
        ])
      ]),
      transition('* => void', [
        group([
          animate('0.3s ease', style({
            transform: 'translateX(50px)',
            width: 10
          })),
          animate('0.3s 0.2s ease', style({
            opacity: 0
          }))
        ])
      ])
    ])
  ]
})

export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy {

  THEMES = Themes;

  // Param and object
  roomId: string;
  paramSubscription: any;
  languageSubject: BehaviorSubject<any>;
  languageQuery: object;

  newMessage: Message;

  currentUser$: Observable<IUser>;
  currentUser: IUser;

  roomMessages$: Observable<IMessage[]>;
  roomMessages: IMessage[];

  constructor(private dataService: DataService,
              public authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {

    this.languageSubject = new BehaviorSubject(null);
    this.roomMessages = [];
    this.newMessage = new Message();

    authService.authState$.subscribe(authUser => {
      this.currentUser$ = dataService.getUser(authUser.uid);
      this.currentUser$.subscribe(user => {
        this.currentUser = user;

        if (this.currentUser.preferences.language) {
          this.filterByLanguage(this.currentUser.preferences.language);
        } else {
          this.filterByLanguage(Languages.English);
        }
      });
    });
  }

  ngOnInit() {
    this.paramSubscription = this.route.params.subscribe(params => {
      this.roomId = params['roomId'];

      if (typeof this.roomId !== 'undefined') {
        this.languageSubject = new BehaviorSubject(null);
        this.languageQuery = {
          orderByChild: 'language',
          equalTo: this.languageSubject
        };

        // this.roomMessages$ = this.dataService.getRoomMessages(this.roomId);
        this.roomMessages$ = this.dataService.getRoomMessagesByQuery(this.roomId, this.languageSubject);

        this.roomMessages$.subscribe(messages => {
          if (messages) {
            if (this.currentUser.preferences.moderate) {
              this.roomMessages = _.filter(messages, {moderated: true});
            } else {
              this.roomMessages = _.filter(messages, {moderated: false});
            }
            this.roomMessages = _.orderBy(this.roomMessages, 'timestamp', 'asc');
          } else {
            this.roomMessages = [];
          }
        });

        if (this.currentUser && this.currentUser.preferences) {
          this.filterByLanguage(this.currentUser.preferences.language);
        }
      } else {
        this.router.navigate(['/messages']);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
    this.languageSubject.unsubscribe();
    // this.roomMessages$.unsubscribe();
    // this.currentUser$.unsubscribe();
  }

  filterByLanguage(language: number) {
    this.languageSubject.next(language);
  }

  sendRoomMessage($event) {
    if (this.newMessage.message !== 'undefined') {
      this.newMessage.message = this.newMessage.message.trim();
      this.newMessage.userId = this.currentUser.id;
      this.newMessage.name = this.currentUser.name;
      this.newMessage.avatar = this.currentUser.avatar;
      this.newMessage.language = this.currentUser.preferences.language;
      this.newMessage.moderated = false;

      const promise = this.dataService.createRoomMessage(this.roomId, this.newMessage);
      promise
        .then(
          result => {
            console.log('create room message result', result);
          },
          err => console.error(err, 'You do not have access!')
        );

      this.newMessage = new Message();
    }
  }

  scrollToBottom(): void {
    try {
      document.getElementById('inner').scrollTop = document.getElementById('inner').scrollHeight;
    } catch (err) {
      console.error(err);
    }
  }
}
