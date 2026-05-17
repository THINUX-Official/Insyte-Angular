import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AlertsContainer} from './alerts-container';

describe('AlertsContainer', () => {
  let component: AlertsContainer;
  let fixture: ComponentFixture<AlertsContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsContainer]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AlertsContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
