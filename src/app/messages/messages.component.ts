import {Component, OnInit, OnDestroy} from '@angular/core';
import {FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {
    IModerator, IRoomMessages, IMessage, IRoom, IUser, Message, IRoomUsers,
    ISuspendedUsers, Room, RoomMessages
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

export class MessagesComponent implements OnInit, OnDestroy {

    // Param and object
    roomId: string;
    paramSubscription: any;

    newMessage: Message;

    currentUser$: FirebaseObjectObservable<IUser>;
    currentUser: IUser;

    roomMessages$: FirebaseListObservable<IMessage[]>;
    roomMessages: IMessage[];

    constructor (private dataService: DataService,
                 public authService: AuthService,
                 private router: Router,
                 private route: ActivatedRoute) {

        this.roomMessages = [];
        this.newMessage = new Message();

        authService.authState$.subscribe(authUser => {
            this.currentUser$ = dataService.getUser(authUser.uid);
            this.currentUser$.subscribe(user => {
                this.currentUser = user;
                console.log('user', user);
            });
        });
    }

    ngOnInit() {
        this.paramSubscription = this.route.params.subscribe(params => {
            this.roomId = params['roomId'];

            if (typeof this.roomId !== 'undefined') {
                console.log('found a room id!', this.roomId);

                this.roomMessages$ = this.dataService.getRoomMessages(this.roomId);

                this.roomMessages$.subscribe(messages => {
                    console.log('messages', messages);
                    if (messages) {
                        this.roomMessages = messages;
                    }
                });
            } else {
                this.router.navigate(['/message']);
            }
        });
    }

    ngOnDestroy() {}

    sendRoomMessage($event) {
        this.newMessage.userId = this.currentUser.id;
        this.newMessage.name = this.currentUser.name;
        this.newMessage.avatar = this.currentUser.avatar;
        this.newMessage.language = this.currentUser.preferences.language;

        this.dataService.createRoomMessage(this.roomId, this.newMessage);
        this.newMessage = new Message();
    }
}
