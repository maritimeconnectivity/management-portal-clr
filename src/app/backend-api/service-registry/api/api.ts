export * from './docController.service';
import { DocControllerService } from './docController.service';
export * from './instanceController.service';
import { InstanceControllerService } from './instanceController.service';
export * from './ledgerRequestController.service';
import { LedgerRequestControllerService } from './ledgerRequestController.service';
export * from './xmlController.service';
import { XmlControllerService } from './xmlController.service';
export const APIS = [DocControllerService, InstanceControllerService, LedgerRequestControllerService, XmlControllerService];
