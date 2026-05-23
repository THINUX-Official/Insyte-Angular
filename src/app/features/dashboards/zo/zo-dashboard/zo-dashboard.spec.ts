import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoDashboard } from './zo-dashboard';

describe('ZoDashboard', () => {
  let component: ZoDashboard;
  let fixture: ComponentFixture<ZoDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
