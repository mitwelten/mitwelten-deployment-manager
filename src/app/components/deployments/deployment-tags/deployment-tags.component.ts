import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { DataService } from 'src/app/services';

@Component({
  selector: 'app-deployment-tags',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
  ],
  templateUrl: './deployment-tags.component.html',
  styleUrl: './deployment-tags.component.css'
})
export class DeploymentTagsComponent implements OnInit {

  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl('');
  filteredTags?: Observable<string[]>;
  allTags?: string[];

  @Input()
  tags: string[] = [];

  @Output()
  tagsChanged = new EventEmitter<string[]>;

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      switchMap((tag: string | null) => {
        if(this.allTags) { // if tags have been fetched already, use the local list
          if (!tag) return of(this.allTags);
          else {
            const v = tag.toLowerCase()
            return of(this.allTags.filter(t => t.toLowerCase().includes(v)));
          }
        }
        return this.dataService.listTags().pipe( // fetch tags list and store locally
          map(tags => tags.map(t => t.name)),
          tap(tags => this.allTags = tags),
          map((tags: string[]) => {
            if (!tag) return tags;
            else {
              const v = tag.toLowerCase();
              return tags.filter(t => t.toLowerCase().includes(v));
            }
          }));
      })
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tag
    if (value) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
  }

  remove(name: string): void {
    const index = this.tags.indexOf(name);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.viewValue);
    // emit tag list
    this.tagsChanged.emit(this.tags);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

}
