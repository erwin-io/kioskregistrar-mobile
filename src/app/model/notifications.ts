import { Users } from './users';

export class Notifications {
  notificationId: string;
  title: string;
  description: string;
  referenceId: string;
  isRead: boolean;
  date: Date;
  user: Users;
  type: string;
}
