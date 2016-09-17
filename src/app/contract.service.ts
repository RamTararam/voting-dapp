import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Project } from "./models/project.model";
import { Observable, BehaviorSubject, Observer } from "rxjs";

declare var Web3: any;

@Injectable()
export class ContractService {
  private web3 = new Web3();
  private contract: any;

  public accountId = "";

  private contractLoaded = new BehaviorSubject<boolean>(false);

  constructor(
    private http: Http
  ) {
    let rpcURL = 'http://node125670695.northeurope.cloudapp.azure.com:8080';
    this.web3.setProvider(new this.web3.providers.HttpProvider(rpcURL));
    this.loadContract();
  }


  addProject(name: string): Observable<string> {
    return Observable.create(observer => {
      this.contract.addProject.sendTransaction(name, { from: this.accountId }, this.web3Callback(observer));
    });
  }

  addVoteCategory(name: string): Observable<string> {
    return Observable.create(observer => {
      this.contract.addVoteCategory.sendTransaction(name, { from: this.accountId }, this.web3Callback(observer));
    });
  }

  getProjects(): Observable<Project[]> {
    return this.contractLoaded.asObservable()
      .filter(loaded => loaded)
      .flatMap(() => this.projectsCount())
      .flatMap(count => {
        let observables: Observable<Project>[] = [];
        for (var i = 0; i < count; ++i) {
          observables.push(this.getProject(i));
        }
        return Observable.forkJoin(observables)
      });
  }

  getProject(projectId: number): Observable<Project> {
    return Observable.create(observer => {
      this.contract.projects(projectId, this.web3Callback(observer))
    }).map(name => { return { name } })
  }

  projectsCount(): Observable<number> {
    return Observable.create(observer => {
      this.contract.projectsCount(this.web3Callback(observer))
    }).map(count => count.toNumber());
  }

  getAccounts(): Observable<string[]> {
    return Observable.create(observer => {
      this.web3.eth.getAccounts(function(error, result) {
        if (error) {
          observer.error(error);
        } else {
          observer.next(result);
          observer.complete();
        }
      });
    });
  }


  private loadContract() {
    this.http.get('/contract/ballot.sol').subscribe(response => {
      this.web3.eth.compile.solidity(response.text(), (error, compiled) => {
        this.contract = this.web3.eth.contract(compiled.Ballot.info.abiDefinition)
          .at("0xd1a021821ee1fc469ad7733fedb5e083ecbb0e99");
        this.contractLoaded.next(true);

        window['contract'] = this.contract;
        window['web3'] = this.web3;
      });
    }, error => {
      console.error(error);
      this.contractLoaded.error(error);
    })
  }

  private web3Callback<T>(observer: Observer<T>) {
    return (error, result) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next(result);
        observer.complete();
      }
    }
  }
}
