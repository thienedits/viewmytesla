import {NgModule, Optional, SkipSelf} from '@angular/core';

import {throwIfAlreadyLoaded} from './module-import-guard';
import {GooglePayService} from './services/google-pay.service';
import {LoadingService} from './services/loading-service';
import {ScriptLoaderService} from './services/script-loader.service';

/**
 * The Core module
 *
 * @export
 * @class CoreModule
 */
@NgModule({
    imports: [],
    providers: [
        // services
        LoadingService,
        GooglePayService,
        ScriptLoaderService,
    ],
    declarations: [],
    exports: []
})
export class CoreModule {
    /**
     * Creates an instance of CoreModule.
     * @param {CoreModule} parentModule
     * @memberof CoreModule
     */
    constructor(
        @Optional() @SkipSelf() parentModule: CoreModule,
    ) {
        throwIfAlreadyLoaded(
            parentModule,
            'CoreModule',
        );
    }
}
