import { Request } from 'express';

export type CBTEmailSenderType = {
  recipients: string[];
  subject: string;
  text: string;
};

export type CBTJwtSignType = {
  userId: string;
  next: Function;
};

export interface CBTRequestType extends Request {
  requestTime: string;
  user?: {
    role: string;
    // role: 'USER' | 'GUIDE' | 'LEAD-GUIDE' | 'ADMIN';
  };
}
