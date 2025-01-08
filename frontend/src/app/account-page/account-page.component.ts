import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from '../api.service';

interface user {
  id: number;
  name: string;
  email: string;
}
@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.css'
})
export class AccountPageComponent {
  userData: user | null = null;
  currentRoute: string = '';
  constructor(private router: Router, private apiService: ApiService) { }
  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects
        this.updateSelectedLink()
        console.log(this.currentRoute)
      })
    this.currentRoute = this.router.url;
    this.updateSelectedLink();
    const storeData =localStorage.getItem('userData');
    if(storeData){
      this.userData = JSON.parse(storeData)
    }
  }
  updateSelectedLink(): void {
    const menuItems = document.querySelectorAll('.menu-list-item');
    menuItems.forEach((item) => {
      const routerLink = item.getAttribute('routerLink');
      if (routerLink === this.currentRoute) {
        item.classList.add('selected');

      } else { item.classList.remove('selected'); }
    });
  }
  logOut(){
    this.apiService.logOut()
    this.router.navigate(['/'])
  }

}

