import { ComponentType } from "react";
import { useRouteError } from "react-router-dom";

type ErrorProps = {
  title?: string;
  message?: string;
};
export function Error({ title, message }: ErrorProps) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1>{title || "An error occured!"}</h1>
        {message && <p>{message}</p>}
      </div>
    </div>);
}

export let ErrorBoundary: ComponentType = () => {
  const error = useRouteError();
  if (!error) return null;
  return <Error message={error.toString()} />
}
