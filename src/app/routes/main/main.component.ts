import {MediaMatcher} from '@angular/cdk/layout';
import {Platform} from '@angular/cdk/platform';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    Renderer2,
    ViewChild
} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {MatSliderChange} from '@angular/material/slider';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import * as screenfull from 'screenfull';
import {Screenfull} from 'screenfull';
import {LoadingService} from 'src/app/core/services/loading-service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'main',
    templateUrl: './main.component.html',
})
export class MainComponent implements AfterViewInit, OnDestroy {
    title = 'viewmytesla';
    @ViewChild('leftVideo', {static: false}) leftVideoComp: ElementRef;
    @ViewChild('frontVideo', {static: false}) frontVideoComp: ElementRef;
    @ViewChild('rightVideo', {static: false}) rightVideoComp: ElementRef;
    @ViewChild('filesInput', {static: false}) filesInput: ElementRef;
    @ViewChild('donationsElRef', {static: false}) donationsElRef: ElementRef;
    onDestroy$ = new Subject<void>();

    filesArr = [];
    recentClipsArr = [];
    selectedClip = null;
    selectedFileIndex = null;
    leftVideoEl: HTMLVideoElement = null;
    frontVideoEl: HTMLVideoElement = null;
    rightVideoEl: HTMLVideoElement = null;
    isPlaying = false;
    googlePayLoaded = false;
    mobileQuery: MediaQueryList;
    playbackRate = 1;
    slowMoRates = [.25, .5];
    recentClipsCount = 0;
    isLoading = true;
    private _mobileQueryListener: () => void;
    fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
    isMicrosoft = this.platform.EDGE || this.platform.TRIDENT;

    donationPrices: any[] = [
        {value: '5.00', viewValue: '$5'},
        {value: '10.00', viewValue: '$10'},
        {value: '20.00', viewValue: '$20'},
        {value: '25.00', viewValue: '$25'},
    ];

    donationTotal = '5.00';
    googlePayButton = null;

    frontVideoHandler = (event) => {
        this.leftVideoEl.currentTime = this.frontVideoEl.currentTime;
        this.rightVideoEl.currentTime = this.frontVideoEl.currentTime;
        // tslint:disable-next-line:semicolon
    };
    leftVideoHandler = (event) => {
        this.frontVideoEl.currentTime = this.leftVideoEl.currentTime;
        this.rightVideoEl.currentTime = this.leftVideoEl.currentTime;
        // tslint:disable-next-line:semicolon
    };
    rightVideoHandler = (event) => {
        this.leftVideoEl.currentTime = this.rightVideoEl.currentTime;
        this.frontVideoEl.currentTime = this.rightVideoEl.currentTime;
        // tslint:disable-next-line:semicolon
    };

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        // private scriptLoaderService: ScriptLoaderService,
        // private googlePayService: GooglePayService,
        private renderer: Renderer2,
        private platform: Platform,
    ) {
        this.mobileQuery = media.matchMedia('(max-width: 767px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);

        const scriptModel = {
            name: 'Google Pay',
            src: 'https://pay.google.com/gp/p/js/pay.js',
            loaded: false
        };

        // this.scriptLoaderService.load(scriptModel)
        //     .pipe(
        //         takeUntil(this.onDestroy$),
        //         )
        //     .subscribe(script => {
        //         this.googlePayLoaded = true;
        //         this.googlePayService.totalPrice = this.donationTotal;
        //         this.googlePayButton = this.googlePayService.createGooglePayButton();

        //         this.renderer.appendChild(this.donationsElRef.nativeElement,
        //         this.googlePayButton);
        //     });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
    }


    ngAfterViewInit() {
        this.leftVideoEl = this.leftVideoComp.nativeElement;
        this.frontVideoEl = this.frontVideoComp.nativeElement;
        this.rightVideoEl = this.rightVideoComp.nativeElement;

        this.leftVideoEl.playbackRate = this.playbackRate;
        this.frontVideoEl.playbackRate = this.playbackRate;
        this.rightVideoEl.playbackRate = this.playbackRate;

        this.frontVideoEl.addEventListener('seeked', this.frontVideoHandler);

        // this.leftVideoEl.addEventListener('seeked', (event) => {
        //     this.frontVideoEl.currentTime = this.leftVideoEl.currentTime;
        //     this.rightVideoEl.currentTime = this.leftVideoEl.currentTime;
        // });
        // this.rightVideoEl.addEventListener('seeked', (event) => {
        //     this.leftVideoEl.currentTime = this.rightVideoEl.currentTime;
        //     this.frontVideoEl.currentTime = this.rightVideoEl.currentTime;
        // });
        this.frontVideoEl.addEventListener('play', (event) => {
            this.play();
        });
        this.frontVideoEl.addEventListener('pause', (event) => {
            this.pause();
        });
        this.leftVideoEl.addEventListener('play', (event) => {
            this.play();
        });
        this.leftVideoEl.addEventListener('pause', (event) => {
            this.pause();
        });
        this.rightVideoEl.addEventListener('play', (event) => {
            this.play();
        });
        this.rightVideoEl.addEventListener('pause', (event) => {
            this.pause();
        });
        this.frontVideoEl.addEventListener('ended', (event) => {
            const nextIndex =
                this.filesArr.length <= this.selectedFileIndex + 1 ? 0 : this.selectedFileIndex + 1;
            const file = this.filesArr[nextIndex];
            this.loadClip(file, nextIndex);
        });

        const sf = <Screenfull>screenfull;
        sf.on('change', () => {
            console.log('Am I fullscreen?', sf.isFullscreen ? 'Yes' : 'No');
            if (!sf.isFullscreen) {
                this.frontVideoEl.addEventListener('seeked', this.frontVideoHandler);
                this.leftVideoEl.removeEventListener('seeked', this.leftVideoHandler);
                this.rightVideoEl.removeEventListener('seeked', this.rightVideoHandler);
            }
        });

        // this.filesInput.nativeElement.addEventListener('click', (event) => {
        //     this.loadingService.loading(true);

        // });
    }

    donationChanged($event: MatSelectChange) {
        this.donationTotal = $event.value;
        // this.googlePayService.totalPrice = $event.value;

        // this.renderer.removeChild(this.donationsElRef.nativeElement, this.googlePayButton);
        // this.googlePayButton = this.googlePayService.createGooglePayButton();
        // this.renderer.appendChild(this.donationsElRef.nativeElement, this.googlePayButton);
    }

    playbackRateChanged($event: MatSliderChange) {
        const isSlowMo = $event.value < this.slowMoRates.length;
        const rate =
            isSlowMo ? this.slowMoRates[$event.value] : $event.value - this.slowMoRates.length + 1;
        this.leftVideoEl.playbackRate = rate;
        this.frontVideoEl.playbackRate = rate;
        this.rightVideoEl.playbackRate = rate;
        this.playbackRate = rate;
    }

    formatLabel =
        (value: number|null) => {
            const isSlowMo = value < this.slowMoRates.length;
            const rate = isSlowMo ? this.slowMoRates[value] : value - this.slowMoRates.length + 1;
            return rate + 'x';
        }

    playPause() {
        if (this.frontVideoEl.paused) {
            this.leftVideoEl.play();
            this.frontVideoEl.play();
            this.rightVideoEl.play();
            this.isPlaying = true;
        } else {
            this.leftVideoEl.pause();
            this.frontVideoEl.pause();
            this.rightVideoEl.pause();
            this.isPlaying = false;
        }
    }

    play() {
        this.leftVideoEl.play();
        this.frontVideoEl.play();
        this.rightVideoEl.play();
        this.isPlaying = true;
    }

    pause() {
        this.leftVideoEl.pause();
        this.frontVideoEl.pause();
        this.rightVideoEl.pause();
        this.isPlaying = false;
    }

    playNext() {
        const nextIndex =
            this.filesArr.length <= this.selectedFileIndex + 1 ? 0 : this.selectedFileIndex + 1;
        const file = this.filesArr[nextIndex];
        this.loadClip(file, nextIndex);
    }

    playPrev() {
        const prevIndex =
            this.selectedFileIndex - 1 < 0 ? this.filesArr.length - 1 : this.selectedFileIndex - 1;
        const file = this.filesArr[prevIndex];
        this.loadClip(file, prevIndex);
    }

    chooseFiles() {
        this.isLoading = true;
        this.filesInput.nativeElement.click();
    }

    loadClip(file, index) {
        this.frontVideoEl.src = file[0].fileSrc;
        this.leftVideoEl.src = file[1].fileSrc;
        this.rightVideoEl.src = file[2].fileSrc;
        this.leftVideoEl.playbackRate = this.playbackRate;
        this.frontVideoEl.playbackRate = this.playbackRate;
        this.rightVideoEl.playbackRate = this.playbackRate;
        this.play();
        this.selectedClip = file;
        this.selectedFileIndex = index;

        this.isLoading = false;
    }

    filesSelected() {
        // const clipRegex =
        //     /(?<y>\d+)-(?<m>\d+)-(?<d>\d+)_(?<h>\d+)-(?<mm>\d+)(?:-(?<s>\d+))?-(?<c>.*).mp4$/g;

        // function matchRegex(regex, value) {
        //     const result = regex.exec(value);

        //     regex.lastIndex = 0;

        //     return result;
        // }

        // const matchClip = (file) => matchRegex(clipRegex, file);

        // function extractDate(match) {
        //     const year = Number(match.groups['y']);
        //     const month = Number(match.groups['m']) - 1;
        //     const day = Number(match.groups['d']);
        //     const hour = Number(match.groups['h']);
        //     const minute = Number(match.groups['mm']);
        //     const second = match.groups['s'] ? Number(match.groups['s']) : 0;

        //     return moment(new Date(year, month, day, hour, minute, second));
        // }

        this.filesArr = null;
        this.recentClipsArr = [];
        this.selectedFileIndex = null;
        const files = this.filesInput.nativeElement.files;
        const filesArr = [];
        let i;

        const numberOfFiles = this.isMicrosoft && files.length > 1000 ? 1000 : files.length;

        for (i = 0; i < numberOfFiles; i++) {
            let timestamp = '';
            let camera = '';
            if (files[i].name.indexOf('left_repeater') >= 0) {
                timestamp = files[i].name.replace('-left_repeater.mp4', '');
                camera = 'left';
            } else if (files[i].name.indexOf('front') >= 0) {
                timestamp = files[i].name.replace('-front.mp4', '');
                camera = 'front';
            } else if (files[i].name.indexOf('right_repeater') >= 0) {
                timestamp = files[i].name.replace('-right_repeater.mp4', '');
                camera = 'right';
            }
            filesArr.push({
                date: moment(timestamp, 'YYYY-MM-DD_HH-mm-ss'),
                camera: camera,
                fileSrc: URL.createObjectURL(files[i]),
                fileName: files[i].name,
                path: files[i].webkitRelativePath,
            });

            filesArr.sort((f1, f2) => {
                return f1.date.toDate() - f2.date.toDate();
            });
        }

        this.filesArr = this.groupBy(filesArr, f => f.date.format('LLL'), true);

        if (this.filesArr.length > 0) {
            this.selectedFileIndex = 0;
            const recentIdxArr = [];
            this.recentClipsCount = 0;
            for (let j = this.filesArr.length - 1; j >= 0; --j) {
                const clip = this.filesArr[j];
                if (clip[0].path.indexOf('RecentClips') > -1) {
                    this.recentClipsCount++;
                    this.recentClipsArr.push(clip);
                    this.filesArr.splice(j, 1);
                }
            }

            const firstClip = this.filesArr[0];

            this.recentClipsArr.sort((f1, f2) => {
                return f1[0].date.toDate() - f2[0].date.toDate();
            });

            this.loadClip(firstClip, 0);
        }
    }

    groupBy(list, keyGetter, returnArr = false): any {
        const map = new Map();

        list.forEach((item, i) => {
            const key = keyGetter(item);
            const collection = map.get(key);

            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });

        const arr = Array.from(map.values());

        return returnArr ? arr : map;
    }

    toggleFullscreen(camera: string) {
        const sf = <Screenfull>screenfull;
        if (sf.enabled) {
            if (camera === 'left') {
                sf.toggle(this.leftVideoEl);
            }

            if (camera === 'right') {
                sf.toggle(this.rightVideoEl);
            }

            if (camera === 'front') {
                sf.toggle(this.frontVideoEl);
            }

            if (sf.isFullscreen && camera === 'left') {
                this.leftVideoEl.addEventListener('seeked', this.leftVideoHandler);
                this.frontVideoEl.removeEventListener('seeked', this.frontVideoHandler);
                this.rightVideoEl.removeEventListener('seeked', this.rightVideoHandler);
            }

            if (sf.isFullscreen && camera === 'right') {
                this.rightVideoEl.addEventListener('seeked', this.rightVideoHandler);
                this.frontVideoEl.removeEventListener('seeked', this.frontVideoHandler);
                this.leftVideoEl.removeEventListener('seeked', this.leftVideoHandler);
            }
        }
    }

    get filesInputDisplay() {
        const filesLength = this.filesArr.length + this.recentClipsArr.length;
        return filesLength > 0 ? filesLength + ' Events Found' : 'Choose Folder ...';
    }

    get selectedClipDisplay() {
        if (!this.selectedClip) {
            return '';
        }
        const isRecentClip = this.selectedClip[0].path.indexOf('RecentClips') > -1;
        const number = this.selectedFileIndex + 1;
        const recentStr = isRecentClip ? ' (Recent)' : ' (Saved)';
        const str = number + '. ' + this.selectedClip[0].date.format('LLL') + recentStr;

        return str;
    }
}
