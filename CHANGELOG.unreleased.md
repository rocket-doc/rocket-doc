# Unreleased

 - Added support for OpenAPI 3.1 webhooks, with their own sidebar section and routes
 - Added path level parameters & servers inheritance, and server variables in "Try it"
 - Added response headers rendering
 - Added a "Security keys" page sharing credential profiles with "Try it"
 - Added a standalone browser bundle embedding React (`dist/index.standalone.umd.js`)
 - Added a detailed OpenAPI support map in README.md
 - Added unit tests (Vitest) and a GitHub Actions CI running lint, typecheck, test and build
 - Updated the UI with a modern sidebar, method badges and a responsive mobile layout
 - Fixed YAML specifications loaded from a URL not being parsed
 - Fixed `$ref` resolution for JSON pointer escaping, chained and circular references
