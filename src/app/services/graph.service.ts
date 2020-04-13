import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  configulationList: any = []
  relationType = []

  constructor() {
    this.configulationList = JSON.parse(localStorage.getItem('configulation'))
    this.configulationList.relationType.forEach(element => {
      this.relationType.push(element.name)
    });
  }

  calculateNodeSize(node: any) {

    let size = 0

    if (node.data.value < 1000000) {
      size = 1
    } else if (node.data.value < 10000000) {
      size = 4
    } else if (node.data.value < 1000000000) {
      size = 10
    } else if (node.data.value < 100000000000) {
      size = 20
    } else {
      size = 40
    }

    if(node.data.taxId == ''){
      size = 0
    }else if(node.data.taxId == 'industry'){
      if (node.data.industry == 'AIS'){
        size = 25
      }else {
        size = 10
      }

    }

    return size

  }

  calculateRelationLength(link: any) {
    if (link.data.cashAmount == 0) {
      // For company group
      return 10
    }else if (link.data.cashAmount > 0 && link.data.cashAmount  <= 100000) {
      return 250
    } else if (link.data.cashAmount  <= 1000000) {
      return 170
    } else if (link.data.cashAmount  <= 5000000) {
      return 140
    } else if (link.data.cashAmount  <= 10000000) {
      return 100
    } else {
      return 80
    }
  }

  calculateRelationColor(link: any) {

    switch (link.data.relationType) {
      case 'Supplier-Distributor':
        return '#ff0000'
      case 'Supplier-Retailer':
        return '#cc00ff'
      case 'Supplier-Customer':
        return '#cccc00'
      case 'Distributor-Retailer':
        return '#33cc33'
      case 'Distributor-Customer':
        return '#0066ff'
      case 'Retailer-Customer':
        return '#cc00ff'
      case 'Company group':
        return '#000000'
      default:
        return '#ffffff'
      //default block statement;
    }

  }

  calculateLinkDirectionalParticleSpeed(link: any) {
    if (link.data.cashAmount == 0) {
      return 0
    } else if (link.data.cashAmount < 100000) {
      return 0.001
    } else if (link.data.cashAmount < 1000000) {
      return 0.005
    } else if (link.data.cashAmount < 10000000) {
      return 0.01
    } else if (link.data.cashAmount < 100000000) {
      return 0.025
    } else {
      return 0.05
    }
  }

  toggleRelationColor(link : any , relationType : any , status : any){

  }



}
