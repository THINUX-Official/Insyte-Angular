import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcDashboard } from './ic-dashboard';

describe('IcDashboard', () => {
  let component: IcDashboard;
  let fixture: ComponentFixture<IcDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
