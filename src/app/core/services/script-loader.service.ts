import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';

export interface ScriptModel {
    name: string;
    src: string;
    loaded: boolean;
}

/**
 * Service to load 3rd party javascript libraries that are not
 * do not have an npm package or cannot be loaded in angular-cli.json scripts area.
 *
 * Scripts loaded will also be kept track of and not reloaded
 *
 * @export
 * @class ScriptLoaderService
 */
@Injectable()
export class ScriptLoaderService {
    /**
     * Keeps track of loaded scripts
     *
     * @private
     * @type {ScriptModel[]}
     * @memberof ScriptLoaderService
     */
    private scripts: ScriptModel[] = [];

    /**
     *Creates an instance of ScriptLoaderService.
     * @param {*} document
     * @memberof ScriptLoaderService
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
    ) {}

    /**
     * Method to load a javscript file into the Head of the document
     *
     * @param {ScriptModel} script
     * @returns {Observable<ScriptModel>}
     * @memberof ScriptLoaderService
     */
    public load(script: ScriptModel): Observable<ScriptModel> {
        return new Observable<ScriptModel>((observer: Observer<ScriptModel>) => {
            const existingScript = this.scripts.find(s => s.name === script.name);

            // Complete if already loaded
            if (existingScript && existingScript.loaded) {
                observer.next(existingScript);
                observer.complete();
            } else {
                // Add the script
                this.scripts = [...this.scripts, script];

                // Load the script
                const scriptElement = this.document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.src = script.src;
                scriptElement.async = true;

                scriptElement.onload = () => {
                    script.loaded = true;
                    observer.next(script);
                    observer.complete();
                };

                scriptElement.onerror = (error: any) => {
                    observer.error('Couldn\'t load script ' + script.src);
                };

                this.document.getElementsByTagName('head')[0].appendChild(scriptElement);
            }
        });
    }
}