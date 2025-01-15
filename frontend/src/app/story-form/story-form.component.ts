import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

interface Story {
  id: number;
  name: string;
  description: string;
  content: string;
  admin_id: number;
  in_progress: boolean;
}

@Component({
  selector: 'app-story-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './story-form.component.html',
  styleUrls: ['./story-form.component.css']
})
export class StoryFormComponent {
  storyForm: FormGroup;
  userIsLogged: boolean = true;
  userId: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<StoryFormComponent>,
    private apiService: ApiService,
    private router: Router
  ) {
    this.storyForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      content: ['', Validators.required],
      admin_id: ['', Validators.required],
      in_progress: ['', Validators.required]
    });
  }

  submitForm() {
    this.storyForm.get('in_progress')?.setValue(true)
    this.apiService.userId$.subscribe((userId: number) => {
      this.userId = userId
    })
    this.storyForm.get('admin_id')?.setValue(this.userId)

    const storyData = {
      name: this.storyForm.get('name')?.value,
      description: this.storyForm.get('description')?.value,
      content: this.storyForm.get('content')?.value || '-', // Valor por defecto
      admin_id: this.storyForm.get('admin_id')?.value,
      in_progress: this.storyForm.get('in_progress')?.value
    };
    
    if (this.storyForm.valid) {
      this.apiService.createStory(storyData).subscribe({
        next: response => {
          this.storyForm.reset();
          this.dialogRef.close(response);
          const id = response.id;
          this.router.navigate(['/Principal', id]);
        },
        error: error => {
          alert('Error al añadir la historia: ' + error.message);
        }
      });
    } else {
      alert('Completa todos los campos');
    }
  }
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.storyForm.patchValue({ image_url: file });
      console.log(file);
    }
  }
}
