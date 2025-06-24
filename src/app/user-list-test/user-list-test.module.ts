import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { UserListTestComponent } from './user-list-test.component';


const routes: Routes = [
    {
        path: '',
        component: UserListTestComponent
    }
];

@NgModule({
    declarations: [UserListTestComponent],
    imports: [CommonModule, IonicModule, RouterModule.forChild(routes)]
})
export class UserListTestModule { }
