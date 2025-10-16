import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './pages/form/form.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { FormInstanceComponent } from './pages/member/form-instance/form-instance.component';
import { ResultsComponent } from './pages/member/results/results.component';
import { PolicyComponent } from './pages/policy/policy.component';
import { UserGuideComponent } from './pages/user-guide/user-guide.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'form/:formid',
    component: FormComponent
  },
  {
    path: 'policy',
    component: PolicyComponent
  },
  {
    path: 'user-guide',
    component: UserGuideComponent
  }
  ,
  {
    path: 'login',
    component: LoginComponent
  }
  ,
  {
    path: 'member/results',
    component: ResultsComponent
  }
  ,
  {
    path: 'member/form-instance',
    component: FormInstanceComponent
  }
  
  ,
  {
    path: 'member/form-instance/:id',
    component: FormInstanceComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
              onSameUrlNavigation: 'reload',
              scrollPositionRestoration: 'enabled', useHash: true 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
