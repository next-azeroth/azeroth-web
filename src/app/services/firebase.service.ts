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

export class FirebaseService {

  service = {
    'companyService' : {
      uri : 'https://us-central1-azeroth-web.cloudfunctions.net/companyServiceAPI/',
      service : {
        'getCompanyList' : 'getCompanyList/' ,
        'getCompanyWithoutGroupList' : 'getCompanyWithoutGroupList/',
        'getCompanyGroupList' : 'getCompanyGroupList/' ,
        'createCompany' : 'createCompany/',
        'getCompany' : 'getCompany/',
        'getCompanyInGroup' : 'getCompanyInGroup/' ,
        'getIndustry' : 'getIndustry/'
      }
    },
    'relationService' : {
      uri : 'https://us-central1-azeroth-web.cloudfunctions.net/relationServiceAPI/' ,
      service : {
        'getRelationList' : 'getRelationList/' ,
        'createRelation' : 'createRelation/' ,
        'getRelationByCompany' : 'getRelationByCompany/'
      }
    },
    'configulationService' : {
      uri : 'https://us-central1-azeroth-web.cloudfunctions.net/configulationServiceAPI/' ,
      service : {
        'getConfigulation' : 'getConfigulation/' ,
      }
    }
  }

  constructor(private http: HttpClient) {

  }

  private extractData(res: Response, error: any) {
    let body: any = res;
    console.log('Service complete');
    return body || {};
  }

  getRequest(uri: any, service: any , parameter : any): Observable<any> {
    console.log('Service : getRequest', service);

    const httpOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.http.get(uri + service+parameter , httpOptions).pipe(
      map(this.extractData)
    );
  }

  postRequest(uri: any, service: any, data: any): Observable<any> {
    console.log('Service : postRequest', service);

    const httpOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.http.post(uri + service , data, httpOptions).pipe(
      map(this.extractData)
    );
  }
}

/*
  getCompanyList(): Observable<any> {
    console.log('Service : getCompanyList');

    const httpOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.http.get(companyServiceAPIUri + 'getCompanyList/' , httpOptions).pipe(
      map(this.extractData)
    );
  }

  getCompanyGroupList(): Observable<any> {
    console.log('Service : getCompanyGroupList');

    const httpOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.http.get(companyServiceAPIUri + 'getCompanyGroupList/' , httpOptions).pipe(
      map(this.extractData)
    );
  }

  getRelationList(): Observable<any> {
    console.log('Service : getRelationList');

    const httpOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.http.get(relationServiceAPIUri + 'getRelationList/' , httpOptions).pipe(
      map(this.extractData)
    );
  }

  createRelation(data : any): Observable<any> {
    console.log('Service : createRelationList');

    const httpOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.http.post(relationServiceAPIUri + 'createRelation/' , data , httpOptions).pipe(
      map(this.extractData)
    );
  }

  getConfigulation(): Observable<any> {
    console.log('Service : getConfigulation');

    const httpOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.http.get(configulationServiceAPIUri + 'getConfigulation/' , httpOptions).pipe(
      map(this.extractData)
    );
  }

}

*/
