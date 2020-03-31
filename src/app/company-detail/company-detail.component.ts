import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { DataTransformationService } from '../services/dataTransformation.service';
import { MatDialogRef, MatDialog } from '@angular/material';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css']
})
export class CompanyDetailComponent implements OnInit {

  configulationList: any = []
  companyGroupList : any = []

  selectRelation : any = {}

  companyId: any
  companyList: any
  company: any
  relationList : any

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
      width: '30vw'
    });

    this.completeDialogRef.afterClosed();
  }

  @ViewChild("editCompanyTemplate", { static: true })
  public editCompanyTemplate: TemplateRef<any>;
  editCompanyTemplateRef: MatDialogRef<any>;
  openEditCompanyTemplate(): void {
    this.editCompanyTemplateRef = this.dialog.open(this.editCompanyTemplate, {
      width: '800px'
    });

    this.editCompanyTemplateRef.afterClosed();
  }


  @ViewChild("editRelationTemplate", { static: true })
  public editRelationTemplate: TemplateRef<any>;
  editRelationTemplateRef: MatDialogRef<any>;
  openEditRelationTemplate(relation : any): void {
    this.selectRelation = relation
    this.editRelationTemplateRef = this.dialog.open(this.editRelationTemplate, {
      width: '800px'
    });

    this.editRelationTemplateRef.afterClosed();
  }

  @ViewChild("createRelationTemplate", { static: true })
  public createRelationTemplate: TemplateRef<any>;
  createRelationTemplateRef: MatDialogRef<any>;
  openCreateRelationTemplate(): void {
    this.createRelationTemplateRef = this.dialog.open(this.createRelationTemplate, {
      width: '800px'
    });

    this.createRelationTemplateRef.afterClosed();
  }

  constructor(private dialog: MatDialog , private route: ActivatedRoute, private router: Router , private firebaseService: FirebaseService, private dataTransformationService: DataTransformationService) {
    this.route.params.subscribe(params => {
      this.configulationList = JSON.parse(localStorage.getItem('configulation'))
      console.log('this.configulationList' , this.configulationList)
      this.companyId = params['companyId'];
      this.getCompany()
      this.getCompanyList()
      this.getCompanyGroupList()
    });
  }

  ngOnInit() {
  }

  getCompany() {
    this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompany, this.companyId).subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.company = resp.data
        console.log('company' , this.company)
      }
    })
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
      }
    });
  }

  editCompany(){
    console.log('edit company' , this.company)

    let group = ''
    if (this.company.group == 'none') {
      group = ''
    }

    this.firebaseService.postRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.editCompany, this.company).subscribe((data: {}) => {
      console.log('edit complete')
      this.getCompany()
      this.openCompleteTemplate()
    })
  }

  deleteCompany(){
    console.log('delete company' , this.company)

    this.firebaseService.postRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.deleteCompany, this.company).subscribe((data: {}) => {
      console.log('edit complete')
      this.router.navigate(['company'])
    })
  }

  editRelation(){
    console.log('edit Relation' , this.selectRelation)

    this.firebaseService.postRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.editRelation, this.selectRelation).subscribe((data: {}) => {
      console.log('edit complete')
      this.getCompany()
      this.openCompleteTemplate()
    })
  }

  deleteRelation(relation : any){
    this.selectRelation = relation
    console.log('delete Relation' , this.selectRelation)

    this.firebaseService.postRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.deleteRelation, this.selectRelation).subscribe((data: {}) => {
      console.log('edit complete')
      this.getCompany()
      this.openCompleteTemplate()
    })
  }

  createRelation(form : NgForm){
    console.log('createRelation' , form.value)
    const formData = form.value
    const keys = Object.keys(formData)

    let isFillComplete = true

    keys.forEach(key => {
      if(key != 'relationDetail' && formData[key] == ''){
        isFillComplete = false
      }
    });

    if(isFillComplete){

      let newData : any = {
        relation: {
          relationType: formData.relationType,
          relationDetail: formData.relationDetail,
          cashAmount: formData.cashAmount
        }
      }

      if(formData.relationWay == 'from'){
        newData.relation.companyFrom = this.companyId
        newData.relation.companyTo = formData.otherCompany
      }else if(formData.relationWay == 'to'){
        newData.relation.companyFrom = formData.otherCompany
        newData.relation.companyTo = this.companyId
      }

      console.log('newData', newData)
      this.firebaseService.postRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.createRelation, newData).subscribe((data: {}) => {
        console.log('create complete')
        form.resetForm()
        this.getCompany()
        this.openCompleteTemplate()
      })
    }else{
      window.alert('Please enter complete data')
    }

  }

}
