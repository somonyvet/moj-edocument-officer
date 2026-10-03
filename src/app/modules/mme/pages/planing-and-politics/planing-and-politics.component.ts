import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';

@Component({
  selector: 'app-planing-and-politics',
  templateUrl: './planing-and-politics.component.html',
  styleUrls: ['./planing-and-politics.component.scss']
})
export class PlaningAndPoliticsComponent implements OnInit {

  constructor(public auth: AuthStore,
    private route: ActivatedRoute,
    public store: ProjectStore) { }

  ngOnInit(): void {
  }

}
