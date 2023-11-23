import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { DataService } from 'src/app/services';
import { Deployment, Node } from 'src/app/shared';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-node',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './node.component.html',
  styleUrl: './node.component.css'
})
export class NodeComponent implements OnInit {

  node: Node;
  deployments: Deployment[] = [];
  nodeDeepLink: string;

  constructor (
    public dialogRef: MatDialogRef<NodeComponent>,
    private dataService: DataService,
    private router: Router,
    private location: Location,
    private clipboard: Clipboard,
    @Inject(MAT_DIALOG_DATA) node: Node,
    ) {
    this.node = node;
    this.nodeDeepLink = window.location.origin + location.prepareExternalUrl(`node/${node.node_label}`);
  }

  ngOnInit(): void {
    if (this.node.node_id) this.dataService.listDeployments(this.node.node_id)
      .pipe(map(list => list.sort((a, b) => (a < b ? 1 : -1))))
      .subscribe(deployments => this.deployments = deployments)
  }

  edit(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/nodes/edit/', this.node.node_id]);
    });
    this.dialogRef.close();
  }

  editDeployment(deployment_id: number): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/deployments/edit/', deployment_id]);
    });
    this.dialogRef.close();
  }

  copyUrl() {
    this.clipboard.copy(this.nodeDeepLink);
  }

}
