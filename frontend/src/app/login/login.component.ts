import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { DialogRef } from '@angular/cdk/dialog';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly dialog = inject(MatDialog);
  loginForm: FormGroup;
  errorMessage: string = ''
  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private dialogRef: DialogRef<LoginComponent>) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    }
    )
  }
  logIn() {
    if (this.loginForm.valid) {
      const email: string = this.loginForm.get('email')?.value;
      const password: string = this.loginForm.get('password')?.value;
      this.apiService.LogUser(email, password).subscribe({
        next: (response) => {
          this.dialogRef.close()
        },
        error: (err) => {
          this.errorMessage = err.error.message;
          console.error('Error during login:', err);
        }
      })
    } else {
      this.errorMessage = 'Please fill out the form correctly';
    }
  }
  openRegister() {
    this.dialogRef.close()
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: '380px'
    }
    )
  }
}

