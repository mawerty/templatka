import { defineConfig } from "@openapi-codegen/cli";
import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from "@openapi-codegen/typescript";

export default defineConfig({
  api: {
    from: {
      source: "url",
      url: "http://localhost:8000/openapi.json",
    },
    outputDir: "frontend/src/api",
    to: async (context) => {
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix: "api",
      });
      await generateReactQueryComponents(context, {
        filenamePrefix: "api",
        schemasFiles,
      });
    },
  },
});

