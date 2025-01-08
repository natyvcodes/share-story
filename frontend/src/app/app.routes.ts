import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PrincipalComponent } from './principal/principal.component';
import { AccountPageComponent } from './account-page/account-page.component';
import { PersonalInfoPageComponent } from './personal-info-page/personal-info-page.component';
import { MystoriesComponent } from './mystories/mystories.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'Principal/:id', component: PrincipalComponent },
    {
        path: 'YourAccount', component: AccountPageComponent,
        children: [{
            path: '',
            component: PersonalInfoPageComponent,
        },
        {
            path: 'MyStories',
            component: MystoriesComponent,
        }

        ]
    }

];
