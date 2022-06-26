import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService, Node } from 'src/app/shared';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css']
})
export class EditFormComponent implements OnInit {

  nodes: Node[] | [] = [];

  name = new FormControl('');

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    if ('id' in this.route.snapshot.params) {
      const id = Number(this.route.snapshot.params['id']);
    }
    this.dataService.listNodes().subscribe(nodes => this.nodes = nodes);
  }

}
