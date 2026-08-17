/**
 * Wire schemas for MCP `tools/list` entries surfaced by
 * `GET /api/v1/mcp-servers/{name}/tools`. Models the MCP Tool shape so OpenAPI
 * and the generated SDK expose standard tool fields instead of opaque
 * `Record<string, unknown>` objects.
 *
 * JSON Schema bodies (`inputSchema`/`outputSchema`) and MCP `_meta` are
 * pass-through extension objects: unknown keys are retained on the wire but
 * never validated, matching the MCP spec's forward-compatibility intent.
 */
import { z } from '@hono/zod-openapi';

/** JSON Schema object used for a tool's input or output schema. */
export const McpToolJsonSchemaSchema = z
  .object({
    $schema: z
      .string()
      .optional()
      .describe('JSON Schema dialect identifier, e.g. "https://json-schema.org/draft/2020-12/schema".'),
    type: z.literal('object').describe('MCP tool schemas are objects at the root.'),
    properties: z.record(z.string(), z.unknown()).optional().describe('Named property schemas.'),
    required: z.array(z.string()).optional().describe('Property names that must be present.'),
  })
  .loose()
  .describe('A JSON Schema object constraining a tool parameter or result.')
  .openapi('McpToolJsonSchema');

/** Optional UI/behavior hints MCP servers attach to a tool. */
export const McpToolAnnotationsSchema = z
  .object({
    title: z.string().optional().describe('Human-readable title for the tool.'),
    readOnlyHint: z.boolean().optional().describe('If true, the tool does not modify its environment.'),
    destructiveHint: z.boolean().optional().describe('If true, the tool may perform destructive updates.'),
    idempotentHint: z.boolean().optional().describe('If true, repeating identical calls has no additional effect.'),
    openWorldHint: z
      .boolean()
      .optional()
      .describe('If true, the tool may interact with an open world of external entities.'),
  })
  .loose()
  .describe('Optional hints describing tool behavior (informational only).')
  .openapi('McpToolAnnotations');

/** Execution-related properties for a tool. */
export const McpToolExecutionSchema = z
  .object({
    taskSupport: z
      .enum(['forbidden', 'optional', 'required'])
      .optional()
      .describe('Whether the tool supports task-augmented (long-running) execution.'),
  })
  .loose()
  .describe('Execution-related tool properties.')
  .openapi('McpToolExecution');

/** A sized icon a client can display for a tool. */
export const McpToolIconSchema = z
  .object({
    src: z.string().describe('URI of the icon resource (HTTP(S) or data: URI).'),
    mimeType: z.string().optional().describe('MIME type override, e.g. "image/png".'),
  })
  .loose()
  .describe('A sized icon for a tool.')
  .openapi('McpToolIcon');

/** A tool exposed by an MCP server via `tools/list`. */
export const McpToolSchema = z
  .object({
    name: z.string().describe('Programmatic identifier of the tool.'),
    title: z.string().optional().describe('Human-readable display title.'),
    description: z.string().optional().describe('Human-readable description of what the tool does.'),
    inputSchema: McpToolJsonSchemaSchema,
    outputSchema: McpToolJsonSchemaSchema.optional(),
    annotations: McpToolAnnotationsSchema.optional().describe('Optional behavior hints.'),
    execution: McpToolExecutionSchema.optional().describe('Execution-related properties.'),
    icons: z.array(McpToolIconSchema).optional().describe('Sized icons for the tool.'),
    preload: z.boolean().optional().describe('TrueForge hint: eagerly load this tool for the model.'),
    _meta: z.record(z.string(), z.unknown()).optional().describe('MCP-designated metadata, passed through verbatim.'),
  })
  .loose()
  .describe('A single MCP `tools/list` entry.')
  .openapi('McpTool');

export type McpTool = z.infer<typeof McpToolSchema>;
export type McpToolJsonSchema = z.infer<typeof McpToolJsonSchemaSchema>;
export type McpToolAnnotations = z.infer<typeof McpToolAnnotationsSchema>;
