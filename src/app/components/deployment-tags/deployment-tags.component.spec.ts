import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentTagsComponent } from './deployment-tags.component';

describe('DeploymentTagsComponent', () => {
  let component: DeploymentTagsComponent;
  let fixture: ComponentFixture<DeploymentTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeploymentTagsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeploymentTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
