import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as Chartist from 'chartist';
import { NgForm } from '@angular/forms';

import { MatDialogRef, MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';

import { FirebaseService } from './../services/firebase.service'

export interface IndustryListDataType {
  name: string;
  value: Number;
  amount : Number,
  internalFlow : Number,
  inFlow : Number,
  outFlow : Number
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  companyList: any = []
  companyValue: number = 0
  companyMin: number = 0
  companyMax: number = 0

  relationList: any = []
  relationValue: number = 0
  relationMin: number = 0
  relationMax: number = 0

  relationTypeList : any = {}

  configulationList: any = []

  industryList : any = []

  @ViewChild("jobsListPaginator", { static: false }) industryListPaginator: MatPaginator;

  industryListDataSource: MatTableDataSource<IndustryListDataType>;
  industryListColumns = ['name', 'value' , 'amount', 'internalFlow' , 'inFlow' , 'outFlow']
  industryListLength : any


  ngOnInit(): void {
  }

  constructor(private firebaseService: FirebaseService) {
    this.configulationList = JSON.parse(localStorage.getItem('configulation'))
    console.log('configulationList', this.configulationList)

    this.initialRelationTypeList()
    this.getCompanyList()
    this.getRelationList()
    this.getIndustryReport()

  }

  initialRelationTypeList(){
    this.configulationList.relationType.forEach(type => {
        this.relationTypeList[type.name] = {
          min : 0,
          max : 0,
          sum : 0,
          amount : 0
        }
    });

    console.log('relationTypeList' , this.relationTypeList)
  }

  getRelationList() {
    this.relationList = []
    this.relationValue = 0
    this.relationMin = 0
    this.relationMax = 0
    this.firebaseService.getRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.getRelationList, '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.relationList = resp.data
        this.relationList.forEach(element => {

          this.relationValue += element.cashAmount

          this.relationTypeList[element.relationType].sum += element.cashAmount
          this.relationTypeList[element.relationType].amount += 1

          if (element.cashAmount >  this.relationMax){
            this.relationMax = element.cashAmount
          }

          if(this.relationMin == 0){
            this.relationMin = element.cashAmount
          }else if(element.cashAmount < this.relationMin){
            this.relationMin = element.cashAmount
          }

          if(element.cashAmount > this.relationTypeList[element.relationType].max){
            this.relationTypeList[element.relationType].max = element.cashAmount
          }

          if(this.relationTypeList[element.relationType].min == 0){
            this.relationTypeList[element.relationType].min = element.cashAmount
          }else if(element.cashAmount < this.relationTypeList[element.relationType].min){
            this.relationTypeList[element.relationType].min = element.cashAmount
          }
        });
      }
    });
  }

  getCompanyList() {
    this.companyList = []
    this.companyValue = 0
    this.companyMin = 0
    this.companyMax = 0
    this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyWithoutGroupList, '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.companyList = resp.data

        this.companyList.forEach(element => {
          this.companyValue += element.value


          if (element.value >  this.companyMax){
            this.companyMax = element.value
          }

          if(this.companyMin == 0){
            this.companyMin = element.value
          }else if(element.value < this.companyMin){
            this.companyMin = element.value
          }

        });
      }
    });
  }

  getIndustryReport() {
    this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getIndustry, '').subscribe((data: {}) => {
      let resp: any = data

      let relationByIndustry : any = []

      if (resp.status == 'Complete') {
        this.industryList = resp.data.companyIndustryList

        let relationList = resp.data.relationIndustryList

        this.industryList.forEach(industry => {
          industry.internalFlow = 0
          industry.outFlow = 0
          industry.inFlow = 0
        })

        relationList.forEach(relation => {
          const from = relation.companyFrom
          const to = relation.companyTo
          const type = relation.relationType
          const value = relation.cashAmount

          this.industryList.forEach(industry => {

            if(industry.name == from && industry.name == to){
              industry.internalFlow += value
            }else if(industry.name == from){
              industry.outFlow += value
            }else if(industry.name == to){
              industry.inFlow += value
            }
          });
        });

        console.log('get industryList' , this.industryList)

      }
    })
  }

  getToMillion(value: any) {
    return Math.floor(value / 1000000000)
  }

}
