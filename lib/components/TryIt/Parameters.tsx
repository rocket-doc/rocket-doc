import { CodeEditor, Language } from "@/components/Code/CodeEditor";
import { GenerateExampleStringForSchema } from "@/lib/example";
import { GetRef } from "@/lib/ref";
import { Checkbox, Input, Select, Table } from "antd";
import { OpenAPIObject, OperationObject, ParameterObject, SchemaObject, SchemaObjectType } from "openapi3-ts/oas31";
import { useEffect, useMemo, useState } from "react";

export type RequestParam = {
  name: string;
  value: string;
  location: "query" | "header" | "path" | "cookie";
  mediaType?: string;
}

type TryItParamsProps = {
  operation: OperationObject | null;
  spec: OpenAPIObject | null;
  setParams: (params: RequestParam[]) => void;
}

export function TryIt_Parameters({ operation, spec, setParams: setParentParams }: TryItParamsProps) {
  const operationParameters = useMemo(() => {
    if (!operation || !spec || !operation.parameters) return null;
    return operation.parameters.map(p => GetRef(p, spec)[0]);
  }, [operation, spec]);

  const [params, setParams] = useState<Record<string, RequestParam>>({});
  useEffect(() => {
    setParams({});
  }, [operationParameters]);


  useEffect(() => {
    setParentParams(Object.values(params));
  }, [params]);

  if (!operationParameters || !spec) return null;
  return <Table<ParameterObject>
    pagination={false}
    columns={[
      {
        title: 'Parameter',
        dataIndex: 'name',
        key: 'name',
        render: (_, param) => <span>{param.name}</span>
      },
      {
        title: 'Value',
        dataIndex: 'schema',
        key: 'schema',
        render: (_, param) => param.schema ?
          <TryIt_Parameter parameter={param} spec={spec} setParam={(paramValue) => setParams({ ...params, [param.name + "__" + param.in]: paramValue })} /> :
          <TryIt_ParameterWithMediaTypes parameter={param} spec={spec} setParam={(paramValue) => setParams({ ...params, [param.name + "__" + param.in]: paramValue })} />
      }
    ]} dataSource={operationParameters.map(p => ({ key: p.name, ...p }))} />
}

type TryItParameterProps = {
  parameter: ParameterObject;
  spec: OpenAPIObject;
  setParam: (param: RequestParam) => void;
}

function TryIt_Parameter({ parameter, spec, setParam }: TryItParameterProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setParam({ name: parameter.name, value, location: parameter.in });
  }, [value]);

  const schema = useMemo(() => {
    if (!parameter.schema) return null;
    return GetRef(parameter.schema, spec)[0];
  }, [parameter, spec]);

  useEffect(() => {
    if (schema?.type !== "object") setValue(parameter.example?.toString() || "");
    else setValue(GenerateExampleStringForSchema(schema, spec, Language.JSON))
  }, [schema, parameter]);

  if (!schema || schema.type === "null") return null;
  return <Editor type={schema.type || "string"} value={value} setValue={setValue} />
}

function TryIt_ParameterWithMediaTypes({ parameter, spec, setParam }: TryItParameterProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [mediaType, setMediaType] = useState("");

  useEffect(() => {
    setParam({ name: parameter.name, value: values[mediaType] ?? "", location: parameter.in });
  }, [values, mediaType, parameter]);

  const schemas = useMemo(() => {
    if (!parameter.content) return null;
    return Object.fromEntries(
      Object.entries(parameter.content).map(([mediaType, content]) => { return [mediaType, GetRef(content.schema, spec)[0]] }).filter(([_, schema]) => schema)
    ) as Record<string, SchemaObject>;
  }, [parameter, spec]);

  useEffect(() => {
    if (schemas && Object.keys(schemas).length > 0) {
      setMediaType(Object.keys(schemas)[0]);
      let values: Record<string, any> = {};
      Object.entries(schemas).forEach(([mediaType, schema]) => {
        values[mediaType] = GenerateExampleStringForSchema(schema, spec, Language.JSON)
      });
      setValues(values);
    }
  }, [schemas]);

  if (!schemas || Object.keys(schemas).length === 0) return null;
  return (<>
    <div className="relative mr-auto min-w-48">
      <Select defaultValue={Object.keys(schemas)[0]} onChange={(v) => setMediaType(v)} options={Object.keys(schemas).map((mediaType) => (
        { label: mediaType, value: mediaType }
      ))} />
      <Editor type={schemas[mediaType]?.type || "string"} value={values[mediaType] ?? ""} setValue={(v) => setValues({ ...values, [mediaType]: v })} />
    </div>
  </>)
}

type EditorProps = {
  type: SchemaObjectType | SchemaObjectType[] | undefined;
  value: any;
  setValue: (value: any) => void;
}

function Editor({ type, value, setValue }: EditorProps) {
  switch (type) {
    case "string":
      return <Input placeholder="string" type="text" value={value} onChange={(e) => setValue(e.target.value)} />;
    case "number":
    case "integer":
      return <Input placeholder="number" type="number" value={value} onChange={(e) => setValue(e.target.value)} />;
    case "boolean":
      return <Checkbox checked={value} onChange={(e) => setValue(e.target.checked)} />;
    case "object":
      return <CodeEditor code={value || ""} setCode={(v) => setValue(v)} language={Language.JSON} />;
    default:
      return <Input placeholder={""} type="text" value={value} onChange={(e) => setValue(e.target.value)} />;
  }
}
