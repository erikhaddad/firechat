/*
 moderators/
     <user-id> - A list of user ids and their moderator status.
        true|false - A boolean value indicating the user's moderator status.
 room-messages/
    <room-id>
        <message-id>
            userId - The id of the user that sent the message.
            name - The name of the user that sent the message.
            message - The content of the message.
            timestamp - The time at which the message was sent.
 room-metadata/
    <room-id>
        createdAt - The time at which the room was created.
        createdByUserId- The id of the user that created the room.
        id - The id of the room.
        name - The public display name of the room.
        type - The type of room, public or private.
 room-users/
     <room-id>
        <user-id>
 suspensions/
    <user-id> - A list of user ids and their suspension status.
        suspendedUntil
 user-names-online/
    <user-id>
 users/
    <user-id>
        id - The id of the user.
        name - The display name of the user.
        email - user email address
        avatar - user photo url
        status - user login status
        invites - A list of invites the user has received.
        muted - A list of user ids currently muted by the user.
        rooms - A list of currently active rooms, used for sessioning.
 */

export interface IModerator {
    $key?: string; // user-id
    value: boolean; // A boolean value indicating the user's moderator status.
}
export class Moderator implements IModerator {
    value: boolean;
}

export interface IRoomMessages {
    $key?: string; // room-id
    messages: IMessage[];
}
export class RoomMessages implements IRoomMessages {
    messages: IMessage[];
}

export interface IMessage {
    $key?: string; // message-id
    userId: string; // The id of the user that sent the message.
    name: string; // The name of the user that sent the message.
    avatar: string; // URL of avatar image
    language: number; // Language ID of originating text
    message: string; // The content of the message.
    timestamp: number|object; // The time at which the message was sent.
}
export class Message implements IMessage {
    userId: string; // The id of the user that sent the message.
    name: string; // The name of the user that sent the message.
    avatar: string; // URL of avatar image
    language: number; // Language ID of originating text
    message: string; // The content of the message.
    timestamp: number|object; // The time at which the message was sent.
}

export interface IRoom {
    $key?: string; // room-id
    createdAt: number|object; // The time at which the room was created.
    createdByUserId: string; // The id of the user that created the room.
    name: string; // The public display name of the room.
    description: string; // The public description of the room.
    type: string; // The type of room, public or private.
    authorizedUsers: { [userId: string]: boolean };
}
export class Room implements IRoom {
    createdAt: number|object; // The time at which the room was created.
    createdByUserId: string; // The id of the user that created the room.
    name: string; // The public display name of the room.
    description: string; // The public description of the room.
    type: string; // The type of room, public or private.
    authorizedUsers: { [userId: string]: boolean };
}

export interface IRoomUsers {
    $key?: string; // room-id
    users: IUser[];
}
export class RoomUsers implements IRoomUsers {
    users: IUser[];
}

export interface ISuspendedUsers {
    $key?: string;
    users: IUser[];
}
export class SuspendedUsers implements ISuspendedUsers {
    users: User[];
}

export interface INotification {
    $key?: string;
    fromUserId: string;
}
export class Notification implements INotification {
    fromUserId: string;
}

export interface IUser {
    $key?: string; // user-id
    id: string; // The id of the user.
    name: string; // The display name of the user.
    email: string; // Email address of the user.
    avatar: string; // URL of avatar image
    createdAt: string; // Online or how long user has been away
    invites: string[]; // A list of invites the user has received.
    muted: string[]; // A list of user ids currently muted by the user.
    rooms: string[]; // A list of currently active rooms, used for sessioning.
    notifications: INotification[];
    preferences: IUserPreferences;
}
export class User implements IUser {
    id: string; // The id of the user.
    name: string; // The display name of the user.
    email: string; // Email address of the user.
    avatar: string; // URL of avatar image
    createdAt: string; // Online or how long user has been away
    invites: string[]; // A list of invites the user has received.
    muted: string[]; // A list of user ids currently muted by the user.
    rooms: string[]; // A list of currently active rooms, used for sessioning.
    notifications: Notification[];
    preferences: IUserPreferences;
}

export enum Languages {
    English = 0,
    Spanish = 1,
    Portuguese = 2,
    German = 3
}

export interface ILanguage {
    id: number;
    abbreviation: string;
    name: string;
}

export enum Themes {
    Light = 0,
    Dark = 1
}

export interface IUserPreferences {
    language: number;
    moderate: boolean;
    theme: number;
}
