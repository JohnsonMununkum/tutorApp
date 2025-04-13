import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TaskPostingPage } from './task-posting.page';

const routes: Routes = [
  {
    path: '',
    component: TaskPostingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskPostingPageRoutingModule {}
