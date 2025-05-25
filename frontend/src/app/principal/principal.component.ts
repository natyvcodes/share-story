import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { MatDialog } from '@angular/material/dialog';
import { LogindialogComponent } from '../logindialog/logindialog.component';
import { Router } from '@angular/router';
import { DeletedialogComponent } from '../deletedialog/deletedialog.component';
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
  selector: 'app-principal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent implements OnInit {
  storyId: number = 0;
  storyData!: Story;
  newContentForm: FormGroup
  newContent: string = ''
  userId!: number;
  storyOwner!: number;
  userRole: string = '';
  isAdmin: boolean = false;
  storyState: boolean = false;
  userIsLogged: boolean = false;
  storyStateName: string = ''
  text: string = ''
  count: number = 0;
  readonly dialog = inject(MatDialog);

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.newContentForm = this.formBuilder.group({
      newContent: ['', Validators.required]
    })
  }
  ngOnInit(): void {
    this.counter()
    this.apiService.setAdmin()
    this.apiService.userIsLogIn$.subscribe(value => {
      this.userIsLogged = value;
      this.setStoryConf()
    })
    this.apiService.userId$.subscribe(userId => {
      this.userId = userId;
    })
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id !== null) {
        this.storyId = +id;
        this.getStoryDetails();
      }
    });

  }
  updateStory() {
    if (this.userIsLogged) {
      if (this.newContentForm.valid) {
        this.newContent = this.newContentForm.get('newContent')?.value
        this.apiService.updateStory(this.storyId, this.newContent).subscribe({
          next: () => {
            this.storyData.content += (" " + this.newContent);
            this.count = 0;
            this.newContentForm.reset()
          },
          error: error => {
            alert('Error al actualizar la historia: ' + error.message);
          }
        })
      } else {
        alert('You need a text')
      }
    } else {
      const dialogRef = this.dialog.open(LogindialogComponent, {
        width: '220px'
      });
      this.newContentForm.reset()
    }
  }
  eraseInfo() {
    this.newContentForm.reset();
  }
  setStoryConf() {
    this.apiService.storyOwner$.subscribe(value => {
      this.storyOwner = value;
      if (this.storyOwner == this.userId) {
        this.userRole = 'OWNER'
      } else {
        this.userRole = 'CONTRIBUITER'
      }
    })
    this.apiService.storyAdmin$.subscribe((isAdmin: boolean) => {
      this.isAdmin = isAdmin;
    })
    this.apiService.storyState$.subscribe(in_process => {
      this.storyState = in_process;
      if (this.storyState) {
        this.storyStateName = 'IN PROCESS'
      } else {
        this.storyStateName = 'FINISHED'
      }
    })
  }
  getStoryDetails() {
    if (this.storyId != null) {
      this.apiService.getStoryById(this.storyId).subscribe((story) => {
        this.storyData = story;
      })
    }
  }
  updateStoryState() {
    if (this.storyId != null) {
      const newState = !this.storyState;
      this.apiService.updateStoryState(this.storyId, newState).subscribe()
    }
  }
  counter() {
    this.newContentForm.get('newContent')?.valueChanges.subscribe((value) => {
      if (value === null || value === '') {
        this.text = '';
        this.count = 0;
      } else {
        this.text = value;
        this.count = this.text.length
      }
    })
  }
  deleteStory() {
    const dialogRef = this.dialog.open(DeletedialogComponent, {
      width: '300px',
      data: { message: `Are you sure you want to delete this story: ${this.storyData.name}?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.deleteStory(this.storyId).subscribe()
        this.router.navigate(['/'])
      }
    });
  }
}
