import * as msal from "@azure/msal-browser";
import store from "@/store";

// --- Azure AD App Config ---
const TENANT_ID = "893c3206-7236-4ab1-82b5-d8d51b82ac12";
const CLIENT_ID = "b3aed150-5011-4b6f-9143-77658825ab99";

// --- Default Headers for SharePoint API ---
const headers = {
  Authorization: null,
  "X-RequestDigest": null,
  "Content-Type": "application/json;odata=verbose",
  "If-Match": "*",
  Accept: "application/json;odata=nometadata",
};

const useLocalStorage = false;

// --- Acquire and store access token ---
export async function loadAccessToken() {
  headers.Authorization = window.localStorage.getItem("Authorization");

  if (useLocalStorage) return;

  // MSAL instance for Azure AD authentication
  const msalInstance = new msal.PublicClientApplication({
    auth: {
      clientId: CLIENT_ID,
      authority: "https://login.microsoftonline.com/" + TENANT_ID,
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  });

  await msalInstance.initialize();

  // Login and get access token
  const { tokenType, accessToken } = await msalInstance.loginPopup({
    scopes: ["https://e1aoa.sharepoint.com/.default"],
  });

  headers.Authorization = tokenType + " " + accessToken;
  window.localStorage.setItem("Authorization", headers.Authorization);
}

// --- Get SharePoint request digest and user info ---
export async function loadRequestDigest() {
  // Get request digest for SharePoint API
  const res = await fetch(
    "https://e1aoa.sharepoint.com/sites/ProjectHub/_api/contextinfo",
    { method: "POST", headers }
  );
  const data = await res.json();

  if (data.error_description) {
    throw new Error(data.error_description);
  }

  headers["X-RequestDigest"] = data.FormDigestValue;

  // Fetch current user and commit to store
  (async function getCurrentUser() {
    const res = await fetch(
      "https://e1aoa.sharepoint.com/sites/ProjectHub/_api/web/currentuser",
      { method: "GET", headers }
    );
    store.commit("setUser", await res.json());
  })();

  // Fetch all site users and commit to store
  (async function getSiteusers() {
    const res = await fetch(
      "https://e1aoa.sharepoint.com/sites/ProjectHub/_api/web/siteusers",
      { method: "GET", headers }
    );
    const data = await res.json();
    store.commit(
      "setSiteUsers",
      data.value.filter((it) => it.PrincipalType == 1 && it.Email)
    );
  })();
}

// --- General-purpose SharePoint API request ---
export async function httpsRequest(method, list, details = null, body = null) {
  const res = await fetch(
    `https://e1aoa.sharepoint.com/sites/ProjectHub/_api/web/lists/getbytitle` +
      `('${list}')` +
      `/items` +
      (details || ""),
    {
      method,
      headers,
      body: body && window.JSON.stringify(body),
    }
  );

  if (res.status == 401) {
    alert("Unauthorized");
    return window.location.reload();
  }

  // No response body for MERGE or DELETE
  if (method == "MERGE" || method == "DELETE") return;

  const data = await res.json();

  console.log(method, list, "\n", details, "\n", data);

  return method == "GET" ? data.value : data;
}
