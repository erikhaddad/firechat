import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {FirestoreService} from '../common/firestore.service';
import {User} from '../common/data.model';
import {LayoutService} from '../common/layout.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isMobile: boolean;

  currentUser$: Observable<User>;
  currentUser: User;

  constructor(public authService: AuthService,
              public firestoreService: FirestoreService,
              public layoutService: LayoutService) {

    this.currentUser = null;
    authService.authState$.subscribe(authUser => {
      if (authUser != null) {
        this.currentUser$ = firestoreService.getUser(authUser.uid);

        this.currentUser$.subscribe(user => {
          this.currentUser = user;
        });
      }
    });

    this.isMobile = layoutService.mobileWidthState;
    layoutService.widthMobileAnnounced$.subscribe(
      isMobile => {
        this.isMobile = isMobile;
      });
  }

  ngOnInit() {
    this.layoutService.handleSectionId('home');
    this.layoutService.handleShowToolbar(false);
    this.layoutService.handleShowNav(false);
    this.layoutService.handleShowDetails(false);
  }

}
