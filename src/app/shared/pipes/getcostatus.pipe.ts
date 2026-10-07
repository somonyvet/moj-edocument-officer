
import { Pipe, PipeTransform, ChangeDetectorRef, NgZone } from '@angular/core';
import { SetStatusStore } from '../../stores/set-status.store';

@Pipe({
    name: 'coStatus',
    standalone: false
})
export class coStatusPipe {
    constructor(
        private store: SetStatusStore
    ) {
    }
    transform(array: any): any {
        if (!array) return null
        const mm = array.map(f => f.registerCoRef)
        mm.forEach(async m => {
            if (!m) return null;
            const d = await m.get()
            let isReturnApp: boolean = d.data().returnApp !== false
            // if (isReturnApp) {
            this.store.getStatus(isReturnApp)
            // }
        })
    }
}
