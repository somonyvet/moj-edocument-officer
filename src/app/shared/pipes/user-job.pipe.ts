import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userJob'
})
export class UserJobPipe implements PipeTransform {

  transform(job: any, userPermission: any[], fileAndFolder?: any, uid?: any): any {
    if (fileAndFolder && fileAndFolder.created_by && fileAndFolder.created_by.key === uid) {
      return true;
    }
    if (job && userPermission.length > 0) {
      const find = userPermission.filter(m => m.task && m.task.key === job.key)
      return find.length > 0;
    }
    return false;
  }

}


@Pipe({
  name: 'notMol'
})
export class  NotMol implements PipeTransform {
  transform(obj: any): any {
    if(obj && obj?.dataEntryOnly){
      return false;
    }else{
      return true;
    }
  }
}

