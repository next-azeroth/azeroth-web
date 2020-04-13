import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import ForceGraph3D from '3d-force-graph';
import * as d3 from 'd3'
import { GraphService } from '../services/graph.service';
import { DataTransformationService } from '../services/dataTransformation.service';
import { MatDialogRef, MatDialog } from '@angular/material';

import * as THREE from 'THREE'
import SpriteText from 'three-spritetext'


@Component({
  selector: 'app-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss']
})
export class SpaceComponent implements OnInit {

  @ViewChild("chart", { static: true })
  public chart: ElementRef;

  @ViewChild("relationDetailTemplate", { static: true })
  private relationDetailTemplate: TemplateRef<any>;
  relationDetailTemplateRef: MatDialogRef<any>;

  @ViewChild("processTemplate", { static: true })
  private processTemplate: TemplateRef<any>;
  processTemplateRef: MatDialogRef<any>;


  @ViewChild("profileTemplate", { static: true })
  private profileTemplate: TemplateRef<any>;
  profileTemplateRef: MatDialogRef<any>;

  relationList: any = []
  companyList: any = []
  companyGroupList: any = []
  graphData: any = []
  configulationList: any = []

  companyRankingList: any = []
  companyIdRankingList: any = []
  relationRankingList: any = []


  // Space
  graph: any
  isFocusNode = false

  isRelationFilter: any = []

  // Search
  searchControl = new FormControl();
  searchOptions: string[] = [];
  filteredOptions: Observable<string[]>;

  //Node
  selectNode: any = {}

  //slider
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 0;
  showTicks = true;
  step = 1;
  thumbLabel = false;
  sliderTopRankValue = 20;
  vertical = false;
  tickInterval = 1;

  // Company by Industry
  industryList: any = []

  // filter view
  filterView = 'company'

  constructor(private firebaseService: FirebaseService, private graphService: GraphService, public dataTransformationService: DataTransformationService, private dialog: MatDialog) {
    this.configulationList = JSON.parse(localStorage.getItem('configulation'))
    this.getRelationFilter()
    // this.getCompanyList()
    this.getCompanyData()
  }

  getSliderTickInterval(): number | 'auto' {
    return this.showTicks ? (this.autoTicks ? 'auto' : this.tickInterval) : 0;
  }

  ngOnInit() {
    this.filteredOptions = this.searchControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  openRelationDetailTemplate(): void {
    this.relationDetailTemplateRef = this.dialog.open(this.relationDetailTemplate, {
      width: '800px',
      height: '600px'
    });

    this.relationDetailTemplateRef.afterClosed();
  }

  openProcessTemplate(): void {
    this.processTemplateRef = this.dialog.open(this.processTemplate, {
      width: '400px'
    });

    this.processTemplateRef.afterClosed();
  }


  openProfileTemplate(): void {
    this.profileTemplateRef = this.dialog.open(this.profileTemplate, {
      width: '60vw'
    });

    this.profileTemplateRef.afterClosed();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.searchOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  getCompanyData() {
    let promiseArray = []

    promiseArray = [
      new Promise((resolve, reject) => {
        console.log('promise getCompanyList')
        this.companyList = []
        this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyList, '').subscribe((data: {}) => {
          let resp: any = data
          if (resp.status == 'Complete') {
            this.companyList = resp.data
            resolve('Complete')
          }
        });
      }),
      new Promise((resolve, reject) => {
        console.log('promise getCompanyGroupList')
        this.companyGroupList = []
        this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyGroupList, '').subscribe((data: {}) => {

          let respGroup: any = data
          if (respGroup.status == 'Complete') {
            this.companyGroupList = respGroup.data
            this.companyGroupList.forEach(group => {
              this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyInGroup, group.name).subscribe((groupdata: {}) => {
                let respComp: any = groupdata
                let companyInGroup: any = []
                if (respComp.status == 'Complete') {
                  respComp.data.forEach(groupComp => {
                    companyInGroup.push(groupComp)
                  })
                  group.companyInGroup = companyInGroup
                }
                resolve('Complete')
              });
            })
          }
        });
      }),
      new Promise((resolve, reject) => {
        console.log('promise getRelationList')
        this.relationList = []
        this.firebaseService.getRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.getRelationList, '').subscribe((data: {}) => {
          let resp: any = data
          if (resp.status == 'Complete') {
            this.relationList = resp.data
            resolve('Complete')
          }
        });
      }),
      new Promise((resolve, reject) => {
        console.log('promise getRelationList')
        this.industryList = []
        this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getIndustry, '').subscribe((data: {}) => {
          let resp: any = data
          if (resp.status == 'Complete') {
            this.industryList = resp.data
            resolve('Complete')
          }
        });
      })
    ]

    Promise.all(promiseArray).then(resp => {
      console.log('promise all')
      this.getCompanyListForSearch()
      this.createGraphData()
      this.renderChart()
    }).catch(respError => {
      console.log('promise error', respError)
    })
  }

  getRelationFilter() {
    this.isRelationFilter = []
    this.configulationList.relationType.forEach(element => {

      let relation: any = {}
      relation[element.name] = true
      this.isRelationFilter.push(relation)
    });
  }

  getCompanyList() {
    this.companyList = []
    this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyList, '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.companyList = resp.data

        // this.getCompanyListForSearch()
        // this.getCompanyGroupList()
        // this.getRelationList()
      }
    });
  }

  getCompanyGroupList() {
    this.companyGroupList = []
    this.firebaseService.getRequest(this.firebaseService.service.companyService.uri, this.firebaseService.service.companyService.service.getCompanyGroupList, '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.companyGroupList = resp.data
      }
    });
  }

  getRelationList() {
    this.relationList = []
    this.firebaseService.getRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.getRelationList, '').subscribe((data: {}) => {

      let resp: any = data

      if (resp.status == 'Complete') {
        this.relationList = resp.data

        // this.createGraphData()
        // this.renderChart()
      }
    });
  }

  createGraphData() {
    this.graphData = {
      nodes: this.companyList.map(function (d) {
        let node = {
          id: d.key,
          data: d
        }
        return node
      }),
      links: this.relationList.map(function (d) {
        let link = {
          'source': d.companyFrom,
          'target': d.companyTo,
          'data': d
        }
        return link
      })
    }

    this.companyGroupList.forEach(group => {
      this.graphData.nodes.push(
        {
          id: group.key,
          data: {
            industry: this.configulationList.industry[Math.floor(Math.random() * this.configulationList.industry.length)].name, ...group
          }
        }
      )

      // group.companyInGroup.forEach(compInGroup => {
      //   this.graphData.links.push(
      //     {
      //       source: group.key,
      //       target: compInGroup.key,
      //       data: {
      //         'relationType': 'Company Group',
      //         'cashAmount': 0
      //       }
      //     }
      //   )
      // });
    });

  }

  createRankingGraphData() {
    this.graphData = {
      nodes: this.companyRankingList.map(function (d) {
        let node = {
          id: d.key,
          data: d
        }
        return node
      }),
      links: this.relationRankingList.map(function (d) {
        let link = {
          'source': d.companyFrom,
          'target': d.companyTo,
          'data': d
        }
        return link
      })
    }

    this.companyGroupList.forEach(group => {

      if (this.companyIdRankingList.includes(group.key)) {
        this.graphData.nodes.push(
          {
            id: group.key,
            data: group
          }
        )

        group.companyInGroup.forEach(compInGroup => {
          this.graphData.links.push(
            {
              source: group.key,
              target: compInGroup.key,
              data: { 'relationType': 'Company Group' }
            }
          )
        });
      }
    });
  }

  createIndustryGraphData() {
    this.graphData = {
      nodes: this.industryList.companyIndustryList.map(function (d) {
        let node = {
          id: d.key,
          data: d
        }
        return node
      }),
      links: this.industryList.relationIndustryList.map(function (d) {
        let link = {
          'source': d.companyFrom,
          'target': d.companyTo,
          'data': d
        }
        return link
      })
    }
  }

  getCompanyListForSearch() {
    this.searchOptions = []
    this.companyList.forEach(element => {
      this.searchOptions.push(element.name)
    });
  }

  renderChart() {

    this.openProcessTemplate()

    let self = this
    let component = document.getElementById('graphSpace')
    this.graph = ForceGraph3D()
      (document.getElementById('chart'))
      .cooldownTime(7000)
      .width(component.clientWidth)
      .height(component.clientHeight - 80)
      .showNavInfo(false)
      .nodeAutoColorBy(function (d) {
        return d.data.group
      })
      .nodeLabel(function (d) {
        return d.data.name
      })
      .nodeThreeObject(node => {
        return self.createCompanyNode(node)
      })
      .linkOpacity(0.7)
      .linkCurvature(Math.PI * 0.1)
      .linkCurveRotation(link => {
        const ralationCurvePosition = self.graphService.relationType.indexOf(link.data.relationType) + 1
        return Math.PI * ralationCurvePosition
      })
      .linkDirectionalParticles(3)
      .linkDirectionalParticleWidth(4)
      .linkDirectionalParticleSpeed(link => {
        return self.graphService.calculateLinkDirectionalParticleSpeed(link)
      })
      .linkDirectionalParticleResolution(20)
      .linkColor(link => {
        return self.graphService.calculateRelationColor(link)
      })
      .graphData(this.graphData)
      .enableNodeDrag(false)
      .onNodeClick(node => {
        self.focusNode(node)
      })
      .onBackgroundRightClick(function (d) {
        self.openProcessTemplate()
        self.graph.cooldownTime(5000)
        self.graph.cameraPosition(
          { x: 0, y: 0, z: 700 }, // new position
          { x: 0, y: 0, z: 0 }, // lookAt ({ x, y, z })
          3000  // ms transition duration
        )
        self.delay(4500).then(any => {
          self.selectNode = {}
          self.graph.nodeThreeObject(node => {
            return self.createCompanyNode(node)
          })
          self.graph.linkDirectionalParticleWidth(2);
        })
      })
      .onEngineStop(function (d) {
        console.log('onEngineStop')
        self.processTemplateRef.close()
      });

    this.graph
      .d3Force('link')
      .distance(link => self.graph.nodeRelSize() * self.graphService.calculateRelationLength(link));

  }

  createCompanyNode(node: any) {
    const size = this.graphService.calculateNodeSize(node)
    // use a sphere as a drag handle
    const obj = new THREE.Mesh(
      new THREE.SphereGeometry(size, 20, 20),
      new THREE.MeshLambertMaterial({ opacity: 0.95, color: node.color, transparent: true })
    );
    return obj;
  }

  focusNode(node: any) {
    console.log('focus node')
    this.selectNode = node
    console.log('this.selectNode', this.selectNode)
    this.displayCompanyInformation()
  }

  moveCameraToNode(node: any) {

    console.log('moveCameraToNode')
    this.openProcessTemplate()

    if (node !== null) {

      const distance = 200;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);



      this.graph
        .cooldownTime(5000)
        .cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        );

      this.delay(4500).then(any => {
        this.hilightFocusNode()
      })

    }

  }

  displayCompanyInformation() {

    console.log('displayCompanyInfomation')
    var relationData: any = {}

    if (this.filterView == 'company') {
      // display company profile
      this.firebaseService.getRequest(this.firebaseService.service.relationService.uri, this.firebaseService.service.relationService.service.getRelationByCompany, this.selectNode.data.key).subscribe((data: {}) => {

        let resp: any = data

        if (resp.status == 'Complete') {
          relationData.cashflow = resp.data.cashflow
          relationData.data = resp.data.data
          relationData.relateCompany = resp.data.relate_company

          relationData.data.forEach(element => {
            let company_data = this.getCompanyRelationByKey(element.companyFrom, element.companyTo)

            element.companyFrom_data = company_data.from
            element.companyTo_data = company_data.to
          });

          this.selectNode.data['relation'] = relationData
        }
      })

    } else {
      // display industry profile
      this.selectNode.data['relation'] = this.dataTransformationService.getIndustryRelationInformation(this.industryList.companyIndustryList , this.industryList.relationIndustryList , this.selectNode.data.key)
    }

    console.log('select node' , this.selectNode)
  }

  hilightFocusNode() {

    console.log('hilightFocusNode')
    let self = this

    let nodes: any = []
    nodes = this.selectNode.data.relation.relateCompany
    nodes.push(this.selectNode.data.key)

    this.graph
      .nodeThreeObject(node => {

        const size = this.graphService.calculateNodeSize(node)
        let opacity = 0

        if (nodes.includes(node.id)) {
          opacity = 0.75
        } else {
          opacity = 0.15
        }
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
          new THREE.SphereGeometry(size, 20, 20),
          new THREE.MeshLambertMaterial({ opacity: opacity, color: node.color, transparent: true })
        );

        return obj
      })
      .linkDirectionalParticleWidth(function (d) {
        if (self.selectNode.data.relation !== undefined) {
          if ((self.selectNode.data.relation.relateCompany.includes(d.source.id)) && (self.selectNode.data.relation.relateCompany.includes(d.target.id))) {
            return 2
          }
        }
        if ((self.selectNode.id == d.source.id) || (self.selectNode.id == d.target.id)) {
          return 2
        } else {
          return 0.1
        }
      })
      .onEngineStop(function (d) {
        console.log('onEngineStop')
        self.processTemplateRef.close()
      })

  }

  search(companyName: any) {

    console.log('search')
    let nodeData = this.graph.graphData().nodes
    nodeData.forEach(element => {
      if (element.data.name == companyName) {
        this.focusNode(element)
      }
    });
  }

  getCompanyRelationByKey(from: any, to: any) {

    let company = this.dataTransformationService.getCompanyRelationByKey(this.companyList, from, to)
    return company
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then();
  }

  getTopCompanyGraph() {
    this.companyRankingList = []
    this.companyIdRankingList = []
    this.relationRankingList = []
    const topRank = Math.floor(this.companyList.length * (this.sliderTopRankValue / 100))

    const sortCompanyList = this.dataTransformationService.sortCompany(this.companyList, 'Company value')

    for (let i = 0; i < topRank; i++) {
      this.companyRankingList.push(sortCompanyList[i])
      this.companyIdRankingList.push(sortCompanyList[i].key)
    }

    this.relationList.forEach(element => {
      if (this.companyIdRankingList.includes(element.companyFrom) && (this.companyIdRankingList.includes(element.companyTo))) {
        this.relationRankingList.push(element)
      }
    });

    // console.log('newCompanyList', this.companyRankingList)
    // console.log('newRelationList', this.relationRankingList)

    this.createRankingGraphData()
    this.renderChart()

  }

  getTopRelationGraph() {
    this.companyRankingList = []
    this.companyIdRankingList = []
    this.relationRankingList = []

    const topRank = Math.floor(this.relationList.length * (this.sliderTopRankValue / 100))
    const sortRelationList = this.dataTransformationService.sortRelation(this.relationList)

    for (let i = 0; i < topRank; i++) {
      this.relationRankingList.push(sortRelationList[i])

      if (!this.companyIdRankingList.includes(sortRelationList[i].companyFrom)) {
        this.companyIdRankingList.push(sortRelationList[i].companyFrom)

        const companyRelation = this.getCompanyRelationByKey(sortRelationList[i].companyFrom, sortRelationList[i].companyTo)
        this.companyRankingList.push(companyRelation.from)
      }

      if (!this.companyIdRankingList.includes(sortRelationList[i].companyTo)) {
        this.companyIdRankingList.push(sortRelationList[i].companyTo)

        const companyRelation = this.getCompanyRelationByKey(sortRelationList[i].companyFrom, sortRelationList[i].companyTo)
        this.companyRankingList.push(companyRelation.to)
      }

    }

    // console.log('companyIdRankingList', this.companyIdRankingList)
    // console.log('newCompanyList', this.companyRankingList)
    // console.log('newRelationList', this.relationRankingList)

    this.createRankingGraphData()
    this.renderChart()

  }

  getAllCompanyGraph() {
    this.createGraphData()
    this.renderChart()
  }

  getTopRelationByTypeGraph(type: any) {
    this.companyRankingList = []
    this.companyIdRankingList = []
    this.relationRankingList = []

    const topRank = Math.floor(this.relationList.length * (this.sliderTopRankValue / 100))
    const sortRelationList = this.dataTransformationService.sortRelation(this.relationList)
    var i = 0

    do {

      if (sortRelationList[i].relationType == type) {

        this.relationRankingList.push(sortRelationList[i])

        if (!this.companyIdRankingList.includes(sortRelationList[i].companyFrom)) {
          this.companyIdRankingList.push(sortRelationList[i].companyFrom)

          const companyRelation = this.getCompanyRelationByKey(sortRelationList[i].companyFrom, sortRelationList[i].companyTo)
          this.companyRankingList.push(companyRelation.from)
        }

        if (!this.companyIdRankingList.includes(sortRelationList[i].companyTo)) {
          this.companyIdRankingList.push(sortRelationList[i].companyTo)

          const companyRelation = this.getCompanyRelationByKey(sortRelationList[i].companyFrom, sortRelationList[i].companyTo)
          this.companyRankingList.push(companyRelation.to)
        }

      }

      i++

    } while (i < topRank && i < sortRelationList.length)

    // console.log('companyIdRankingList', this.companyIdRankingList)
    // console.log('newCompanyList', this.companyRankingList)
    // console.log('newRelationList', this.relationRankingList)

    this.createRankingGraphData()
    this.renderChart()

  }

  getTopCompanyByTypeGraph(type: any) {

    this.companyRankingList = []
    this.companyIdRankingList = []
    this.relationRankingList = []
    const topRank = Math.floor(this.companyList.length * (this.sliderTopRankValue / 100))

    const sortCompanyList = this.dataTransformationService.sortCompany(this.companyList, 'Company value')
    var i = 0

    do {
      if (sortCompanyList[i].industry == type) {
        this.companyRankingList.push(sortCompanyList[i])
        this.companyIdRankingList.push(sortCompanyList[i].key)
      }
    } while (i < topRank && i < sortCompanyList.length)

    this.relationList.forEach(element => {
      if (this.companyIdRankingList.includes(element.companyFrom) && (this.companyIdRankingList.includes(element.companyTo))) {
        this.relationRankingList.push(element)
      }
    });

    // console.log('newCompanyList', this.companyRankingList)
    // console.log('newRelationList', this.relationRankingList)

    this.createRankingGraphData()
    this.renderChart()

  }

  getIndustryGraph() {
    this.createIndustryGraphData()
    this.renderChart()
  }

  switchFilterView() {
    if (this.filterView == 'company') {
      this.filterView = 'industry'
      this.getIndustryGraph()
    } else {
      this.filterView = 'company'
      this.getAllCompanyGraph()
    }

  }

  getCompanyProfileListKey(){
    return Object.keys(this.selectNode.data.profile)
  }



}
