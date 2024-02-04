import { Files } from './files';
import { Users } from './users';

export class Member {
  memberId: string;
  memberCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  birthDate: string;
  address: string;
  gender: string;
  courseTaken: string;
  major: string;
  isAlumni: boolean;
  schoolYearLastAttended: string;
  primarySchoolName: string;
  primarySyGraduated: string ;
  secondarySchoolName: string ;
  secondarySyGraduated: string;
  isVerified: boolean;
  birthCertFile: Files;
  user: Users;
}
