import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadFormModal } from './lead-form-modal';

describe('LeadFormModal', () => {
  let component: LeadFormModal;
  let fixture: ComponentFixture<LeadFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
