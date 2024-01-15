# Adding a contact me form using server actions and nodemailer

Now that we've shown the viewre all about us , lets give them a way to reach us

Since we're using NextJs lets use some server actions to send them an email when someone submits that form

Lets create the server action 

```ts
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


 Then we bring in 2 hooks tht will help us with progressive enhancement

```tsx
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

```


We'll add all of that into a simple form 

```tsx
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
```
let's create the submit button too

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
