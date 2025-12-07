import { useSelector } from "react-redux";

export default function Schro() {
  const code = useSelector((s) => s.generatedPage.code);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;

  return (
    <iframe
      srcDoc={html}
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
