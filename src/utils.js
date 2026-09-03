import { redirect } from "react-router-dom";

// export async function requireAuth() {
//   console.log("requireAuth running");

//   const isLoggedIn = false;

//   return { isLoggedIn };
// }

export async function requireAuth() {
  const isLoggedIn = localStorage.getItem("loggedIn")
  console.log(isLoggedIn);
  

  if (!isLoggedIn) {
    const response = redirect("/login?message=You must login first");
    response.body = true;
    throw response;
  }

  return null;
}