import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { HeroComponent } from './common/hero/hero.component';
import { SortPipe } from './pipe/sort.pipe';
import { FilterPipe } from './pipe/filter.pipe';
import { HttpClientModule } from '@angular/common/http';
import { FormComponent } from './pages/form/form.component';
import { HomeComponent } from './pages/home/home.component';
import { RenderComponent } from './common/render/render.component';
import { ResultComponent } from './pages/result/result.component';
import { FormsModule } from '@angular/forms';
import { RenderValueComponent } from './common/render-value/render-value.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PolicyComponent } from './pages/policy/policy.component';
import { UserGuideComponent } from './pages/user-guide/user-guide.component';
import { LoginComponent } from './pages/login/login.component';
import { ResultsComponent } from './pages/member/results/results.component';
import { ResultListComponent } from './pages/member/results/result-list/result-list.component';
import { FormInstanceComponent } from './pages/member/form-instance/form-instance.component';
import { FormDetailComponent } from './pages/form/form-detail/form-detail.component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    SortPipe,
    FilterPipe,
    FormComponent,
    HomeComponent,
    RenderComponent,
    ResultComponent,
    RenderValueComponent,
    PolicyComponent,
    UserGuideComponent,
    LoginComponent,
    ResultsComponent,
    ResultListComponent,
    FormInstanceComponent,
    FormDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, FormsModule, NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
