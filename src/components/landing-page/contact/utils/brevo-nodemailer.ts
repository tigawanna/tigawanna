"use server";

import { envVariables } from "@/env";
import { sendEmailMessage } from "@/lib/message/deno-echo";
import { TelegramNotifier } from "@/lib/telegram/client";


export interface ContactFormState {
  message: string;
  error: boolean;
  success: boolean;
  fieldValues: {
    sender_name: string;
    sender_email: string;
    sender_message: string;
  };
}
export async function sendEmailwithBrevoSmtpAction(
  prevState: ContactFormState,
  formData: FormData
) {

  const tg = new TelegramNotifier()
  // console.log({prevState, formData});
  const mail_from = envVariables.EMAIL_FROM;
  const mail_to = envVariables.EMAIL_FROM;
  // const brevo_key = envVariables.BREVO_KEY;
  if (!mail_from || !mail_to) {
    return {
      message: "Ooops something went wrong on our side, please try again later",
      error: true,
      success: false,
      fieldValues: prevState?.fieldValues,
    };
  }
  const rawFormData = {
    sender_name: formData.get("sender_name"),
    sender_contact: formData.get("sender_contact"),
    sender_message: formData.get("sender_message"),
  };

  // const transporter = createTransport({
  //   host: "smtp-relay.brevo.com",
  //   port: 587,
  //   auth: {
  //     user: mail_to,
  //     pass: brevo_key,
  //   },
  // });

  const mailOptions = {
    from: mail_from,
    to: mail_to,
    subject: `Someone left a sender_message on your site`,
    text: `hey there, ${rawFormData.sender_name} with email: ${rawFormData.sender_contact} 
        has reached out to you on your portfolio site. \n
        ------------------------------------------------\n
        ${rawFormData.sender_message}
        `,
  };

  return await sendEmailMessage({
    clientName: "portfolio",
    ...mailOptions,
    tg: true,
    persist: true,
  }).then((res) => {
    return {
      message: "Successfully sent, Thank you!",
      error: false,
      success: true,
      fieldValues: {
        sender_name: "",
        sender_email: "",
        sender_message: "",
      },
    }
  }).catch((err) => {
    return {
      message: "Something went wrong",
      error: true,
      success: false,
      fieldValues: prevState?.fieldValues,
    }
  })


  // async function asyncsendMail() {
  //   return new Promise<ContactFormState>((resolve, reject) => {
      // transporter.sendMail(mailOptions, (error: any, info: any) => {
      //   if (error) {
      //     // no("error sending email   =============== ", error);
      //     resolve({
      //       message: "Something went wrong",
      //       error: true,
      //       success: false,
      //       fieldValues: prevState.fieldValues,
      //     });
      //   } else {
      //     // no("Email sent: " + info.response);
      //     resolve({
      //       message: "Successfully sent, Thank you!",
      //       error: false,
      //       success: true,
      //       fieldValues: {
      //         sender_name: "",
      //         sender_email: "",
      //         sender_message: "",
      //       },
      //     });
      //   }
      // });
    // });
  // }

  // return await asyncsendMail();
}
