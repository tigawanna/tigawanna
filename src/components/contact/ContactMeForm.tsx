
import { SectionHeader } from "../shared/SectionHeader";
import { sendEmailwithBrevoSmtpAction } from "./utils/brevo-nodemailer";


interface ContactMeFormProps {

}

export async function ContactMeForm({}:ContactMeFormProps){

return (
  <div
    id="contact"
    className="w-full h-full min-h-screen flex flex-col  
  items-center justify-center   rounded-lg   ">
    <SectionHeader heading="Talk to me" />
    <form
      action={sendEmailwithBrevoSmtpAction}
      className="flex flex-col justify-center items-center gap-3 min-w-[60%] h-fit glass p-5 rounded-xl">
      <div className="w-full flex flex-col gap-1">
        <label htmlFor="sender_name">Name</label>
        <input
          id="sender_name"
          type="text"
          placeholder="name"
          name="sender_name"
          className="input"
        />
      </div>

      <div className="w-full flex flex-col gap-1">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required className="textarea" placeholder="Message" />
      </div>

      <div className="w-full flex flex-col gap-1">
        <label htmlFor="sender_contact" className="text-xs">
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
      <button
        // onClick={(e) => e.preventDefault()}
        type="submit"
        className="btn btn-sm btn-wide">
        Send
      </button>
    </form>
  </div>
);
}
