import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css']
})
export class EditFormComponent implements OnInit {

  name = new FormControl('');

  constructor() { }

  ngOnInit(): void {
  }

}
