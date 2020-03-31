import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as Chartist from 'chartist';
import { NgForm } from '@angular/forms';

import { FirebaseService } from './../services/firebase.service'
import { MatDialogRef, MatDialog } from '@angular/material';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { DataTransformationService } from '../services/dataTransformation.service';
import { Router } from '@angular/router';



export interface CompanyListDataType {
  name: string;
  gorup: string;
  country: string;
  taxId: string;
  industry: string;
  value: string;
  date: string;
}

export interface RelationListDataType {
  companyFrom: string;
  companyTo: string;
  relationType: string;
  relationDetail: string;
  cashAmount: string;
  date: string;
}


@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {

  @ViewChild("companyListPaginator", { static: false }) companyListPaginator: MatPaginator;
  @ViewChild("relationListPaginator", { static: false }) relationListPaginator: MatPaginator;

  companyList: any = []
  companyGroupList: any = []
  configulationList: any = []
  relationList: any = []

  companyListDataSource: MatTableDataSource<CompanyListDataType>;
  companyListColumns = ['name', 'group', 'industry', 'value', 'date' , 'action']
  companyListLength : any

  relationListDataSource: MatTableDataSource<RelationListDataType>;
  relationListColumns = ['companyFrom', 'companyTo', 'relationType', 'relationDetail', 'cashAmount', 'date']
  relationListLength : any

  ngOnInit(): void {

  }

  ngAfterViewInit() {

  }

  @ViewChild("createCompanyGroupTemplate", { static: true })
  private createCompanyGroupTemplate: TemplateRef<any>;
  createCompanyGroupTemplateRef: MatDialogRef<any>;

  openCreateCompanyGroupTemplate(): void {
    this.createCompanyGroupTemplateRef = this.dialog.open(this.createCompanyGroupTemplate, {
      width: '800px'
    });

    this.processDialogRef.afterClosed();
  }

  @ViewChild("createCompanyTemplate", { static: true })
  private createCompanyTemplate: TemplateRef<any>;
  createCompanyTemplateRef: MatDialogRef<any>;

  openCreateCompanyTemplate(): void {
    this.createCompanyTemplateRef = this.dialog.open(this.createCompanyTemplate, {
      width: '800px'
    });

    this.createCompanyTemplateRef.afterClosed();
  }

  @ViewChild("createRelationTemplate", { static: true })
  private createRelationTemplate: TemplateRef<any>;
  createRelationTemplateRef: MatDialogRef<any>;

  openCreateRelationTemplate(): void {
    this.createRelationTemplateRef = this.dialog.open(this.createRelationTemplate, {
      width: '800px'
    });

    this.createRelationTemplateRef.afterClosed();
  }

  @ViewChild("processTemplate", { static: true })
  private processTemplate: TemplateRef<any>;
  processDialogRef: MatDialogRef<any>;

  openProcessTemplate(): void {
    this.processDialogRef = this.dialog.open(this.processTemplate, {
      width: '800px'
    });

    this.processDialogRef.afterClosed();
  }

  errorMessage = ""
  @ViewChild("errorTemplate", { static: true })
  private errorTemplate: TemplateRef<any>;
  errorDialogRef: MatDialogRef<any>;

  openErrorTemplate(): void {
    this.errorDialogRef = this.dialog.open(this.errorTemplate, {
      width: '800px'
    });

    this.errorDialogRef.afterClosed();
  }

  @ViewChild("completeTemplate", { static: true })
  public completeTemplate: TemplateRef<any>;
  completeDialogRef: MatDialogRef<any>;

  openCompleteTemplate(): void {
    this.completeDialogRef = this.dialog.open(this.completeTemplate, {
      width: '800px'
    });

    this.completeDialogRef.afterClosed();
  }


  constructor(private firebaseService: FirebaseService, private dialog: MatDialog, public dataTransformationService: DataTransformationService , public route : Router) {
    this.configulationList = JSON.parse(localStorage.getItem('configulation'))
    this.getCompanyList()
    this.getCompanyGroupList()
  }

  getCompanyGroupList() {
    this.companyGroupList = []
    this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyGroupList , '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.companyGroupList = resp.data
        this.companyGroupList.push({ name: 'none'})
      }
    });
  }

  getCompanyList() {
    this.companyList = []
    this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyWithoutGroupList , '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.companyList = resp.data
        this.companyListDataSource = new MatTableDataSource<CompanyListDataType>(this.companyList);
        this.companyListDataSource.paginator = this.companyListPaginator;
        this.getRelationList()
      }
    });
  }

  getRelationList() {
    this.relationList = []
    this.firebaseService.getRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.getRelationList , '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.relationList = resp.data
        this.relationList.forEach(element => {
          let company_data = this.getCompanyRelationByKey(element.companyFrom, element.companyTo)
          element.companyFrom_data = company_data.from
          element.companyTo_data = company_data.to
        });
        this.relationListDataSource = new MatTableDataSource<RelationListDataType>(this.relationList);
        this.relationListDataSource.paginator = this.relationListPaginator;
      }
    });
  }

  createRelation(form: NgForm) {
    console.log('createRelation')
    console.log('data', form.value)

    const formData = form.value

    const newData = {
      relation: {
        companyFrom: formData.companyFrom,
        companyTo: formData.companyTo,
        relationType: formData.relationType,
        relationDetail: formData.relationDetail,
        cashAmount: formData.cashAmount
      }
    }

    console.log('newData', newData)

    this.firebaseService.postRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.createRelation, newData).subscribe((data: {}) => {
      console.log('create complete')
      form.resetForm()
      this.getCompanyList()
    })
  }

  createCompany(form: NgForm) {
    console.log('createCompany')
    console.log('data', form.value)

    const formData = form.value
    let group = ''
    if (formData.group == 'none') {
      group = ''
    }

    const newData = {
      company: {
        name: formData.name,
        group: group,
        industry: formData.industry,
        country: formData.country,
        taxId: formData.taxId,
        value: formData.value,
        member : formData.member
      }
    }

    console.log('newData', newData)

    this.firebaseService.postRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.createCompany, newData).subscribe((data: {}) => {
      console.log('create complete')
      this.getCompanyList()
      form.resetForm()
      this.openCompleteTemplate()
    })
  }

  getCompanyRelationByKey(from: any, to: any) {
    let company = this.dataTransformationService.getCompanyRelationByKey(this.companyList, from, to)
    // console.log('company', company)
    return company
  }

  applyCompanyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.companyListDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyRelationFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.relationListDataSource.filter = filterValue.trim().toLowerCase();
    console.log('this.relationListDataSource' , this.relationListDataSource)
  }

}

