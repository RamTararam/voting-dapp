import { Component, OnInit } from '@angular/core';
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
  private projects: Project[] = null;
  private voteCriteria: string[] = null;


  private queriesCount = 1;
  private queriesCompleted = 0;
  private progressMode = 'query';

  constructor(
    private contract: ContractService,
    private toaster: ToasterService,
  ) {
    this.voteCriteria = this.contract.voteCriteria;
  }

  ngOnInit() {
    this.contract.getProjects().subscribe(projects => {
      this.queriesCount = projects.length;
      this.queriesCompleted = 0;
      this.projects = projects;
      for (let project of this.projects) {
        project.vote = {projectId: project.id, points: Array(5)};
        project.votesCount = 1;
        Observable.forkJoin(
          this.contract.getVotesCount(project.id),
          this.contract.getPoints(project.id)
        ).subscribe(data => {
          project.votesCount = data[0];
          project.vote.points = data[1];
          this.updateAggregateValue(project);
          this.queriesCompleted += 1;
        }, this.handleError);
      }
      this.progressMode = 'determinate';
    }, this.handleError);
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
