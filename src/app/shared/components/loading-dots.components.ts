import {Component, Input, OnInit} from '@angular/core';
import {LoadingService} from 'src/app/core/services/loading-service';

/**
 * Loader with 3 dots
 *
 * @export
 * @class LoadingDotsComponent
 * @implements {OnInit}
 */
@Component({
    selector: 'loading-dots',
    template: `
        <div *ngIf="useService && loadingService.loading$ | async" layout="row" layout-align="center center">
            <div class="loading">
                <span *ngIf="!hideText" class="">Loading</span>
                <span class="three-bounce">
                    <div class="child bounce1"></div>
                    <div class="child bounce2"></div>
                    <div class="child bounce3"></div>
                </span>
            </div>
        </div>
        <div *ngIf="!useService" layout="row" layout-align="center center">
            <div class="loading">
                <span *ngIf="!hideText" class="">Loading</span>
                <span class="three-bounce">
                    <div class="child bounce1"></div>
                    <div class="child bounce2"></div>
                    <div class="child bounce3"></div>
                </span>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }
        .loading {
            position: static;
        }
    
        .three-bounce {
            margin-left: 3px;
        }
    
        .three-bounce .child {
            width: 7px;
            height: 7px;
            margin: 0 3px;
            background-color: #ff9800;
            border-radius: 100%;
            display: inline-block;
            -webkit-animation: three-bounce 1.4s ease-in-out 0s infinite both;
            animation: three-bounce 1.4s ease-in-out 0s infinite both;
        }
    
        .three-bounce .bounce1 {
            -webkit-animation-delay: -0.32s;
            animation-delay: -0.32s;
        }
    
        .three-bounce .bounce2 {
            -webkit-animation-delay: -0.16s;
            animation-delay: -0.16s;
        }
    
        @-webkit-keyframes three-bounce {
    
            0%,
            80%,
            100% {
                -webkit-transform: scale(0);
                transform: scale(0);
            }
    
            40% {
                -webkit-transform: scale(1);
                transform: scale(1);
            }
        }
    
        @keyframes three-bounce {
    
            0%,
            80%,
            100% {
                -webkit-transform: scale(0);
                transform: scale(0);
            }
    
            40% {
                -webkit-transform: scale(1);
                transform: scale(1);
            }
        }
    `]
})
export class LoadingDotsComponent implements OnInit {
    @Input() hideText = false;
    @Input() useService = false;
    /**
     *Creates an instance of LoadingDotsComponent.
     * @memberof LoadingDotsComponent
     */
    constructor(
        public loadingService: LoadingService,
    ) {}

    ngOnInit() {}
}
