import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskPostingPage } from './task-posting.page';

describe('TaskPostingPage', () => {
  let component: TaskPostingPage;
  let fixture: ComponentFixture<TaskPostingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskPostingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
