import {Component, OnInit, ViewEncapsulation, OnDestroy} from '@angular/core';
import {Room} from '../common/data-model';
import {FirebaseListObservable} from 'angularfire2/database';
import {MdDialogRef} from '@angular/material';

@Component({
    selector: 'app-new-room',
    templateUrl: './room-metadata.component.html',
    styleUrls: ['./room-metadata.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RoomMetadataComponent implements OnInit, OnDestroy {

    // Param and object
    newRoom: Room;

    constructor(public dialogRef: MdDialogRef<RoomMetadataComponent>) {
        this.newRoom = new Room();
    }

    ngOnInit() {

    }

    ngOnDestroy() {}

    save(evt: Event) {
        this.newRoom.type = 'public';

        // close the dialog
        this.dialogRef.close(this.newRoom);
    }

    cancel(evt: Event) {
        // close the dialog
        this.dialogRef.close();
    }
}
