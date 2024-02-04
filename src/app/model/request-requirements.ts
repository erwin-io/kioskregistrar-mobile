import { Files } from './files';
import { RequestType } from './request-type';
import { Users } from './users';

export class RequestRequirements {
  requestRequirementsId: string;
  name: string;
  requestType: RequestType;
  requireToSubmitProof: boolean;
  active: boolean;
  files: Files[] = [];
  isLoading?: boolean = false;
}
