import { Component, inject, OnInit } from '@angular/core';
import { StoryComponent } from '../story/story.component';
import { ApiService } from '../api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StoryFormComponent } from '../story-form/story-form.component';
import { LogindialogComponent } from '../logindialog/logindialog.component';
import { MystoriesComponent } from '../mystories/mystories.component';
interface Story {
  id: number;
  name: string;
  description: string;
  content: string;
  admin_id: number;
  is_finish: boolean;
  image_url: string;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [StoryComponent, MatDialogModule, MystoriesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  story: Story[] = []
  userIsLogged: boolean = false;
  constructor(private apiService: ApiService) {

  }
  showStoryForm() {
    if (this.userIsLogged) {
      const dialogRef = this.dialog.open(StoryFormComponent, {
        width: '800px',
        height: '80vh'
      });
    } else {
      const dialogRef = this.dialog.open(LogindialogComponent, {
        width: '220px'
      });
    }

  }
  ngOnInit(): void {
    this.apiService.userIsLogIn$.subscribe((login: boolean) => {
      this.userIsLogged = login
    })
  }
}
