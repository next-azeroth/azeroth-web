import { Component} from '@angular/core';
import { FirebaseService } from './services/firebase.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  constructor(private firebaseService: FirebaseService) {
    this.getConfigulationList()
  }

  getConfigulationList(){
    this.firebaseService.getRequest(this.firebaseService.service.configulationService.uri , this.firebaseService.service.configulationService.service.getConfigulation , '').subscribe((data: {}) => {

      let resp : any = data

      const industryArray = resp.data.industry
      const sortIndustry = industryArray.sort()
      resp.data.industry = sortIndustry

      const relationArray = resp.data.relationType
      const sortRelation = relationArray.sort((n1,n2)=> {
        if (n1.name > n2.name) {
          return 1;
      }
      if (n1.name < n2.name) {
          return -1;
      }
      return 0;
      })
      resp.data.relationType = sortRelation

      console.log('resp.data.relationType' , resp.data.relationType)

      if (resp.status == 'Complete') {
        localStorage.setItem('configulation' , JSON.stringify(resp.data))
      }
    });
  }

}
