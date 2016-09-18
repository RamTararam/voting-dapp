import { Component, OnInit } from '@angular/core';
import { ToasterService } from "angular2-toaster";
import { ContractService } from "../contract.service";
import { Project, Vote } from "../models";

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent implements OnInit {
  private projects: Project[] = null;
  private voteCriteria: string[] = null;

  private submittingVotes = false;
  private votesSubmitted = 0;
  private votesToSubmit = 0;

  private _selectedAccount: string = null;
  private get selectedAccount() { return this._selectedAccount; }
  private set selectedAccount(newVal: string) {
    this._selectedAccount = newVal;
    this.contract.accountId = newVal;
  }


  constructor(
    private contract: ContractService,
    private toaster: ToasterService,
  ) {
    this.voteCriteria = this.contract.voteCriteria;
    this._selectedAccount = this.contract.accountId;
  }

  ngOnInit() {
    this.contract.getProjects().subscribe(projects => {
      for (let project of projects) {
        project.vote = this.restoreVoteFromLocalStorage(project);
        project.points = project.vote.points.map(value => { return { value } });
      }
      this.projects = projects;
    }, error => {
      this.toaster.pop('error', "Error loading contract data", error.message);
    });
  }

  submitVotes(passphrase: string) {

    let completedProjects: Project[] = [];
    for (let project of this.projects) {
      let isComplete = true;
      for (let item of project.points) {
        if (item.value === null) {
          isComplete = false;
          continue;
        }

        if (item.value < 0) {
          item.value = 0;
        } else if (item.value > 5) {
          item.value = 5;
        }
      }

      if (isComplete && !project.vote.submitted) {
        project.vote.points = project.points.map(item => item.value);
        this.saveVoteToLocalStorage(project.vote);
        completedProjects.push(project);
      }
    }


    if (!passphrase.length) {
      this.toaster.pop('error', 'Enter passphrase');
      return;
    }

    if (completedProjects.length == 0) {
      this.toaster.pop('warning', 'No data to send', 'Please fill the votes');
      return;
    }

    this.submittingVotes = true;
    this.contract.unlockAccount(passphrase).subscribe(() => {
      this.votesToSubmit = completedProjects.length;
      this.votesSubmitted = 0;

      for (let project of completedProjects) {
        this.contract.sendVote(project.vote).subscribe(() => {
          project.vote.submitted = true;
          this.toaster.pop('success', '', `Your vote for "${project.name}" submitted to the blockchain`);
          this.saveVoteToLocalStorage(project.vote);
          this.voteFinished();
        }, error => {
          project.vote.submitted = false;
          this.toaster.pop('error', `Your vote for "${project.name}" failed`, error.message);
          this.voteFinished();
        });
      }
    }, error => {
      this.submittingVotes = false;
      this.toaster.pop('error', 'Error', error.message);
    });
  }

  private voteFinished() {
    this.votesSubmitted += 1;
    if (this.votesSubmitted == this.votesSubmitted) {
      this.submittingVotes = false;
    }
  }

  private voteKey(projectId: number) {
    return `vote_${this.selectedAccount}_${projectId}`;
  }

  restoreVoteFromLocalStorage(project: Project) {
    let item = localStorage.getItem(this.voteKey(project.id));
    if (!item) return { submitted: false, projectId: project.id, points: this.voteCriteria.map(v => null) };
    return JSON.parse(item);
  }

  saveVoteToLocalStorage(vote: Vote) {
    localStorage.setItem(this.voteKey(vote.projectId), JSON.stringify(vote));
  }
}
