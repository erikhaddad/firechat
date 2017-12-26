import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AppStateService {
  public params = new BehaviorSubject(undefined);

  setParams(val: any) {
    this.params.next(val);
  }
}
