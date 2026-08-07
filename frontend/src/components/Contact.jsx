function Contact() {
  return (
    <section id="contact" className="contact">
      <h2>Contact Us</h2>
      <p>Have questions? We'd love to hear from you.</p>

      <div className="contact-box">
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <textarea placeholder="Your Message"></textarea>
        <button>Send Message</button>
      </div>
    </section>
  );
}

export default Contact;