import nodemailer from 'nodemailer';
import { CBTEmailSenderType } from '../types';

const { MailtrapTransport } = require('mailtrap');

const TOKEN = process.env.MAILTRAP_API_TOKEN;

const cbtSendEmail = async ({
  recipients,
  subject,
  text,
}: CBTEmailSenderType) => {
  const transporter = nodemailer.createTransport(
    MailtrapTransport({
      token: TOKEN,
      testInboxId: 3153576,
    })
  );

  const sender = {
    address: 'officialisaiahovie@gmail.com',
    name: 'CBT System API',
  };

  try {
    return transporter
      .sendMail({
        from: sender,
        to: recipients,
        subject,
        text,
      })
      .then((res) => res)
      .catch((err) => new Error(err));
  } catch (err) {
    console.error(err);
  }
};

export default cbtSendEmail;
