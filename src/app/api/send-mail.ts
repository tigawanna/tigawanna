// import { ContactFormState } from '@/components/contact/utils/brevo-emailjs';
// import { SMTPClient } from 'emailjs';

// interface SendMail
// export async function POST(request: Request) {
//     try {
//         const body = await request.json() as ContactFormState
//         const mail_from = process.env.EMAIL_FROM;
//         const mail_to = process.env.EMAIL_TO;
//         const formStste= body.fieldValues;

//         if (!mail_from || !mail_to) {
//             return {
//                 message: "Ooops something went wrong on our side, please try again later",
//                 error: true,
//                 success: false,
//                 fieldValues: body?.fieldValues
//             }
//         }
//         const client = new SMTPClient({
//             user: "denniskinuthiaw@gmail.com",
//             password: process.env.BREVO_KEY,
//             host: "smtp-relay.brevo.com",
//             ssl: true,
//         });

//         const message = await client.sendAsync({
//             from: mail_from,
//             to: mail_to,
//             subject: `Someone left a sender_message on your site`,
//             text: `hey there, ${rawFormData.sender_name} with email: ${rawFormData.sender_contact} 
//         has reached out to you on your portfolio site. \n
//         ------------------------------------------------\n
//         ${rawFormData.sender_message}
//         `,
//         });
//         console.log("succesfully sent email message === ", message);
//         return {
//             message: "Succefully sent",
//             error: false,
//             success: true,
//             fieldValues: prevState?.fieldValues
//         }

//     } catch (err) {
//         console.log("error sending email === ", err);
//         return {
//             message: "An issue occured, please try again later",
//             error: true,
//             success: false,
//             fieldValues: prevState?.fieldValues
//         }
   
//     }
// } 



