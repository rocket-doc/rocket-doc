import { CodeEditor, Language } from "@/components/Code/CodeEditor";
import { GenerateExampleStringForSchema } from "@/lib/example";
import { Operation } from "@/lib/operations";
import { GetRef } from "@/lib/ref";
import { Card, Select } from "antd";
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { ExampleObject, OpenAPIObject, RequestBodyObject } from "openapi3-ts/oas31";
import { useEffect, useMemo, useState } from "react";
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';

export type MediaType = string;
export type RequestBody = {
  body: string;
  mediaType: MediaType;
}

type TryItBodyProps = {
  operation: Operation;
  spec: OpenAPIObject | null;
  setBody: (body: RequestBody) => void;
}

export function TryIt_Body({ operation, spec, setBody: setBodyParent }: TryItBodyProps) {
  const operationBody = useMemo(() => {
    if (!operation || !spec || !operation.requestBody) return null;
    return GetRef(operation.requestBody, spec)[0]
  }, [operation, spec]);
  const { bodyMediaType, bodyMediaTypes, setBodyMediaType, hasBody, body, rawBody, setBody } = useMediaTypes(operationBody, spec);
  const bodyLanguage = useBodyHighlightLanguage(bodyMediaType);

  useEffect(() => {
    setBodyParent({ body: rawBody, mediaType: bodyMediaType });
  }, [rawBody, bodyMediaType]);

  if (!hasBody) return null;

  return (
    <Card title="Body" styles={{ body: { padding: "1rem", paddingTop: 0 } }}>
      <div className="relative mr-auto min-w-48">
        <Select
          className="my-2"
          options={bodyMediaTypes.map(mediaType => ({ label: mediaType, value: mediaType, }))}
          defaultValue={bodyMediaTypes[0] ?? ""}
          onChange={(v) => setBodyMediaType(v)}
        />
      </div>
      <div className="max-h-[50vh] overflow-y-auto">
        <CodeEditor code={body} setCode={setBody} language={bodyLanguage} />
      </div>
    </Card>
  )
}

function useBodyHighlightLanguage(bodyMediaType: MediaType | null) {
  const [bodyLanguage, setBodyLanguage] = useState<Language>(Language.PLAIN);

  useEffect(() => {
    setBodyLanguage(mediaTypeToLanguage(bodyMediaType));
  }, [bodyMediaType]);

  return bodyLanguage;
}

function useMediaTypes(
  operationBody: RequestBodyObject | null,
  spec: OpenAPIObject | null,
) {
  const [bodies, setBodies] = useState<Record<MediaType, string>>({});

  const [bodyMediaType, setBodyMediaType] = useState<MediaType>("");
  const [bodyMediaTypes, setBodyMediaTypes] = useState<MediaType[]>([]);
  const [hasBody, setHasBody] = useState(false);
  const [examples, setExamples] = useState<Record<MediaType, Record<string, ExampleObject>>>({});
  const [currentExampleNames, setCurrentExampleNames] = useState<Record<MediaType, string>>({});

  useEffect(() => {
    if (!operationBody || !operationBody.content || Object.keys(operationBody.content).length === 0) {
      setHasBody(false);
      return;
    }

    setHasBody(true);
    let mediaTypes: MediaType[] = Object.keys(operationBody.content);
    setBodyMediaTypes(mediaTypes);
    if (mediaTypes.length > 0 && (!bodyMediaType || !mediaTypes.includes(bodyMediaType))) {
      setBodyMediaType(mediaTypes[0]);
    }
  }, [operationBody, bodyMediaType]);

  useEffect(() => {
    if (!bodyMediaTypes || !spec || !operationBody) {
      setExamples({});
      setCurrentExampleNames({});
      setBodies({});
      return;
    };

    let examples: Record<MediaType, Record<string, ExampleObject>> = {};
    let exampleNames: Record<MediaType, string> = {};
    let bodies: Record<MediaType, string> = {};

    bodyMediaTypes.forEach(mediaType => {
      const type = operationBody.content[mediaType]
      if (!type) return;
      if (type.examples && Object.keys(type.examples).length > 0) {
        examples[mediaType] = Object.fromEntries(
          Object.entries(type.examples).map(([key, example]) => {
            const resolvedExample = GetRef(example, spec)[0]
            return [key, resolvedExample]
          })
        )
        exampleNames[mediaType] = Object.keys(examples[mediaType])[0];
      } else if (type.example) {
        examples[mediaType] = {
          "": {
            value: type.example,
          }
        }
        exampleNames[mediaType] = "";
      } else {
        examples[mediaType] = {
          "": {
            value: GenerateExampleStringForSchema(type.schema, spec, mediaTypeToLanguage(mediaType)),
          }
        }
        exampleNames[mediaType] = "";
      }
      bodies[mediaType] = examples[mediaType][exampleNames[mediaType]].value;
    });
    setExamples(examples);
    setCurrentExampleNames(exampleNames);
    setBodies(bodies);
  }, [bodyMediaTypes, operationBody, spec]);

  return { bodyMediaType, bodyMediaTypes, setBodyMediaType, examples, currentExampleNames, hasBody, body: bodies[bodyMediaType] || "", rawBody: minimize(bodies[bodyMediaType], bodyMediaType), setBody: (body: string) => setBodies({ ...bodies, [bodyMediaType]: body }) };
}

export function mediaTypeToLanguage(mediaType: MediaType | null): Language {
  switch (mediaType) {
    case "application/json":
      return Language.JSON;
    case "application/xml":
      return Language.XML;
    default:
      return Language.PLAIN;
  }
}

function minimize(value: string, mediaType: MediaType): string {
  try {
    switch (mediaType) {
      case "application/json":
        return JSON.stringify(JSON.parse(value));
      case "application/xml":
        return (new XMLBuilder()).build((new XMLParser()).parse(value)) as string;
      case "application/yaml":
      case "application/yml":
      case "application/x-yaml":
      case "text/yaml":
        return stringifyYAML(parseYAML(value));
      default:
        return value;
    }
  } catch {
    return value;
  }
}
