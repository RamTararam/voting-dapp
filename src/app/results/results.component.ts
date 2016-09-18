import {Component, OnInit, NgZone} from '@angular/core';
import { ToasterService } from "angular2-toaster";
import { ContractService } from "../contract.service";
import { Project } from "../models";
import { Observable } from "rxjs";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  private projects: Project[] = [];
  private voteCriteria: string[] = null;


  private queriesCount = 1;
  private queriesCompleted = 0;
  private progressMode = 'query';

  constructor(
    private contract: ContractService,
    private toaster: ToasterService,
    private zone: NgZone
  ) {
    this.voteCriteria = this.contract.voteCriteria;
    console.log(this.voteCriteria);
  }

  ngOnInit() {
    console.log('onInit');
    this.contract.getProjects().subscribe(projects => {
      console.log(projects);
      this.projects = projects;
      for (let project of this.projects) {
        project.vote = {projectId: project.id, points: Array(5)};
        project.votesCount = 1;
      }

      this.updateData();
    }, this.handleError);
  }

  private updateData() {
    this.queriesCount = this.projects.length;
    this.queriesCompleted = 0;
    this.progressMode = 'determinate';

    for (let project of this.projects) {
      Observable.forkJoin(
        this.contract.getVotesCount(project.id),
        this.contract.getPoints(project.id)
      ).subscribe(data => {
        project.votesCount = data[0];
        project.vote.points = data[1];
        this.updateAggregateValue(project);
        this.completeQuery();
      }, error => {
        this.handleError(error);
        this.completeQuery();
      });
    }
  }

  private format(p: number, q: number) {
    if (!q) q = 1;
    if (!p) p = 0;
    let val = Math.round(p * 100 / q);
    return `${Math.floor(val / 100)}.${val % 100}`;
  }

  private completeQuery() {
    this.queriesCompleted += 1;
    if (this.queriesCompleted == this.queriesCount) {
      setTimeout(() => this.updateData(), 30000);
    }
  }

  private updateAggregateValue(project: Project) {
    project.rating = project.vote.points.reduce((summ, val) => summ + val / project.votesCount, 0);
    this.updateOrdering();
  }

  private updateOrdering() {
    this.projects = this.projects.sort((lhs, rhs) => {
      return rhs.rating - lhs.rating;
    });
  }

  private handleError(error: any) {
    this.toaster.pop('error', `Error ${error.code}`, error.message)
  }
}
