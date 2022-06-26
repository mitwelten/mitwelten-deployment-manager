import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeListComponent } from './node-list.component';

describe('ListComponent', () => {
  let component: NodeListComponent;
  let fixture: ComponentFixture<NodeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
