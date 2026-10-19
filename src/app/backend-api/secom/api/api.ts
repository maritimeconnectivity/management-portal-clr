export * from './service.service';
import { ServiceService } from './service.service';
export * from './serviceRegistry.service';
import { ServiceRegistryService } from './serviceRegistry.service';
export const APIS = [ServiceService, ServiceRegistryService];
