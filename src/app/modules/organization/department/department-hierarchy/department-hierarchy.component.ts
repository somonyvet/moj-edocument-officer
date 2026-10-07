import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { tabs } from 'src/app/dummy/tabs';
import { HierarchyStructureManipulatorService } from 'src/app/shared/services/hierarchy-structure-manipulator.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { DepartmentStore } from 'src/app/stores/document/department.store';

@Component({
    selector: 'app-department-hierarchy',
    templateUrl: './department-hierarchy.component.html',
    styleUrls: ['./department-hierarchy.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DepartmentHierarchyComponent implements OnInit {

  tabs = tabs.department;
  nodes: Array<any> = [];

  constructor(
    private ps: PrintService,
    public store: DepartmentStore,
    private hierarchyStructureManipulatorService: HierarchyStructureManipulatorService
  ) { }

  async ngOnInit(): Promise<void> {
    const data = await this.store.fetchAll();
    if (data.length > 1) {
      this.nodes = this.hierarchyStructureManipulatorService.getNode(data);
    } else {
      this.nodes = []
    }
  }

  print() {
    this.ps.print('#print', 'a4l')
  }

}
