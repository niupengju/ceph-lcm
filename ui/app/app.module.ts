import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app';
import { LoginComponent, DashboardComponent, PasswordResetComponent }  from './dashboard/index';
import { PageNotFoundComponent } from './404';

import { AdminModule } from './admin/admin.module';
import { ClustersModule } from './clusters/clusters.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { PlaybooksModule } from './playbooks/playbooks.module';
import { ServersModule } from './servers/servers.module';
import { ExecutionsModule } from './executions/executions.module';

import { AuthService, LoggedIn} from './services/auth';
import { SessionService } from './services/session';
import { CookieService } from 'angular2-cookie/core';
import { DataService } from './services/data';
import { ErrorService } from './services/error';

import { appRoutingProviders, routing } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PasswordResetComponent,
    DashboardComponent,
    PageNotFoundComponent,
  ],
  imports: [
    routing,
    AdminModule,
    ClustersModule,
    ConfigurationsModule,
    PlaybooksModule,
    ServersModule,
    ExecutionsModule,
    FormsModule,
    BrowserModule,
  ],
  providers: [
    LoggedIn,
    AuthService,
    DataService,
    CookieService,
    SessionService,
    ErrorService,
    appRoutingProviders,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
