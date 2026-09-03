import { redirect } from "react-router-dom";

// export async function requireAuth() {
//   console.log("requireAuth running");

//   const isLoggedIn = false;

//   return { isLoggedIn };
// }

export async function requireAuth(request) {
  const isLoggedIn = JSON.parse(localStorage.getItem("loggedIn"))

  if (!isLoggedIn) {
    const pathname = request.url.pathname;
    
    const response = redirect(`/login?message=You must login first&redirectTo=${pathname}`);
    response.body = true;
    throw response;
  }

  return null;
}