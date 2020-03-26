import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AngularFireAuth } from "@angular/fire/auth";

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/do';
import { map, catchError, tap } from 'rxjs/operators';

import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})

export class DataTransformationService {

  configulationList: any = []
  relationType = []

  sortCriteria = []

  constructor() {

    this.configulationList = JSON.parse(localStorage.getItem('configulation'))
    this.configulationList.relationType.forEach(element => {
      this.relationType.push(element.name)
    });
  }

  getCompanyRelationByKey(companyList: any, from: any, to: any): any {
    // console.log('getCompanyByKey' , companyList , from , to)
    let result: any = {}
    companyList.forEach(element => {
      if (element.key == from) {
        // console.log('found company' , element)
        result.from = element
      }
      if (element.key == to) {
        // console.log('found company' , element)
        result.to = element
      }
    })
    return result
  }

  sortCompany(companyList: any[], criteria: any) {
    if (criteria == 'Company value') {
      return companyList.sort((n1, n2) => {
        if (n1.value > n2.value) {
          return -1;
        }
        else if (n1.value < n2.value) {
          return 1;
        } else {
          return 0;
        }
      })
    }
  }

  sortRelation(relationList: any[]) {
    return relationList.sort((n1, n2) => {
      if (n1.cashAmount > n2.cashAmount) {
        return -1;
      }
      else if (n1.cashAmount < n2.cashAmount) {
        return 1;
      } else {
        return 0;
      }
    })
  }

  getIndustryRelationInformation(industryList: any, relationList: any, industry: any) {

    console.log('getIndustryRelationInformation')
    console.log('industryList', industryList)
    console.log('relationList', relationList)
    console.log('industry', industry)

    let industryRelation = []
    let relateCompanyIdList: any = []
    let respDoc: any = []

    var inflow = 0
    var outflow = 0

    relationList.forEach(relation => {
      if (relation.companyFrom == industry) {
        respDoc.push(relation)
        outflow += relation.cashAmount
        if (!relateCompanyIdList.includes(relation.companyTo)) {
          relateCompanyIdList.push(relation.companyTo)
        }
      } else if (relation.companyTo == industry) {
        respDoc.push(relation)
        inflow += relation.cashAmount
        if (!relateCompanyIdList.includes(relation.companyFrom)) {
          relateCompanyIdList.push(relation.companyFrom)
        }
      }
    });

    let resData = {
      'cashflow': {
        'inflow': inflow,
        'outflow': outflow
      },
      'relateCompany': relateCompanyIdList,
      'data': respDoc
    }

    return resData

  }

  findIndustryByName(companyIndustryList: any, name: any) {
    companyIndustryList.forEach(element => {
      if (element.name == name) {
        return element
      }
    });
  }

  addRelationValue(industryRelationList: any, industryFrom: any, industryTo: any, relationType: any, cashAmount: any) {
    let relationResult = {}
    industryRelationList.forEach(relation => {
      if (relation.from == industryFrom) {

      }
    });
  }


}
