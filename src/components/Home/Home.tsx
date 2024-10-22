import { useContext } from "react";
import { SpecContext } from "../../lib/context";
import { Markdown } from "../Markdown";

export function Home() {
  const { spec } = useContext(SpecContext);

  if (!spec) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1>Welcome to Rocket Doc!</h1>
          <p>Please load an OpenAPI 3.1 spec file to continue</p>
        </div>
      </div>);
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">{spec?.info.title ?? "Home"}</h1>
      <Markdown contentMd={spec.info.description} />
    </div >
  )
}
