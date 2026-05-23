import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTablePanel } from './data-table-panel';

describe('DataTablePanel', () => {
  let component: DataTablePanel;
  let fixture: ComponentFixture<DataTablePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTablePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTablePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
