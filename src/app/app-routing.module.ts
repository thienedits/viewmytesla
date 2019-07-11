import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MainComponent} from './routes/main/main.component';
import {MusicComponent} from './routes/music/music.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
    },
    {
        path: 'music',
        component: MusicComponent,
    },
    // {
    //     path: 'watch',
    //     component: WatchComponent,
    // },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
