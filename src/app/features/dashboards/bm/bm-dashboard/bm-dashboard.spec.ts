import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmDashboard } from './bm-dashboard';

describe('BmDashboard', () => {
  let component: BmDashboard;
  let fixture: ComponentFixture<BmDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BmDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
