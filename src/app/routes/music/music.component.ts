import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
declare var jDataView: any;
declare var jsmediatags: any;

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'music',
    templateUrl: './music.component.html'
})

export class MusicComponent implements OnInit, AfterViewInit {
    @ViewChild('filesInput', {static: false}) filesInput: ElementRef;
    @ViewChild('audioSrc', {static: false}) audioSrcComp: ElementRef;
    audioSrcEl: HTMLVideoElement = null;

    filesArr = [];
    selectedClip = null;
    selectedFileIndex = null;
    isPlaying = false;

    constructor() {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.audioSrcEl = this.audioSrcComp.nativeElement;

        this.audioSrcEl.addEventListener('ended', (event) => {
            const nextIndex =
                this.filesArr.length <= this.selectedFileIndex + 1 ? 0 : this.selectedFileIndex + 1;
            const file = this.filesArr[nextIndex];
            this.loadClip(file, nextIndex);
        });
    }

    playPause() {
        if (this.audioSrcEl.paused) {
            this.audioSrcEl.play();
            this.isPlaying = true;
        } else {
            this.audioSrcEl.pause();
            this.isPlaying = false;
        }
    }

    play() {
        this.audioSrcEl.play();
        this.isPlaying = true;
    }

    pause() {
        this.audioSrcEl.pause();
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
        this.filesInput.nativeElement.click();
    }

    filesSelected() {
        this.filesArr = [];
        this.selectedFileIndex = null;
        const files = this.filesInput.nativeElement.files;
        // const reader = new FileReader();

        // reader.addEventListener('load', (e) => {
        //     const dv = new jDataView(reader.result);

        //     // "TAG" starts at byte -128 from EOF.
        //     // See http://en.wikipedia.org/wiki/ID3
        //     if (dv.getString(3, dv.byteLength - 128) === 'TAG') {
        //         const title = dv.getString(30, dv.tell());
        //         const artist = dv.getString(30, dv.tell());
        //         const album = dv.getString(30, dv.tell());
        //         const year = dv.getString(4, dv.tell());
        //         console.log(album);
        //     } else {
        //         // no ID3v1 data found.
        //         console.log('none');
        //     }
        // });

        let i;
        const numberOfFiles = files.length;
        for (i = 0; i < numberOfFiles; i++) {
            const isFlac = files[i].name.indexOf('.flac') > 0;
            const isMp3 = files[i].name.indexOf('.mp3') > 0;

            if (isFlac || isMp3) {
                this.filesArr.push({
                    // date: moment(timestamp, 'YYYY-MM-DD_HH-mm-ss'),
                    fileSrc: URL.createObjectURL(files[i]),
                    fileName: files[i].name,
                    path: files[i].webkitRelativePath,
                });

                jsmediatags.read(files[i], {
                    onSuccess: function(tag) {
                      // console.log(tag);
                    },
                    onError: function(error) {
                      console.log(error);
                    }
                  });
            }
        }

        // console.log(files);
        // console.log(this.filesArr);

        // this.filesArr = this.groupBy(filesArr, f => f.date.format('LLL'), true);

        if (this.filesArr.length > 0) {
            this.selectedFileIndex = 0;
            const firstClip = this.filesArr[0];

            this.loadClip(firstClip, 0);
        }
    }

    loadClip(file, index) {
        this.audioSrcEl.src = file.fileSrc;
        this.play();
        this.selectedClip = file;
        this.selectedFileIndex = index;
    }

    get filesInputDisplay() {
        return this.filesArr.length > 0 ? this.filesArr.length + ' Files Loaded' :
                                          'Choose Folder ...';
    }
}
