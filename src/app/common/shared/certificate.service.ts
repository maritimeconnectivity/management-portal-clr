import { Injectable } from '@angular/core';
import { CertificateRevocation, DeviceControllerService, MmsControllerService, OrganizationControllerService, ServiceControllerService, UserControllerService, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { getReasonOptionFromRevocationReason } from '../certRevokeInfo';
import { ItemType } from '../menuType';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  constructor(
    private organizationsService: OrganizationControllerService,
    private devicesService: DeviceControllerService,
    private servicesService: ServiceControllerService,
    private usersService: UserControllerService,
    private vesselsService: VesselControllerService,
    private mmsService: MmsControllerService) {
  }

  ngOnInit() {

  }

  public formatCerts(certificates: any[]): any[] {
    let formatted = [];
    for(const key_certs in certificates) {
      const cert = certificates[key_certs];
      for (const key in cert) {
        certificates[key_certs][key] = cert[key];
      }
      if (cert['revoked']) {
        cert["revokeInfo"] = cert["revokedAt"];
        cert["revokeReasonText"] = getReasonOptionFromRevocationReason(cert["revokeReason"]).title;
      }
      formatted.push(cert);
    }
    return formatted;
  }

  public splitByRevokeStatus(certificates: any[]): any {
    let activeCertificates = [];
    let revokedCertificates = [];
    for(const key_certs in certificates) {
      const cert = certificates[key_certs];
      cert['revoked'] ? revokedCertificates.push(cert) : activeCertificates.push(cert);
    }
    activeCertificates.sort((a,b) => a.end - b.end);
    revokedCertificates.sort((a,b) => a.end - b.end);
    return {
      activeCertificates: this.formatCerts(activeCertificates),
      revokedCertificates: this.formatCerts(revokedCertificates),
    };
  }

	public issueNewCertificate(csr: string, itemType: ItemType, entityMrn: string, orgMrn: string)
            : Observable<string> {
		if (itemType == null || !entityMrn) { // We lost our state data somehow???
			throw new Error('Internal state lost');
		}
		switch (itemType) {
      case ItemType.Organization: {
        return this.organizationsService.newOrgCertFromCsr(csr, entityMrn);
      }
      case ItemType.Device: {
        return this.devicesService.newDeviceCertFromCsr(csr, orgMrn, entityMrn);
      }
      case ItemType.Service: {
        return this.servicesService.newServiceCertFromCsr1(csr, orgMrn, entityMrn);
      }
      case ItemType.User: {
        return this.usersService.newUserCertFromCsr(csr, orgMrn, entityMrn);
      }
      case ItemType.Vessel: {
        return this.vesselsService.newVesselCertFromCsr(csr, orgMrn, entityMrn);
      }
      case ItemType.MMS: {
        return this.mmsService.newMMSCertFromCsr(csr, orgMrn, entityMrn);
      }
      default: {
        throw new Error('Unknown item type');
      }
    }
	}

	public revokeCertificate(itemType: ItemType, entityMrn:string, orgMrn: string,
      certificateId:number, certificateRevocation:CertificateRevocation, version?: string) : Observable<any> {
		if (itemType == null || !entityMrn) { // We lost our state data somehow???
			throw new Error('Internal state lost');
		}

		switch (itemType) {
      case ItemType.Organization: {
        return this.organizationsService.revokeOrgCert(certificateRevocation, entityMrn, certificateId);
      }
      case ItemType.Device: {
        return this.devicesService.revokeDeviceCert(certificateRevocation, orgMrn, entityMrn, certificateId);
      }
      case ItemType.Service: {
        if (version) {
          return this.servicesService.revokeServiceCert(certificateRevocation, orgMrn, entityMrn, version!, certificateId);
        } else {
          return this.servicesService.revokeServiceCert1(certificateRevocation, orgMrn, entityMrn, certificateId);
        }
      }
      case ItemType.User: {
        return this.usersService.revokeUserCert(certificateRevocation, orgMrn, entityMrn, certificateId);
      }
      case ItemType.Vessel: {
        return this.vesselsService.revokeVesselCert(certificateRevocation, orgMrn, entityMrn, certificateId);
      }
      case ItemType.MMS: {
        return this.mmsService.revokeMMSCert(certificateRevocation, orgMrn, entityMrn, certificateId);
      }
      default: {
        throw new Error('Unknown item type');
      }
    }
	}
}
