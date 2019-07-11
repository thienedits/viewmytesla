
import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';

import {LoadingDotsComponent} from './components/loading-dots.components';
import {MaterialModule} from './material.module';

/**
 * A shared module that other modules
 * can import and use
 *
 * @export
 * @class SharedModule
 */
@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
    ],
    providers: [
        // services
    ],
    declarations: [
        // pipes

        // directives

        // Components
        LoadingDotsComponent,
    ],
    exports: [
        // modules
        CommonModule,
        MaterialModule,

        // pipes

        // directives

        // Components
        LoadingDotsComponent,
    ],
    entryComponents: []
})

// https://github.com/ocombe/ng2-translate/issues/209
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {ngModule: SharedModule};
    }
}
