import "../styles/Contact.css";

function Contact() {
  return (
  <section className="contact-section" id="contact">

    <h2>Contact Us</h2>

    <p>Have questions? We'd love to hear from you.</p>

    <p className="contact-email">
        <strong>Email:</strong> support@decisionhub.com
    </p>

    <form className="contact-form">

        <input
            type="text"
            placeholder="Your Name"
        />

        <input
            type="email"
            placeholder="Your Email"
        />

        <textarea
            placeholder="Your Message"
        ></textarea>

        <button type="submit">
            Send Message
        </button>

    </form>

</section>
  );
}

export default Contact;