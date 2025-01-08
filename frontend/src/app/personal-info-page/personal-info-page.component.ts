import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { MatDialog } from '@angular/material/dialog';
import { DeletedialogComponent } from '../deletedialog/deletedialog.component';
import { Router } from '@angular/router';
interface user {
  id: number;
  name: string;
  email: string;
}
@Component({
  selector: 'app-personal-info-page',
  standalone: true,
  imports: [],
  templateUrl: './personal-info-page.component.html',
  styleUrl: './personal-info-page.component.css'
})
export class PersonalInfoPageComponent implements OnInit {
  constructor(private apiService: ApiService, private router: Router) { }
  readonly dialog = inject(MatDialog);
  userData: user | null = null
  userId: number | undefined = 0;
  ngOnInit(): void {
    const storeData = localStorage.getItem('userData');
    if (storeData) {
      this.userData = JSON.parse(storeData);
      this.userId = this.userData?.id;
    }
  }
  deleteAccount() {
    const dialogRef = this.dialog.open(DeletedialogComponent, {
      width: '300px',
      data: { message: `Are you sure you want to delete your account?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.deleteAccount(this.userId).subscribe()
        this.apiService.logOut()
        localStorage.removeItem('userData')
        this.router.navigate(['/'])
      }
    });
  }
}
