import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./review/review.module').then(m => m.TabsPageModule)
  },
  {
    path: 'task-posting',
    loadChildren: () => import('./task-posting/task-posting.module').then( m => m.TaskPostingPageModule)
  },
  {
    path: 'verify',
    loadChildren: () => import('./verify/verify.module').then( m => m.VerifyPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
