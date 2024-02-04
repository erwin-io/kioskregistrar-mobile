import { Admin } from './admin';
import { Files } from './files';
import { Member } from './member';
import { RequestRequirements } from './request-requirements';
import { RequestType } from './request-type';
import { Users } from './users';

export class Request {
  requestId: string;
  requestNo: string;
  dateRequested: Date;
  dateAssigned: Date | null;
  datePaid?: Date | null;
  dateProcessStarted?: Date | null;
  dateProcessEnd: Date | null;
  dateCompleted?: Date | null;
  dateClosed?: Date | null;
  dateLastUpdated: Date | null;
  requestStatus: 'PENDING'|
  'TOPAY'|
  'PROCESSING'|
  'TOCOMPLETE'|
  'CLOSED'|
  'CANCEL'|
  'REJECTED';
  description: string;
  assignedAdmin: Admin;
  requestType: RequestType;
  requestedBy: Member;
  isPaid: boolean;
  submittedRequirements: SubmittedRequirements[];
}

export class SubmittedRequirements {
  requestId: string;
  requestRequirementsId: string;
  files: Files[] = [];
  request: Request;
  requestRequirements: RequestRequirements;
}
