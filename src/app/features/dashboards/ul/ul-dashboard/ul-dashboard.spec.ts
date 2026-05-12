import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlDashboard } from './ul-dashboard';

describe('UlDashboard', () => {
  let component: UlDashboard;
  let fixture: ComponentFixture<UlDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UlDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
