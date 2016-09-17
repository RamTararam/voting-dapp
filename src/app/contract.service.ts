import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Observable, BehaviorSubject, Observer } from "rxjs";
import { Project, Vote } from "./models";


declare var Web3: any;

@Injectable()
export class ContractService {
  public voteCriteria = ["Инновационность идеи", "Технологичность решения", "Коммерческий потенциал",
    "Команда проекта", "Качество выступления"];

  private web3 = new Web3();
  private contract: any;

  private _accountId = "";
  public set accountId(newValue) {
    this._accountId = newValue;
    localStorage.setItem('account', newValue);
  }
  public get accountId() { return this._accountId; }


  private contractLoaded = new BehaviorSubject<boolean>(false);

  constructor(
    private http: Http
  ) {
    let rpcURL = 'http://node125670695.northeurope.cloudapp.azure.com:8080';
    this.web3.setProvider(new this.web3.providers.HttpProvider(rpcURL));
    this._accountId = localStorage.getItem('account');
    this.loadContract();
  }

  sendVote(vote: Vote): Observable<string> {
    return Observable.create(observer => {
      this.contract.vote.sendTransaction(vote.projectId, vote.points,
        { from: this.accountId, gas: 200000, gasPrice: 40000000000 }, this.web3Callback(observer))
    });
  }

  getPoints(projectId: number): Observable<number[]> {
    return Observable.create(observer => {
      this.contract.getPoints.call(projectId, this.web3Callback(observer));
    }).map(result => result.map(v => v.toNumber()));
  }

  getVotesCount(projectId: number): Observable<number> {
    return Observable.create(observer => {
      this.contract.getVotesCount.call(projectId, this.web3Callback(observer));
    }).map(result => result.toNumber());
  }

  //region Projects

  addProject(name: string): Observable<string> {
    return Observable.create(observer => {
      this.contract.addProject.sendTransaction(name, { from: this.accountId }, this.web3Callback(observer));
    });
  }

  projectsCount(): Observable<number> {
    return Observable.create(observer => {
      this.contract.projectsCount(this.web3Callback(observer))
    }).map(count => count.toNumber());
  }

  getProject(projectId: number): Observable<Project> {
    return Observable.create(observer => {
      this.contract.projects(projectId, this.web3Callback(observer))
    }).map(name => { return { name: name, id: projectId } });
  }

  getProjects(): Observable<Project[]> {
    return this.onContractLoaded(this.projectsCount())
      .flatMap(count => {
        let observables: Observable<Project>[] = [];
        for (var i = 0; i < count; ++i) {
          observables.push(this.getProject(i));
        }
        return Observable.forkJoin(observables)
      }).map((items: Project[]) => items.sort((lhs, rhs) => lhs.id - rhs.id));
  }
  //endregion


  //region Accounts

  getBalance(): Observable<number> {
    return Observable.create(observer => {
      this.web3.eth.getBalance(this.accountId, this.web3Callback(observer));
    }).map(val => val.toNumber());
  }

  createAccount(password: string): Observable<string> {
    return Observable.create(observer => {
      this.web3.personal.newAccount(password, this.web3Callback(observer));
    });
  }

  saveFacebookId(fbId: string, password: string): Observable<any> {
    return this.unlockAccount(password).flatMap(() => Observable.create(observer => {
        this.contract.saveFacebookId(fbId, {from: this.accountId, gasPrice: 0}, this.web3Callback(observer));
    }));
}

  unlockAccount(password: string): Observable<string> {
    return Observable.create(observer => {
      this.web3.personal.unlockAccount(this.accountId, password, 1000, this.web3Callback(observer));
    });
  }
  //endregion

  private contractObservable(func: Function): Observable<any> {
    return this.onContractLoaded(Observable.create(func));
  }

  private onContractLoaded<T>(observable: Observable<T>): Observable<T> {
    return this.contractLoaded.asObservable()
      .filter(loaded => loaded)
      .flatMap(() => observable);
  }

  private loadContract() {
    this.http.get('/contract/ballot.sol').subscribe(response => {
      this.web3.eth.compile.solidity(response.text(), (error, compiled) => {
        this.contract = this.web3.eth.contract(compiled.Ballot.info.abiDefinition)
          .at("0x93303e4d223c2f7efa73241d082cdf81cd82a8b2");
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
