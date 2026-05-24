import React from "react";

export const Contact = () => {
  return (
    <div className="page-container" style={{ maxWidth: "760px" }}>
      <section aria-labelledby="title" className="negotiation-card">
        <h1 id="title" className="page-title">
          Contact
        </h1>
        <p className="page-subtitle">Thông tin liên hệ hỗ trợ khách hàng.</p>

        <address style={{ fontStyle: "normal", marginBottom: "24px" }}>
          One Microsoft Way
          <br />
          Redmond, WA 98052-6399
          <br />
          <abbr title="Phone">P:</abbr> 425.555.0100
        </address>

        <address style={{ fontStyle: "normal" }}>
          <strong>Support:</strong>{" "}
          <a href="mailto:Support@example.com">Support@example.com</a>
          <br />
          <strong>Marketing:</strong>{" "}
          <a href="mailto:Marketing@example.com">Marketing@example.com</a>
        </address>
      </section>
    </div>
  );
};
