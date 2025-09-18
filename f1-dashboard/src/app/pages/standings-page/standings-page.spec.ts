import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingsPage } from './standings-page';

describe('StandingsPage', () => {
  let component: StandingsPage;
  let fixture: ComponentFixture<StandingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandingsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
