import {Component, OnInit, OnDestroy} from '@angular/core';
import {FirebaseListObservable} from 'angularfire2/database';
import {
    IModerator, IRoomMessages, IMessage, IRoom, IUser, Message, IRoomUsers,
    ISuspendedUsers, Room
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
import {ActivatedRoute} from '@angular/router';

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
    // personId: string;
    paramSubscription: any;
    currentRoomMessages: IRoomMessages;
    currentRoomMetadata: IRoom;

    currentUser: IUser;

    users: IUser[];
    messages: IMessage[];

    testUsers: IUser[];
    testMessages: IMessage[];

    users$: FirebaseListObservable<IUser[]>;

    constructor (private dataService: DataService,
                 private authService: AuthService,
                private route: ActivatedRoute) {

        // Remove these once done
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

        this.users$ = this.dataService.users;



        this.testMessages = [
            {
                $key: '',
                userId: this.users[0].id,
                name: this.users[0].name,
                avatar: this.users[0].avatar,
                message: 'Is this the real life?',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[1].id,
                name: this.users[1].name,
                avatar: this.users[1].avatar,
                message: 'Is this just fantasy?',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[0].id,
                name: this.users[0].name,
                avatar: this.users[0].avatar,
                message: 'Caught in a landslide',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[2].id,
                name: this.users[2].name,
                avatar: this.users[2].avatar,
                message: 'No escape from reality.',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[0].id,
                name: this.users[0].name,
                avatar: this.users[0].avatar,
                message: 'Open your eyes',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[3].id,
                name: this.users[3].name,
                avatar: this.users[3].avatar,
                message: 'Look up to the skies and see',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[0].id,
                name: this.users[0].name,
                avatar: this.users[0].avatar,
                message: 'I\'m just a poor boy, I need no sympathy',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[4].id,
                name: this.users[4].name,
                avatar: this.users[4].avatar,
                message: 'Because I\'m easy come, easy go',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[0].id,
                name: this.users[0].name,
                avatar: this.users[0].avatar,
                message: 'Little high, little low',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[5].id,
                name: this.users[5].name,
                avatar: this.users[5].avatar,
                message: 'Anyway the wind blows doesn\'t really matter to me, to me',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[0].id,
                name: this.users[0].name,
                avatar: this.users[0].avatar,
                message: 'Mama, just killed a man',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[6].id,
                name: this.users[6].name,
                avatar: this.users[6].avatar,
                message: 'Put a gun against his head',
                timestamp: Date.now(),
            },
            {
                $key: '',
                userId: this.users[0].id,
                name: this.users[0].name,
                avatar: this.users[0].avatar,
                message: 'Pulled my trigger, now he\'s dead.',
                timestamp: Date.now(),
            }
        ];
        this.messages = [];

        // this.messages = this.testMessages;
        let msgIndex = 0;
        const that = this;
        const interval = setInterval(() => {

            that.messages.push(that.testMessages[msgIndex]);

            setTimeout(() => {
                const panel = document.getElementById('inner');
                panel.scrollTop = panel.scrollHeight;
            }, 200);

            msgIndex++;

            if (msgIndex >= that.testMessages.length) {
                clearInterval(interval);
            }
        }, 1000);
    }

    ngOnInit() {
        this.paramSubscription = this.route.params.subscribe(params => {
            this.roomId = params['roomId'];

            if (typeof this.roomId !== 'undefined') {
                console.log('found a room id!', this.roomId);

                this.dataService.getRoomMessages(this.roomId)
                    .subscribe(messages => {
                        this.messages = messages;
                    });
            }

            /*
            if (typeof this.personId !== 'undefined') {
                console.log('found a person id!', this.personId);

                this.dataService.getPerson(this.personId)
                    .subscribe(person => {
                        this.currentPerson = person;
                        this.combineData();
                        this.getFollowers();
                        this.getFollowing();
                    });
            }
             */


        });
    }

    ngOnDestroy() {}

    createRoom(name: string, type: string) {
        const newRoom = new Room();
        newRoom.name = name;
        newRoom.type = type;
        newRoom.createdByUserId = this.authService.id;

        this.dataService.createRoom(newRoom);
    }
}
