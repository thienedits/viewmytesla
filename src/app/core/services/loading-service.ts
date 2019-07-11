import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(true);
    loading$ = this.loadingSubject.asObservable();

    constructor() {}

    loading(loading: boolean) {
        console.log(loading);
        this.loadingSubject.next(loading);
    }
}
