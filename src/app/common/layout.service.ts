import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';

const SCREEN_MOBILE = 'screen and (max-width: 600px)';

@Injectable()
export class LayoutService implements OnDestroy {

  activeMediaQuery: string;
  watcher: Subscription;

  private _sectionId = 'home';

  private _toolbarShowState: boolean;
  private _navShowState: boolean;
  private _detailsShowState: boolean;
  private _mobileWidthState: boolean;

  // Observable boolean sources
  private sectionIdAnnouncedSource = new Subject<string>();
  private showNavAnnouncedSource = new Subject<boolean>();
  private showToolbarAnnouncedSource = new Subject<boolean>();
  private showDetailsAnnouncedSource = new Subject<boolean>();
  private widthMobileAnnouncedSource = new Subject<boolean>();

  // Observable boolean streams
  sectionIdAnnounced$ = this.sectionIdAnnouncedSource.asObservable();
  showToolbarAnnounced$ = this.showToolbarAnnouncedSource.asObservable();
  showNavAnnounced$ = this.showNavAnnouncedSource.asObservable();
  showDetailsAnnounced$ = this.showDetailsAnnouncedSource.asObservable();
  widthMobileAnnounced$ = this.widthMobileAnnouncedSource.asObservable();

  constructor(public media: ObservableMedia) {
    this.activeMediaQuery = '';

    // Defaults
    this.handleShowToolbar(false);
    this.handleWidthMobile(false);
    this.handleShowNav(false);
    this.handleShowDetails(false);

    this.watcher = media.subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : '';
      // console.log('constructor', change.mqAlias, change, this.activeMediaQuery);

      if (change.mqAlias === 'xs' || change.mqAlias === 'sm') {
        this.setMobile();
      } else {
        this.setDesktop();
      }
    });
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }

  setDesktop() {
    this.handleShowToolbar(this.sectionId !== 'home' && this.sectionId !== 'landing');
    this.handleShowNav(this.sectionId !== 'home' && this.sectionId !== 'landing');
    this.handleWidthMobile(false);
    // this.handleShowDetails(false);
  }

  setMobile() {
    this.handleShowToolbar(this.sectionId !== 'home' && this.sectionId !== 'landing');
    this.handleShowNav(false);
    this.handleWidthMobile(true);
    // this.handleShowDetails(false);
  }

  // Service message commands
  handleSectionId(sectionId: string) {
    this.sectionId = sectionId;
    this.sectionIdAnnouncedSource.next(sectionId);

    this.handleShowToolbar(this.sectionId !== 'home' && this.sectionId !== 'landing');
    this.handleShowNav(this.sectionId !== 'home' && this.sectionId !== 'landing');
    this.handleShowDetails(this.sectionId !== 'home' &&
      this.sectionId !== 'landing' && this.sectionId !== 'mileage-calculator');
  }
  handleShowToolbar(show: boolean) {
    this.toolbarShowState = show;
    this.showToolbarAnnouncedSource.next(show);
  }
  handleShowNav(show: boolean) {
    this.navShowState = show;
    this.showNavAnnouncedSource.next(show);
  }
  handleShowDetails(show: boolean) {
    this.detailsShowState = show;
    this.showDetailsAnnouncedSource.next(show);
  }
  handleWidthMobile(isMobile: boolean) {
    this.mobileWidthState = isMobile;
    this.widthMobileAnnouncedSource.next(isMobile);
  }

  // section id
  get sectionId(): string {
    return this._sectionId;
  }

  set sectionId(value: string) {
    this._sectionId = value;
  }

  // toolbar state
  get toolbarShowState(): boolean {
    return this._toolbarShowState;
  }

  set toolbarShowState(value: boolean) {
    this._toolbarShowState = value;
  }

  // nav show state
  get navShowState(): boolean {
    return this._navShowState;
  }

  set navShowState(value: boolean) {
    this._navShowState = value;
  }

  // floating action button state
  get detailsShowState(): boolean {
    return this._detailsShowState;
  }

  set detailsShowState(value: boolean) {
    this._detailsShowState = value;
  }

  get mobileWidthState(): boolean {
    return this._mobileWidthState;
  }

  set mobileWidthState(value: boolean) {
    this._mobileWidthState = value;
  }
}
