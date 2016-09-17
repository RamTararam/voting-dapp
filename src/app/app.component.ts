import { Component, OnInit } from '@angular/core';
import { ContractService } from "./contract.service";
import { Project } from "./models/project.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ContractService]
})
export class AppComponent implements OnInit {
  title = 'app works!';

  projects: Project[] = [];
  accounts: string[] = null;

  private _selectedAccount: string = null;
  set selectedAccount(newValue: string) {
    this._selectedAccount = newValue;
    this.contract.accountId = newValue
  }
  get selectedAccount() {
    return this._selectedAccount;
  }

  constructor(
    private contract: ContractService
  ) {

  }

  ngOnInit() {
    this.contract.getAccounts().subscribe(
      result => {
        this.accounts = result;
        this.selectedAccount = result[0];
      }
    );

    this.loadProjects();
  }

  loadProjects() {
    this.contract.getProjects().subscribe(
      result => this.projects = result
    );
  }

  addProject(name: string) {
    this.contract.addProject(name).subscribe(() => this.loadProjects());
  }

  onChangeAccount(account: string) {
    this.selectedAccount = account;
  }
}
