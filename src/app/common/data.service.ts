import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable} from '@angular/core';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database';
import {AuthService} from '../auth/auth.service';
import {
  IModerator, IRoomMessages, IMessage, IRoom, IUser, Message, IRoomUsers,
  ISuspendedUsers, Room, User
} from './data.model';

import * as firebase from 'firebase';
import {Observable} from 'rxjs/Observable';
import ThenableReference = firebase.database.ThenableReference;
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class DataService {
  private moderatorsPath: string;
  private roomMessagesPath: string;
  private roomMetadataPath: string;
  private roomUsersPath: string;
  private suspensionsPath: string;
  private userNamesOnlinePath: string;
  private usersPath: string;

  private roomsRef: AngularFireList<IRoom>;
  private usersRef: AngularFireList<IUser>;

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
  get moderators(): AngularFireList<IModerator[]> {
      return this.afd.list(this.moderatorsPath);
  }

  get roomMessages(): AngularFireList<IRoomMessages[]> {
      return this.afd.list(this.roomMessagesPath);
  }

  get rooms(): AngularFireList<IRoom[]> {
      return this.afd.list(this.roomMetadataPath);
  }

  get roomUsers(): AngularFireList<IRoomUsers[]> {
      return this.afd.list(this.roomUsersPath);
  }

  get suspensions(): AngularFireObject<ISuspendedUsers> {
      return this.afd.object(this.suspensionsPath);
  }

  get userNamesOnline(): AngularFireList<IModerator[]> {
      return this.afd.list(this.userNamesOnlinePath);
  }

  get users(): AngularFireList<IUser[]> {
      return this.afd.list(this.usersPath);
  }
  */

  /** USERS **/
  createUser(user: User): ThenableReference {
    return this.afd.list(this.usersPath).push(user);
  }

  getUser(userId: string): Observable<IUser> {
    const userPath = `${this.usersPath}/${userId}`;
    return this.afd.object(userPath).snapshotChanges().map(action => {
      return { $key: action.payload.key, ...action.payload.val() };
    });
  }

  removeUser(user: IUser): Promise<any> {
    return this.afd.list(this.usersPath).remove(user.$key);
  }

  updateUser(user: IUser): Promise<any> {
    const userCopy = {...user};
    delete userCopy.$key;

    return this.afd.list(this.usersPath).update(user.$key, userCopy);
  }

  /** ROOM METADATA **/
  getRooms(): Observable<IRoom[]> {
    return this.roomsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ $key: c.payload.key, ...c.payload.val() }));
    });
  }

  createRoom(room: Room): ThenableReference {
    room.createdAt = firebase.database.ServerValue.TIMESTAMP;
    room.createdByUserId = this.auth.id;
    room.authorizedUsers = {};
    room.authorizedUsers[this.auth.id] = true;

    return this.roomsRef.push(room);
  }

  getRoom(roomId: string): Observable<IRoom> {
    const roomPath = `${this.roomMetadataPath}/${roomId}`;
    return this.afd.object(roomPath).snapshotChanges().map(action => {
      return { $key: action.payload.key, ...action.payload.val() };
    });
  }

  removeRoom(metadata: IRoom): Promise<any> {
    return this.afd.list(this.roomMetadataPath).remove(metadata.$key);
  }

  updateRoom(metadata: IRoom, changes: any): Promise<any> {
    return this.afd.list(this.roomMetadataPath).update(metadata.$key, changes);
  }

  /** ROOM MESSAGES **/
  createRoomMessage(roomId: string, message: Message): ThenableReference {
    message.timestamp = firebase.database.ServerValue.TIMESTAMP;
    return this.afd.list(`${this.roomMessagesPath}/${roomId}/SOURCE`).push(message);
  }

  getRoomMessages(roomId: string): AngularFireList<any> {
    return this.afd.list(`${this.roomMessagesPath}/${roomId}/OUTPUT`);
  }

  getRoomMessagesByQuery(roomId: string, subject$: BehaviorSubject<string|null>): Observable<IMessage[]> {
    return subject$.switchMap(subject => {
      return this.afd.list(`${this.roomMessagesPath}/${roomId}/OUTPUT`,
        ref => subject ? ref.orderByChild('language').equalTo(subject) : ref)
        .snapshotChanges()
        .map(changes => {
          return changes.map(c => ({ $key: c.payload.key, ...c.payload.val() }));
        });
    });
  }

  removeRoomMessage(roomId: string, message: IMessage): Promise<any> {
    return this.afd.list(`${this.roomMessagesPath}/${roomId}`).remove(message.$key);
  }

  updateRoomMessage(roomId: string, message: IMessage, changes: any): Promise<any> {
    return this.afd.list(this.roomMessagesPath + '/' + roomId).update(message.$key, changes);
  }

  deleteRoomMessages(roomId: string): Promise<any> {
    return this.afd.list(this.roomMessagesPath + '/' + roomId).remove();
  }

  /** ROOM USERS **/
  createRoomUser(roomId: string, user: User): ThenableReference {
    return this.afd.list(this.roomUsersPath + '/' + roomId).push(user);
  }

  getRoomUsers(roomId: string): Observable<IRoomUsers[]> {
    return this.afd.list(`${this.roomUsersPath}/${roomId}`)
      .snapshotChanges().map(changes => {
        return changes.map(c => ({ $key: c.payload.key, ...c.payload.val() }));
      });
  }

  removeRoomUser(roomId: string, user: IUser): Promise<any> {
    return this.afd.list(this.roomUsersPath + '/' + roomId).remove(user.$key);
  }

  updateRoomUser(roomId: string, user: IUser, changes: any): Promise<any> {
    return this.afd.list(this.roomUsersPath + '/' + roomId).update(user.$key, changes);
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
