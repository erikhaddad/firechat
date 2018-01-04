import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Moderator, RoomMessages, Message, Room, User, RoomUsers, SuspendedUsers} from './data.model';

import {Observable} from 'rxjs/Observable';
import ThenableReference = firebase.database.ThenableReference;
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import * as firebase from 'firebase';

@Injectable()
export class FirestoreService {
  private moderatorsPath: string;
  private roomMessagesPath: string;
  private roomMetadataPath: string;
  private roomUsersPath: string;
  private suspensionsPath: string;
  private userNamesOnlinePath: string;
  private usersPath: string;

  private roomsRef: AngularFirestoreCollection<Room>;
  private usersRef: AngularFirestoreCollection<User>;

  constructor(private afs: AngularFirestore, private auth: AuthService) {
    this.moderatorsPath = 'moderators';
    this.roomMessagesPath = 'room-messages';
    this.roomMetadataPath = 'room-metadata';
    this.roomUsersPath = 'room-users';
    this.suspensionsPath = 'suspensions';
    this.userNamesOnlinePath = 'user-names-online';
    this.usersPath = 'users';

    this.roomsRef = this.afs.collection<Room>(this.roomMetadataPath);
    this.usersRef = this.afs.collection<User>(this.usersPath);
  }

  /*
  get moderators(): AngularFirestoreCollection<Moderator[]> {
      return this.afs.collection(this.moderatorsPath);
  }

  get roomMessages(): AngularFirestoreCollection<RoomMessages[]> {
      return this.afs.collection(this.roomMessagesPath);
  }

  get rooms(): AngularFirestoreCollection<Room[]> {
      return this.afs.collection(this.roomMetadataPath);
  }

  get roomUsers(): AngularFirestoreCollection<RoomUsers[]> {
      return this.afs.collection(this.roomUsersPath);
  }

  get suspensions(): AngularFireObject<SuspendedUsers> {
      return this.afs.doc(this.suspensionsPath);
  }

  get userNamesOnline(): AngularFirestoreCollection<Moderator[]> {
      return this.afs.collection(this.userNamesOnlinePath);
  }

  get users(): AngularFirestoreCollection<User[]> {
      return this.afs.collection(this.usersPath);
  }
  */
  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp()
  }

  /** USERS **/
  createUser(user: User): Promise<any> {
    const newUserId: string = this.afs.createId();

    return this.afs.doc<User>(`${this.usersPath}/${newUserId}`).set(user);
  }

  getUser(userId: string): AngularFirestoreDocument<User> {
    return this.afs.doc<User>(`${this.usersPath}/${userId}`);
  }

  removeUser(user: User): Promise<any> {
    return this.afs.doc<User>(`${this.usersPath}/${user.id}`).delete();
  }

  updateUser(user: User): Promise<any> {
    return this.afs.doc<User>(`${this.usersPath}/${user.id}`).update(user);
  }

  /** ROOM METADATA **/
  getRooms(): Observable<Room[]> {
    return this.roomsRef.valueChanges();
  }

  createRoom(room: Room): Promise<any> {
    const newRoomId: string = this.afs.createId();

    room.createdAt = this.timestamp;
    room.createdByUserId = this.auth.id;
    room.authorizedUsers = {};
    room.authorizedUsers[this.auth.id] = true;

    return this.afs.doc<Room>(`${this.roomMetadataPath}/${newRoomId}`).set(room);
  }

  getRoom(roomId: string): Observable<Room> {
    const roomPath = `${this.roomMetadataPath}/${roomId}`;
    return this.afs.doc<Room>(roomPath).valueChanges();
  }

  removeRoom(room: Room): Promise<any> {
    const roomPath = `${this.roomMetadataPath}/${room.id}`;
    return this.afs.doc<Room>(roomPath).delete();
  }

  updateRoom(room: Room): Promise<any> {
    const roomPath = `${this.roomMetadataPath}/${room.id}`;
    return this.afs.doc<Room>(roomPath).update(room);
  }

  /** ROOM MESSAGES **/
  createRoomMessage(roomId: string, message: Message): Promise<any> {
    const newMessageId: string = this.afs.createId();
    const messagePath = `${this.roomMessagesPath}/${roomId}/SOURCE/${newMessageId}`;
    message.id = newMessageId;
    message.timestamp = this.timestamp;

    return this.afs.doc<Message>(messagePath).set(message);
  }

  getRoomMessages(roomId: string): Observable<Message[]> {
    return this.afs.collection<Message>(`${this.roomMessagesPath}/${roomId}/OUTPUT`).valueChanges();
  }

  getRoomMessagesByQuery(roomId: string, language$: BehaviorSubject<string|null>): Observable<Message[]> {
    return language$.switchMap(language => {
      return this.afs.collection<Message>(`${this.roomMessagesPath}/${roomId}/OUTPUT`,
        ref => language ? ref.where('language', '==', language)
              .orderBy('timestamp') : ref)
        .valueChanges();
    });
  }

  removeRoomMessage(roomId: string, message: Message): Promise<any> {
    return this.afs.doc(`${this.roomMessagesPath}/${roomId}/SOURCE/${message.id}`).delete();
  }

  updateRoomMessage(roomId: string, message: Message): Promise<any> {
    return this.afs.doc<Message>(`${this.roomMessagesPath}/${roomId}/SOURCE/${message.id}`).update(message);
  }

  deleteRoomMessages(roomId: string): Promise<any> {
    return this.deleteCollection(firebase.database,
                                  this.afs.collection(`${this.roomMessagesPath}/${roomId}/SOURCE`),
                        25);
  }

  /** ROOM USERS **/
  createRoomUser(roomId: string, user: User): Promise<any> {
    return this.afs.doc<User>(`${this.roomUsersPath}/${roomId}/users/${user.id}`).set(user);
  }

  getRoomUsers(roomId: string): Observable<User[]> {
    return this.afs.collection<User>(`${this.roomUsersPath}/${roomId}/users`).valueChanges();
  }

  removeRoomUser(roomId: string, user: User): Promise<any> {
    return this.afs.doc<User>(`${this.roomUsersPath}/${roomId}/users/${user.id}`).delete();
  }

  updateRoomUser(roomId: string, user: User, changes: any): Promise<any> {
    return this.afs.doc(`${this.roomUsersPath}/${roomId}/users/${user.id}`).update(user);
  }

  /**
   * Delete a collection, in batches of batchSize. Note that this does
   * not recursively delete subcollections of documents in the collection
   */
  private deleteCollection(db, collectionRef, batchSize: number) {
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
  }

  private deleteQueryBatch(db, query, batchSize: number, resolve, reject) {
    query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size === 0) {
          return 0;
        }

        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted <= batchSize) {
          resolve();
          return;
        }

        this.deleteQueryBatch(db, query, batchSize, resolve, reject);
      })
      .catch(reject);
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
