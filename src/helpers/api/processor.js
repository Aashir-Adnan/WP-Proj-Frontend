
import axios from "axios";
import { encryptObject, decryptObject } from "../../../SysFunctions/Encryption/aes.js";


const platformKeys = {
  publicKey: import.meta.env.PUBLIC_KEY,
  privateKey: import.meta.env.PRIVATE_KEY
};



export const buildEncryptedPayload = (body) => {
  return {
    reqData: encryptObject(body, platformKeys.privateKey),
    encryptionDetails: {
      PlatformName: "Web App",
      PlatformVersion: "1.0",
    }
  };
};

export const encryptedApiCall = async (method, url, body = {}) => {
  try {
    const encryptedRequest = encryptObject(
      buildEncryptedPayload(body),
      platformKeys.publicKey
    );

    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        "accesstoken": accessToken
      },
      data: { encryptedRequest }
    };

    console.log(`\n=== Sending ${method} request ===`);
    console.log("Config:", JSON.stringify(config, null, 2));

    const res = await axios(config);

    console.log(`\n${method} Response:`, JSON.stringify(res.data, null, 2));

    return decryptObject(
      res.data.payload,
      accessToken + platformKeys.privateKey
    );

  } catch (err) {
    console.error(`\n${method} Error:`, err.response?.data || err.message);
    throw err;
  }
};

