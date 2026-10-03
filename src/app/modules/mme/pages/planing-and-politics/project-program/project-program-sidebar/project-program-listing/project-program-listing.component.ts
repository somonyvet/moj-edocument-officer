import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicFlatNode, ProjectDataSource, ProjectStore } from 'src/app/stores/project/project.store';
@Component({
  selector: 'app-project-program-listing',
  templateUrl: './project-program-listing.component.html',
  styleUrls: ['./project-program-listing.component.scss']
})
export class ProjectProgramListingComponent implements OnInit {
  treeControl: FlatTreeControl<DynamicFlatNode>;
  dataSource: ProjectDataSource;
  getLevel = (node: DynamicFlatNode) => node.level;
  isExpandable = (node: DynamicFlatNode) => node.expandable;
  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;
  loading: boolean = true;
  queryParams: any = {};

  constructor(private route: ActivatedRoute,
    public store: ProjectStore) { }

  async ngOnInit(): Promise<void> {
    const { selectedPlaning } = this.store;
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
    })
    this.route.parent.params.subscribe(async params=>{
      this.loading = true;
      const { projectKey } = params
      if(projectKey){
        await this.store.fetchRootLevelNodesActivities(projectKey);
        this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new ProjectDataSource(this.treeControl, this.store);
        this.store.fetchProjectProgramsNodesListing(projectKey, res => {
          this.dataSource.data = this.store.initialData();
          this.loading = false;
        })
      }else{
        await this.store.fetchRootLevelNodesActivities(selectedPlaning?.key);
        this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new ProjectDataSource(this.treeControl, this.store);
        this.store.fetchProjectProgramsNodesListing(selectedPlaning?.key, res => {
          this.dataSource.data = this.store.initialData();
          this.loading = false;
        })
      }

    })

  }

}
