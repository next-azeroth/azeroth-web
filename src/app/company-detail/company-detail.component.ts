import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { DataTransformationService } from '../services/dataTransformation.service';
import { MatDialogRef, MatDialog } from '@angular/material';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css']
})
export class CompanyDetailComponent implements OnInit {

  configulationList: any = []
  companyGroupList : any = []

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
      width: '800px'
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

  editRelation : any = {}
  @ViewChild("editRelationTemplate", { static: true })
  public editRelationTemplate: TemplateRef<any>;
  editRelationTemplateRef: MatDialogRef<any>;
  openEditRelationTemplate(): void {
    this.editRelationTemplateRef = this.dialog.open(this.editRelationTemplate, {
      width: '800px'
    });

    this.editRelationTemplateRef.afterClosed();
  }

  constructor(private dialog: MatDialog , private route: ActivatedRoute, private firebaseService: FirebaseService, private dataTransformationService: DataTransformationService) {
    this.route.params.subscribe(params => {
      this.companyId = params['companyId'];
      this.getCompany()
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

  editCompany(){
    console.log('edit company' , this.company)
  }

}
