import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {LayoutService} from '../common/layout.service';

@Component({
  styleUrls: ['sign-in.component.scss'],
  templateUrl: 'sign-in.component.html'
})

export class SignInComponent implements OnInit {
  constructor(private auth: AuthService,
              private router: Router,
              public layoutService: LayoutService) {
  }

  ngOnInit() {
    this.layoutService.handleSectionId('sign-in');
    this.layoutService.handleShowToolbar(false);
    this.layoutService.handleShowNav(false);
    this.layoutService.handleShowDetails(false);
  }

  signInWithGithub(): void {
    this.auth.signInWithGithub()
      .then(() => this.postSignIn());
  }

  signInWithGoogle(): void {
    this.auth.signInWithGoogle()
      .then(() => this.postSignIn());
  }

  signInWithTwitter(): void {
    this.auth.signInWithTwitter()
      .then(() => this.postSignIn());
  }

  signInWithFacebook(): void {
    this.auth.signInWithFacebook()
      .then(() => this.postSignIn());
  }

  private postSignIn(): void {
    this.router.navigate(['/messages']);
  }
}
