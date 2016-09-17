import { Component, OnInit } from '@angular/core';
import { ContractService } from "../contract.service";
import {ToasterService} from "angular2-toaster";
import {Observable} from "rxjs";

declare var FB:any;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  userId: string = null;
  loading: boolean = false;
  completed: boolean = false;
  accountId: string = null;

  constructor(
    private contract: ContractService,
    private toaster: ToasterService
  ) {
    this.accountId = this.contract.accountId;
  }

  ngOnInit() {
    FB.init({
      appId      : '605049279667514',
      xfbml      : true,
      version    : 'v2.7'
    });
    window['loginCallback'] = (res) => {
      this.loginCallback(res);
    }
  }

  loginCallback(res: any) {
    if (res.status !== 'connected') {
      return;
    }

    this.userId = res.authResponse.userID;
  }

  createAccount(password: string, confirmedPassword: string) {
    if (password != confirmedPassword) {
      this.toaster.pop('error', 'Error', 'Passwords does not match!');
      return;
    }

    this.loading = true;
    this.contract.createAccount(password).subscribe(result => {
      this.accountId = result;
      this.contract.accountId = result;
      this.checkBalanceAndSaveFbId(password).subscribe(() => {
        this.completed = true;
      }, error => this.handleError);
    }, error => this.handleError);
  }

  checkBalanceAndSaveFbId(password: string): Observable<any> {
    return this.contract.getBalance().delay(500).flatMap(val => {
      if (val == 0) {
        return this.checkBalanceAndSaveFbId(password);
      }
      return this.contract.saveFacebookId(this.userId, password);
    });
  }

  handleError(error: any) {
    this.loading = false;
    this.toaster.pop('error', 'Error', error.message);
  }
}
