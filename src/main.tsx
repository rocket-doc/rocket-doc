import RocketDoc from '@/RocketDoc/RocketDoc'
import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RocketDoc
      specUrl='https://petstore3.swagger.io/api/v3/openapi.json'
      config={{
        defaultExpandedDepth: 2,
        routerType: "hash"
      }}
    />
  </React.StrictMode>,
)
