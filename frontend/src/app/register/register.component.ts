import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { DialogRef } from '@angular/cdk/dialog';
import { ApiService } from '../api.service';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup
  readonly dialog = inject(MatDialog);
  errorMessage: string = ''
  constructor(private formBuilder: FormBuilder, private dialogRef: DialogRef<RegisterComponent>, private apiService: ApiService) {
    this.registerForm = this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', Validators.required],
        password: ['', Validators.required]
    })
  }
  register() {
    const name = this.registerForm.get('name')?.value
    const email = this.registerForm.get('email')?.value
    const password = this.registerForm.get('password')?.value
    if (this.registerForm.valid) {
      this.apiService.userRegister(name, email, password).subscribe({
          next: response => {
            this.dialogRef.close()
          },
          error: (err) => {
            this.errorMessage = err.error.message || 'Invalid email or password';
            console.error('Error during login:', err);
          }
        }
      )
    }
  }
  logIn() {
    this.dialogRef.close()
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '380px'
    });
  }
}
