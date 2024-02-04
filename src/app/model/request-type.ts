import { Files } from './files';
import { RequestRequirements } from './request-requirements';
import { Users } from './users';

export class RequestType {
  requestTypeId: string;
  name: string;
  authorizeACopy: boolean;
  fee: string;
  isPaymentRequired: boolean;
  active: boolean;
  requestRequirements: RequestRequirements[] = [];
}
