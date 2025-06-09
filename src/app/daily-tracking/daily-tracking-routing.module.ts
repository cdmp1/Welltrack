import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DailyTrackingPage } from './daily-tracking.page';

const routes: Routes = [
  {
    path: '',
    component: DailyTrackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyTrackingPageRoutingModule {}
