import { McpToolSchema, type McpTool } from '../../../src/schemas/mcpTool';

/** Minimal but representative MCP `tools/list` entry. */
const baseTool = {
  name: 'search',
  description: 'Search the web.',
  inputSchema: {
    type: 'object',
    properties: { query: { type: 'string' } },
    required: ['query'],
  },
};

describe('McpToolSchema', () => {
  it('parses a minimal MCP tool entry', () => {
    const result = McpToolSchema.safeParse(baseTool);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('search');
      expect(result.data.inputSchema.type).toBe('object');
      expect(result.data.inputSchema.required).toEqual(['query']);
    }
  });

  it('preserves JSON Schema extension fields on inputSchema', () => {
    const tool = {
      ...baseTool,
      inputSchema: {
        ...baseTool.inputSchema,
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        additionalProperties: false,
        'x-extension': { custom: true },
      },
    };
    const result = McpToolSchema.safeParse(tool);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inputSchema.$schema).toContain('2020-12');
      expect(result.data.inputSchema['x-extension']).toEqual({ custom: true });
    }
  });

  it('preserves _meta verbatim and exposes it on the typed result', () => {
    const tool: unknown = { ...baseTool, _meta: { cursor: 'abc', custom: [1, 2, 3] } };
    const result = McpToolSchema.safeParse(tool);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data._meta).toEqual({ cursor: 'abc', custom: [1, 2, 3] });
    }
  });

  it('accepts annotations, execution, icons, outputSchema, and preload', () => {
    const tool: unknown = {
      ...baseTool,
      title: 'Web Search',
      outputSchema: {
        type: 'object',
        properties: { title: { type: 'string' } },
      },
      annotations: {
        title: 'Web Search',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      execution: { taskSupport: 'optional' },
      icons: [{ src: 'data:image/png;base64,abc', mimeType: 'image/png' }],
      preload: true,
    };
    const result = McpToolSchema.safeParse(tool);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Web Search');
      expect(result.data.outputSchema?.type).toBe('object');
      expect(result.data.annotations?.readOnlyHint).toBe(true);
      expect(result.data.execution?.taskSupport).toBe('optional');
      expect(result.data.icons?.[0]?.src).toContain('data:image/png');
      expect(result.data.preload).toBe(true);
    }
  });

  it('accepts unknown top-level extension properties (forward compatibility)', () => {
    const result = McpToolSchema.safeParse({ ...baseTool, 'x-unknown': { any: 'thing' } });
    expect(result.success).toBe(true);
  });

  it('rejects a tool without a required name', () => {
    const result = McpToolSchema.safeParse({ description: 'no name', inputSchema: baseTool.inputSchema });
    expect(result.success).toBe(false);
  });

  it('rejects a tool with a non-object inputSchema', () => {
    const result = McpToolSchema.safeParse({ ...baseTool, inputSchema: { type: 'array' } });
    expect(result.success).toBe(false);
  });

  it('types the produced value as McpTool', () => {
    const parsed = McpToolSchema.parse(baseTool);
    const tool: McpTool = parsed;
    expect(tool.name).toBe('search');
  });
});
