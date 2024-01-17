Next.js 14 introduced a new feature: stable server actions. They are functions that run on the server and handle form submissions and data mutations in Next.js applications.

They eliminate the need for separate API routes or complex type mapping. Server actions simplify the workflow, making your frontend code more concise and your forms more performant.

They also support progressive enhancement, meaning your forms and buttons work even without JavaScript. Server actions are a powerful tool for web development.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2mps1vjwy8nzv9ic02d7.png)

Now we'll just define an action that will take in the form data and send myself an email with NodeMailer based on what was submitted.

```tsx
"use server";

import  {createTransport} from "nodemailer";

export interface ContactFormState {
    message: string;
    error: boolean;
    success:boolean;
    fieldValues: {
        sender_name: string;
        sender_email: string;
        sender_message: string;
    }
}
export async function sendEmailwithBrevoSmtpAction(prevState: ContactFormState, formData: FormData) {
  const mail_from = process.env.EMAIL_FROM
  const mail_to = process.env.EMAIL_FROM
  const brevo_key = process.env.BREVO_KEY
  if (!mail_from || !mail_to || !brevo_key) {
    return {
      message: "Ooops something went wrong on our side, please try again later",
      error: true,
      success: false,
      fieldValues: prevState?.fieldValues
    }
  }
  const rawFormData = {
    sender_name: formData.get("sender_name"),
    sender_contact: formData.get("sender_contact"),
    sender_message: formData.get("sender_message"),
  };

  const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user:mail_to,
      pass:brevo_key,
    },
  });

  const mailOptions = {
    from:mail_from,
    to:mail_to,
    subject: `Someone left a sender_message on your site`,
    text: `hey there, ${rawFormData.sender_name} with email: ${rawFormData.sender_contact} 
        has reached out to you on your portfolio site. \n
        ------------------------------------------------\n
        ${rawFormData.sender_message}
        `,
  };


  async function asyncsendMail(){
    return new Promise<ContactFormState>((resolve,reject) =>{
      transporter.sendMail(mailOptions,
        function (error: any, info: any) {
          if (error) {
     
            resolve(
              {
                message: "Something went wrong",
                error: true,
                success: false,
                fieldValues: prevState.fieldValues
              }
            )
  
          } else {

            resolve({
              message: "Successfully sent, Thank you!",
              error: false,
              success: true,
              fieldValues: {
                sender_name: "",
                sender_email: "",
                sender_message: "",
              }
            })

   
          }
        });
    });
  }
  
  return await asyncsendMail()


}
```
Am using [brevo SMTP](https://app.brevo.com/) , they have a nice free tier and great dashboard ,their SDK is not it hence why I with nodemailer instead

then we can call it in out component

```tsx
"use client";
import { useFormState, useFormStatus } from "react-dom";
import { SectionHeader } from "../shared/SectionHeader";
import { sendEmailwithBrevoSmtpAction,ContactFormState } from "./utils/brevo-nodemailer";
import { testAction } from "./utils/test-action";
import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";
import { SubmitButton } from "./SubmitButton";


interface ContactMeFormProps {

}


export function ContactMeForm({}:ContactMeFormProps){
  // @ts-expect-error
  const [formState, formAction] = useFormState<ContactFormState>(sendEmailwithBrevoSmtpAction, {
    message: "",
    error: false,
    success: false,
    fieldValues: {
      sender_name: "",
      sender_email: "",
      sender_message: "",
    },
  });
const [status,setStatus] = useState({
  error:formState.error,
  success:formState.success
})
const formRef=  useRef<HTMLFormElement>(null)
useEffect(()=>{
if(formState?.success){
  formRef.current?.reset()
}
setStatus((prev) => {
      return {error:formState.error,success:formState.success};
});
const messageTimeout = setTimeout(()=>{

  if(formState?.error){
    setStatus((prev)=>{
      return {...prev,error:false}
    })
  }
  if(formState?.success){
    setStatus((prev) => {
      return { ...prev, success: false };
    });
  }
},8000)
return ()=>{
  clearTimeout(messageTimeout)
}
 },[formState])



return (
  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center   rounded-lg  animate-in fade-in zoom-in duration-500 ">
    <SectionHeader heading="Talk to me" id="contact" />
    <form
      id="contact-form"
      ref={formRef}
      action={formAction}
      className="flex flex-col justify-center items-center gap-4 w-[95%] md:w-[70%] lg:w-[60%] min-w-[60%] h-fit glass p-5 rounded-xl ">
      {status?.error && (
        <div
          className="bg-base-300 text-error border border-error p-2 
          text-balance rounded-xl animate-in fade-in zoom-in duration-700">
          {formState?.message}
        </div>
      )}
      {status?.success && (
        <div
          className="bg-base-300 text-success p-2 border border-success text-center text-balance 
         rounded-xl animate-in fade-in zoom-in duration-700">
          {formState?.message}
        </div>
      )}

      <div className="w-full flex flex-col gap-1">
        <label htmlFor="sender_name" className="bg-base-200 rounded-xl p-1 w-fit">
          Name
        </label>
        <input
          id="sender_name"
          type="text"
          placeholder="name"
          name="sender_name"
          className="input"
        />
      </div>

      <div className="w-full flex flex-col gap-1">
        <label htmlFor="sender_message" className="bg-base-200 rounded-xl p-1 w-fit">
          Message
        </label>
        <textarea
          id="sender_message"
          name="sender_message"
          required
          className="textarea min-h-40"
          placeholder="Message"
        />
      </div>

      <div className="w-full flex flex-col gap-1">
        <label htmlFor="sender_contact" className="text-xs bg-base-200 rounded-xl p-1 w-fit">
          How can i reach you (optional)
        </label>
        <input
          id="sender_contact"
          placeholder="contact information"
          type="text"
          name="sender_contct"
          className="input"
        />
      </div>
      <SubmitButton />
    </form>
  </div>
);
}

```
and for the button 

```tsx
import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {

}

export function SubmitButton({}:SubmitButtonProps){
const { pending } = useFormStatus();
return (
  <button
    // onClick={(e) => e.preventDefault()}
    type="submit"
    className="btn  btn-wide">
    Send {pending && <Loader className="animate-spin h-4 w-4" />}
  </button>
);
}

```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2mps1vjwy8nzv9ic02d7.png)

Shoutout to [daisyui](https://daisyui.com/) for that cool glass effect

And that should give us a progressively enhanced form that will work wit JavaScript disabled and get better UX with JS turned on 

This would have all been easier to do with libraries like react-hook-form , but over engineering actually adds value in the form of progressive enhancement.

At tis point , the only thing we haven't over engineered is the animations , we could do stuff with `framer-motion` , `threejs` or `animejs` , we could even go harder and do stuff with the WebGPU APIs . but we can leave it at that for now as it would require an unnecessary amount of client side JavaScript and probably annoy anyone viewing it but maybe I might try out [Qwik](https://qwik.builder.io/) which is better at this . 

A minimal tailwind animations compromise is [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) , but it doesn't have fancy interaction observer or list staggering animation as all those require JavaScript and event listeners and I wish to retain components without "use client" .
