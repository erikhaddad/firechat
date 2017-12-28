import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable} from '@angular/core';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database';
import {AuthService} from '../auth/auth.service';
import {Moderator, RoomMessages, Message, Room, User, RoomUsers, SuspendedUsers} from './data.model';

import {Observable} from 'rxjs/Observable';
import ThenableReference = firebase.database.ThenableReference;
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

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

  private roomsRef: AngularFireList<Room>;
  private usersRef: AngularFireList<User>;

  constructor(private afd: AngularFireDatabase, private auth: AuthService) {
    this.moderatorsPath = '/moderators';
    this.roomMessagesPath = '/room-messages';
    this.roomMetadataPath = '/room-metadata';
    this.roomUsersPath = '/room-users';
    this.suspensionsPath = '/suspensions';
    this.userNamesOnlinePath = '/user-names-online';
    this.usersPath = '/users';

    this.roomsRef = this.afd.list(this.roomMetadataPath);
    this.usersRef = this.afd.list(this.usersPath);
  }

  /*
  get moderators(): AngularFireList<Moderator[]> {
      return this.afd.list(this.moderatorsPath);
  }

  get roomMessages(): AngularFireList<RoomMessages[]> {
      return this.afd.list(this.roomMessagesPath);
  }

  get rooms(): AngularFireList<Room[]> {
      return this.afd.list(this.roomMetadataPath);
  }

  get roomUsers(): AngularFireList<RoomUsers[]> {
      return this.afd.list(this.roomUsersPath);
  }

  get suspensions(): AngularFireObject<SuspendedUsers> {
      return this.afd.object(this.suspensionsPath);
  }

  get userNamesOnline(): AngularFireList<Moderator[]> {
      return this.afd.list(this.userNamesOnlinePath);
  }

  get users(): AngularFireList<User[]> {
      return this.afd.list(this.usersPath);
  }
  */

  /** USERS **/
  createUser(user: User): void {
    const promise = this.afd.list(this.usersPath).push({});

    promise
      .then(
        result => {
          user.id = result.key;
          this.afd.list(this.usersPath).set(user.id, user);
        },
        err => console.error(err, 'You do not have access!')
      );
  }

  getUser(userId: string): Observable<User> {
    const userPath = `${this.usersPath}/${userId}`;
    return this.afd.object(userPath).snapshotChanges().map(action => {
      // could do some data tranformation here, if necessary
      return { ...action.payload.val() };
    });
  }

  removeUser(user: User): Promise<any> {
    return this.afd.list(this.usersPath).remove(user.id);
  }

  updateUser(user: User): Promise<any> {
    return this.afd.list(this.usersPath).update(user.id, user);
  }

  /** ROOM METADATA **/
  getRooms(): Observable<Room[]> {
    return this.roomsRef.snapshotChanges().map(changes => {
      // could do some data tranformation here, if necessary
      return changes.map(c => ({ ...c.payload.val() }));
    });
  }

  createRoom(room: Room): void {
    const promise = this.afd.list(this.roomMetadataPath).push({});

    room.createdAt = firebase.database.ServerValue.TIMESTAMP;
    room.createdByUserId = this.auth.id;
    room.authorizedUsers = {};
    room.authorizedUsers[this.auth.id] = true;

    promise
      .then(
        result => {
          room.id = result.key;
          this.roomsRef.set(room.id, room);
        },
        err => console.error(err, 'You do not have access!')
      );
  }

  getRoom(roomId: string): Observable<Room> {
    const roomPath = `${this.roomMetadataPath}/${roomId}`;
    return this.afd.object(roomPath).snapshotChanges().map(action => {
      // could do some data tranformation here, if necessary
      return { ...action.payload.val() };
    });
  }

  removeRoom(metadata: Room): Promise<any> {
    return this.afd.list(this.roomMetadataPath).remove(metadata.id);
  }

  updateRoom(metadata: Room, changes: any): Promise<any> {
    return this.afd.list(this.roomMetadataPath).update(metadata.id, changes);
  }

  /** ROOM MESSAGES **/
  createRoomMessage(roomId: string, message: Message): void {
    const messagePath = `${this.roomMessagesPath}/${roomId}/SOURCE`;
    message.timestamp = firebase.database.ServerValue.TIMESTAMP;

    const promise = this.afd.list(messagePath).push({});

    promise
      .then(
        result => {
          message.id = result.key;
          this.afd.list(messagePath).set(message.id, message);
        },
        err => console.error(err, 'You do not have access!')
      );
  }

  getRoomMessages(roomId: string): AngularFireList<any> {
    return this.afd.list(`${this.roomMessagesPath}/${roomId}/OUTPUT`);
  }

  getRoomMessagesByQuery(roomId: string, subject$: BehaviorSubject<string|null>): Observable<Message[]> {
    return subject$.switchMap(subject => {
      return this.afd.list(`${this.roomMessagesPath}/${roomId}/OUTPUT`,
        ref => subject ? ref.orderByChild('language').equalTo(subject) : ref)
        .snapshotChanges()
        .map(changes => {
          // could do some data tranformation here, if necessary
          return changes.map(c => ({ ...c.payload.val() }));
        });
    });
  }

  removeRoomMessage(roomId: string, message: Message): Promise<any> {
    return this.afd.list(`${this.roomMessagesPath}/${roomId}`).remove(message.id);
  }

  updateRoomMessage(roomId: string, message: Message, changes: any): Promise<any> {
    return this.afd.list(this.roomMessagesPath + '/' + roomId).update(message.id, changes);
  }

  deleteRoomMessages(roomId: string): Promise<any> {
    return this.afd.list(this.roomMessagesPath + '/' + roomId).remove();
  }

  /** ROOM USERS **/
  createRoomUser(roomId: string, user: User): ThenableReference {
    return this.afd.list(this.roomUsersPath + '/' + roomId).push(user);
  }

  getRoomUsers(roomId: string): Observable<RoomUsers[]> {
    return this.afd.list(`${this.roomUsersPath}/${roomId}`)
      .snapshotChanges().map(changes => {
        return changes.map(c => ({ ...c.payload.val() }));
      });
  }

  removeRoomUser(roomId: string, user: User): Promise<any> {
    return this.afd.list(this.roomUsersPath + '/' + roomId).remove(user.id);
  }

  updateRoomUser(roomId: string, user: User, changes: any): Promise<any> {
    return this.afd.list(this.roomUsersPath + '/' + roomId).update(user.id, changes);
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

  // Event to monitor current authService + user state.
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
  // public createRoom(roomName, roomType, callback) {

  // }

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

  public userIsModerator() {

  }

  public warn(msg) {

  }
}
