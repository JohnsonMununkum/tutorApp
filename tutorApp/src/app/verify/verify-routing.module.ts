import { NgModule } from '@angular/core';
//routing & verfiy page
import { Routes, RouterModule } from '@angular/router';

import { VerifyPage } from './verify.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyPageRoutingModule {}
