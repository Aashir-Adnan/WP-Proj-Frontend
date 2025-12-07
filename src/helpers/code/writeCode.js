import { generateHTMLPage } from "./genCode.js";
import { store } from "../store/store.js";
import { setCode } from "./genCodeSlice.js";

export async function writeCode(phrase) {
  try {
    const html = await generateHTMLPage(phrase);

    store.dispatch(setCode({code: html, title: phrase}));

    console.log("Generated HTML stored in Redux state: ", html);
    return {html, success: true};
  } catch (err) {
    console.error("Error generating HTML:", err.message);
  }
}
