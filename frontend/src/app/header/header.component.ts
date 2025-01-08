import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { ApiService } from '../api.service';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { RegisterComponent } from '../register/register.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  userIsLogged: boolean = false;
  menu: boolean = false;
  constructor(private apiService: ApiService, private router: Router) { }



  showMenu(){
    this.menu = !this.menu;
  }

  logIn() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '380px'
    });
  }
  register() {
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: '380px'
    });

  }
  logOut() {
    this.apiService.logOut()
    this.router.navigate(['/']);
  }
  ngOnInit(): void {
    this.apiService.userIsLogIn$.subscribe((logIn: boolean) => {
      this.userIsLogged = logIn;
    })
  }


}
