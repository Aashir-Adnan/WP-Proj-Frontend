export async function generateHTMLPage(phrase) {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const res = await fetch(baseUrl + "/api/gen/code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phrase })
    });

    if (!res.ok) throw new Error("Failed to fetch HTML page");

    const data = await res.json();
    console.log("API Response Data:", data);

    if (data?.payload?.return?.success) {
      return data.payload.return.html.replace(/^```html\s*/, '').replace(/```$/, '');
    }

  } catch (err) {
    console.error("Error generating HTML page:", err);
    return "";
  }
}
