import { Component, OnInit } from '@angular/core';
import { ContractService } from "./contract.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ContractService]
})
export class AppComponent implements OnInit {

  constructor(
    private contract: ContractService
  ) {

  }

  ngOnInit() {

  }
}
