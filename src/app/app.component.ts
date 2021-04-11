import {
    AfterViewInit,
    Component,
    OnDestroy,
} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
    constructor() {}

    ngOnDestroy() {}

    ngAfterViewInit() {}
}
