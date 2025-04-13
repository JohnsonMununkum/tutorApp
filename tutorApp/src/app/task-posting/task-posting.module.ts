import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaskPostingPageRoutingModule } from './task-posting-routing.module';

import { TaskPostingPage } from './task-posting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaskPostingPageRoutingModule
  ],
  declarations: [TaskPostingPage]
})
export class TaskPostingPageModule {}
