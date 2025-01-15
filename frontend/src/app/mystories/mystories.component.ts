import { Component, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { Story } from '../api.service';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { DeletedialogComponent } from '../deletedialog/deletedialog.component';
import { MatDialog } from '@angular/material/dialog';

interface user {
  id: number;
  name: string;
  email: string;
}
@Component({
  selector: 'app-mystories',
  standalone: true,
  imports: [],
  templateUrl: './mystories.component.html',
  styleUrl: './mystories.component.css'
})
export class MystoriesComponent {
  constructor(private apiService: ApiService, private router: Router) {
    this.loadUserStories()
  }
  readonly dialog = inject(MatDialog);
  userData: user | null = null
  userStory: Story[] = [];
  storyId: number = 0;

  loadUserStories() {
    const storeData = localStorage.getItem('userData');
    if (storeData) {
      this.userData = JSON.parse(storeData);
    }
    this.apiService.getStories().subscribe(story => {
      for (let i = 0; i < story.length; i++) {
        if (story[i].admin_id == this.userData?.id) {
          this.userStory.push(story[i])
        }
      }
    })
  }
  deleteStory(storyId: number) {
    const dialogRef = this.dialog.open(DeletedialogComponent, {
      width: '300px',
      data: { message: `Are you sure you want to delete this story?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.deleteStory(storyId).subscribe(
          {
            next: () => {
              this.userStory = this.userStory.filter(story => story.id !== storyId);
            },
            error: error => {
              alert('Error al eliminar la historia: ' + error.message);
            }
          }
        )

      }
    });
  }
  getStoryId(storyId: number) {
    this.apiService.getStoryById(storyId).subscribe({
      next: response => {
        this.storyId = response.id;
        this.deleteStory(storyId)
      },
      error: error => {
        alert('Error al obtener la historia: ' + error.message);
      }
    });
  }
  openStory(storyId: number) {
    this.apiService.getStoryById(storyId).subscribe({
      next: response => {
        const id = response.id;
        this.router.navigate(['/Principal', id]);
      },
      error: error => {
        alert('Error al añadir la historia: ' + error.message);
      }
    });
  }
}
