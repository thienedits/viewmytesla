import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';  // this is needed!

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CoreModule} from './core/core.module';
import {MainComponent} from './routes/main/main.component';
import {MusicComponent} from './routes/music/music.component';
import {MaterialModule} from './shared/material.module';
import {SharedModule} from './shared/shared.module';

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        MusicComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreModule,
        MaterialModule,
        AppRoutingModule,
        SharedModule.forRoot(),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
