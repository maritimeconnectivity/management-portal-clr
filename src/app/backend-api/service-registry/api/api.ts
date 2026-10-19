export * from './docController.service';
import { DocControllerService } from './docController.service';
export * from './instanceController.service';
import { InstanceControllerService } from './instanceController.service';
export * from './xmlController.service';
import { XmlControllerService } from './xmlController.service';
export const APIS = [DocControllerService, InstanceControllerService, XmlControllerService];
