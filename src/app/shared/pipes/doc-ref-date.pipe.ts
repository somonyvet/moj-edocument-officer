import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'docRefDate',
    standalone: false
})
export class DocRefDatePipe implements PipeTransform {

    transform(ref: any, field: string): any {
        if (!ref) return null;
        return ref.get().then(doc => {
            if (doc.data() == undefined) return null
            const data = doc.data()[field]
            if (data) {
                return doc.data()[field].toDate()
            } else {
                return null
            }
        });
    }

    // <strong>{{item?.countryRef|docRef:'name' | async}}</strong>
}
