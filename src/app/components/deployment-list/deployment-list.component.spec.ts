import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentListComponent } from './deployment-list.component';

describe('ListComponent', () => {
  let component: DeploymentListComponent;
  let fixture: ComponentFixture<DeploymentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeploymentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeploymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
