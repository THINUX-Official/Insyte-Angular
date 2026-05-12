import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShDashboard } from './sh-dashboard';

describe('ShDashboard', () => {
  let component: ShDashboard;
  let fixture: ComponentFixture<ShDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
