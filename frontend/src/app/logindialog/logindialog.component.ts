import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-logindialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './logindialog.component.html',
  styleUrl: './logindialog.component.css'
})
export class LogindialogComponent {

}
