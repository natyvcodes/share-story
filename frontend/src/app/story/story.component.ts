import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
interface Story {
  id: number;
  name: string;
  description: string;
  content: string;
  admin_id: number;
  in_progress: boolean;
  image_url: string;
}
@Component({
  selector: 'app-story',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './story.component.html',
  styleUrl: './story.component.css'
})
export class StoryComponent implements OnInit {
  story!: Story[]
  storyId!: number;
  userIsLogged: boolean = false;
  userId: number | null = null;
  constructor(private apiService: ApiService, private router: Router) { }
  ngOnInit(): void {
    this.apiService.userIsLogIn$.subscribe((login: boolean) => {
      this.userIsLogged = login
      if(!this.userIsLogged){
        this.loadStories()
      }
    })
    this.apiService.userId$.subscribe((userId: number) => {
      this.userId = userId;
    })
    this.apiService.stories$.subscribe(stories => {
      if (this.userIsLogged) {
        this.story = stories.filter(story => story.admin_id !== this.userId);
      }
    })
  }

  loadStories(): void {
    this.apiService.getStories().subscribe({
      next: (stories) => {
        this.story = stories;
      },
      error: (error) => {
        console.error('Error al cargar historias:', error);
      }
    });
  }
  editStory(storyId: number) {
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
