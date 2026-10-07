import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'docDocRef',
    standalone: false
})
export class DocDocRefPipe implements PipeTransform {

    transform(ref: any, field1: string, field2: string): any {
        if (!ref) return null;
        return ref.get().then(doc => {
            if (doc.data() !== undefined) {
                const data = doc.data()[field1];
                if (!data) return
                return data.get().then(ref => {
                    return field2 ? ref.data()[field2] : ref.data()
                })
            }
        });
    }

    // <strong>{{item?.countryRef|docRef:'name' | async}}</strong>
}
