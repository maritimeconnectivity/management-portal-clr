import { Component, Input, SimpleChanges } from '@angular/core';
import { DeviceControllerService, ServiceControllerService, UserControllerService, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';
import { CertChartComponent } from "../cert-chart/cert-chart.component";
import { ItemtypeChartComponent } from "../itemtype-chart/itemtype-chart.component";

@Component({
  selector: 'app-itemtype-overview',
  standalone: true,
  imports: [CertChartComponent, ItemtypeChartComponent],
  templateUrl: './itemtype-overview.component.html',
  styleUrl: './itemtype-overview.component.css'
})
export class ItemtypeOverviewComponent {
  @Input() orgMrn: string = '';
  @Input() itemType: string = '';
  items: any[] = [];
  certificates: any[] = [];
  numberOfRevoked: number = 0;
  numberOfExpired: number = 0;
  numberOfActive: number = 0;
  constructor(
    private deviceService: DeviceControllerService,
    private userService: UserControllerService,
    private vesselService: VesselControllerService,
    private serviceService: ServiceControllerService,
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['orgMrn'].currentValue === '') {
      return;
    }
    this.orgMrn = changes['orgMrn'].currentValue;
    this.items = [];
    this.certificates = [];

    this.numberOfActive = 0;
    this.numberOfRevoked = 0;
    this.numberOfExpired = 0;
    const revokedCertFilter = (cert: any) => cert.revoked === true;
    const outdatedCertFilter = (cert: any) => cert.revoked === false && cert.end < new Date().getTime();
    if (this.itemType === ItemType.Device) {
      this.deviceService.getOrganizationDevices(this.orgMrn).subscribe((page) => {
        page.content!.forEach(element => {
          this.items = this.items.concat(element);
          if (element.certificates) {;
            this.certificates = this.certificates.concat(element.certificates.filter((cert:any) => cert.revoked === false).map((cert: any) => ({...cert, mrn: element.mrn})));
            this.numberOfRevoked += element.certificates.filter(revokedCertFilter).length;
            this.numberOfExpired += element.certificates.filter(outdatedCertFilter).length;
          }
          this.numberOfActive = this.certificates.length - this.numberOfExpired;
        });
      });
    } else if (this.itemType === ItemType.User) {
      this.userService.getOrganizationUsers(this.orgMrn).subscribe((page) => {
        page.content!.forEach(element => {
          this.items = this.items.concat(element);
          if (element.certificates) {
            this.certificates = this.certificates.concat(element.certificates.filter( (cert:any) => cert.revoked === false).map((cert: any) => ({...cert, mrn: element.mrn})));
            this.numberOfRevoked += element.certificates.filter(revokedCertFilter).length;
            this.numberOfExpired += element.certificates.filter(outdatedCertFilter).length;
          }
          this.numberOfActive = this.certificates.length - this.numberOfExpired;
        });
      });
    } else if (this.itemType === ItemType.Vessel) {
      this.vesselService.getOrganizationVessels(this.orgMrn).subscribe((page) => {
        page.content!.forEach(element => {
          this.items = this.items.concat(element);
          if (element.certificates) {
            this.certificates = this.certificates.concat(element.certificates.filter( (cert:any) => cert.revoked === false).map((cert: any) => ({...cert, mrn: element.mrn})));
            this.numberOfRevoked += element.certificates.filter(revokedCertFilter).length;
            this.numberOfExpired += element.certificates.filter(outdatedCertFilter).length;
          }
          this.numberOfActive = this.certificates.length - this.numberOfExpired;
        });
      });
    } else if (this.itemType === ItemType.Service) {
      this.serviceService.getOrganizationServices(this.orgMrn).subscribe((page) => {
        page.content!.forEach(element => {
          this.items = this.items.concat(element);
          if (element.certificates) {
            this.certificates = this.certificates.concat(element.certificates.filter( (cert:any) => cert.revoked === false).map((cert: any) => ({...cert, mrn: element.mrn})));
            this.numberOfRevoked += element.certificates.filter(revokedCertFilter).length;
            this.numberOfExpired += element.certificates.filter(outdatedCertFilter).length;
          }
          this.numberOfActive = this.certificates.length - this.numberOfExpired;
        });
      });
    }
  }
}
