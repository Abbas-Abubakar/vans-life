import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  console.log("ERROR PAGE RECEIVED:", error);
  console.log("instanceof Response?", error instanceof Response);
  console.log("full error object:", error);

  return (
    <div>
      <h1>Error: {error.message}</h1>
    </div>
  );
}