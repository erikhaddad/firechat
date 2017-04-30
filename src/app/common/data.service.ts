import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {AuthService} from '../auth/auth.service';
import {
    IModerator, IRoomMessages, IMessage, IRoomMetadata, IUser, Message, IRoomUsers,
    ISuspendedUsers
} from './data-model';

import * as firebase from 'firebase';

@Injectable()
export class DataService {
    private moderatorsPath: string;
    private roomMessagesPath: string;
    private roomMetadataPath: string;
    private roomUsersPath: string;
    private suspensionsPath: string;
    private userNamesOnlinePath: string;
    private usersPath: string;

    constructor(private afd: AngularFireDatabase, private auth: AuthService) {
        this.moderatorsPath = '/moderators';
        this.roomMessagesPath = '/room-messages';
        this.roomMetadataPath = '/room-metadata';
        this.roomUsersPath = '/room-users';
        this.suspensionsPath = '/suspensions';
        this.userNamesOnlinePath = '/user-names-online';
        this.usersPath = '/users';
    }

    get moderators(): FirebaseListObservable<IModerator[]> {
        return this.afd.list(this.moderatorsPath);
    }

    get roomMessages(): FirebaseListObservable<IRoomMessages[]> {
        return this.afd.list(this.roomMessagesPath);
    }

    get roomMetadata(): FirebaseListObservable<IRoomMetadata[]> {
        return this.afd.list(this.roomMetadataPath);
    }

    get roomUsers(): FirebaseListObservable<IRoomUsers[]> {
        return this.afd.list(this.roomUsersPath);
    }

    get suspensions(): FirebaseObjectObservable<ISuspendedUsers> {
        return this.afd.object(this.suspensionsPath);
    }

    get userNamesOnline(): FirebaseListObservable<IModerator[]> {
        return this.afd.list(this.userNamesOnlinePath);
    }

    get users(): FirebaseListObservable<IUser[]> {
        return this.afd.list(this.usersPath);
    }

    /** ROOM MESSAGES **/
    createRoomMessage(roomId: string, message: Message): firebase.Promise<any> {
        return this.afd.list(this.roomMessagesPath + '/' + roomId).push(message);
    }
    getRoomMessages(roomId: string): FirebaseObjectObservable<any> {
        return this.afd.object(this.roomMessagesPath + '/' + roomId);
    }
    removeRoomMessage(roomId: string, message: IMessage): firebase.Promise<any> {
        return this.afd.list(this.roomMessagesPath + '/' + roomId).remove(message.$key);
    }
    updateRoomMessage(roomId: string, message: IMessage, changes: any): firebase.Promise<any> {
        return this.afd.list(this.roomMessagesPath + '/' + roomId).update(message.$key, changes);
    }




    // Load the initial metadata for the user's account and set initial state.
    private loadUserMetadata(onComplete) {

    }

    // Initialize Firebase listeners and callbacks for the supported bindings.
    private setupDataEvents() {

    }

    // Append the new callback to our list of event handlers.
    private addEventCallback(eventId, callback) {

    }

    // Retrieve the list of event handlers for a given event id.
    private getEventCallbacks(eventId) {

    }

    // Invoke each of the event handlers for a given event id with specified data.
    private invokeEventCallbacks(eventId) {

    }

    // Keep track of on-disconnect events so they can be requeued if we disconnect the reconnect.
    private queuePresenceOperation(ref, onlineValue, offlineValue) {

    }

    // Remove an on-disconnect event from firing upon future disconnect and reconnect.
    private removePresenceOperation(ref, value) {

    }

    // Event to monitor current user state.
    private onUpdateUser(snapshot) {

    }

    // Event to monitor current auth + user state.
    private onAuthRequired() {

    }

    // Events to monitor room entry / exit and messages additional / removal.
    private onEnterRoom(room) {

    }
    private onNewMessage(roomId, snapshot) {

    }
    private onRemoveMessage(roomId, snapshot) {

    }
    private onLeaveRoom(roomId) {

    }

    // Event to listen for notifications from administrators and moderators.
    private onNotification(snapshot) {

    }

    // Events to monitor chat invitations and invitation replies.
    private onFirechatInvite(snapshot) {

    }
    private onFirechatInviteResponse(snapshot) {

    }


    public setUser(userId, userName, callback) {

    }

    // Resumes the previous session by automatically entering rooms.
    public resumeSession() {

    }

    // Callback registration. Supports each of the following events:
    public on(eventType, cb) {

    }

    // Create and automatically enter a new chat room.
    public createRoom(roomName, roomType, callback) {

    }

    // Enter a chat room.
    public enterRoom(roomId) {

    }

    // Leave a chat room.
    public leaveRoom(roomId) {

    }

    public sendMessage(roomId, messageContent, messageType, cb) {

    }

    public deleteMessage(roomId, messageId, cb) {

    }

    // Mute or unmute a given user by id. This list will be stored internally and
    // all messages from the muted clients will be filtered client-side after
    // receipt of each new message.
    public toggleUserMute(userId, cb) {

    }

    // Send a moderator notification to a specific user.
    public sendSuperuserNotification(userId, notificationType, data, cb) {

    }

    // Warn a user for violating the terms of service or being abusive.
    public warnUser(userId) {

    }

    // Suspend a user by putting the user into read-only mode for a period.
    public suspendUser(userId, timeLengthSeconds, cb) {

    }

    // Invite a user to a specific chat room.
    public inviteUser(userId, roomId) {

    }

    public acceptInvite(inviteId, cb) {

    }

    public declineInvite(inviteId, cb) {

    }

    public getRoomList(cb) {

    }

    public getUsersByRoom() {

    }

    public getUsersByPrefix(prefix, startAt, endAt, limit, cb) {

    }

    // Miscellaneous helper methods.
    public getRoom(roomId, callback) {

    }

    public userIsModerator() {

    }

    public warn(msg) {

    }
}
