import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../dashboard/dashboard.component';

import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatExpansionModule,
  MatGridListModule,
  MatTableModule,
  MatDialogModule,
  MatPaginatorModule,
  MatSliderModule,
  MatDividerModule
} from '@angular/material';
import { SpaceComponent } from 'src/app/space/space.component';
import { CompanyComponent } from 'src/app/company/company.component';
import { CompanyDetailComponent } from 'src/app/company-detail/company-detail.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatGridListModule,
    MatTableModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSliderModule,
    MatDividerModule
  ],
  declarations: [
    DashboardComponent,
    SpaceComponent,
    CompanyComponent,
    CompanyDetailComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})

export class AdminLayoutModule {}
