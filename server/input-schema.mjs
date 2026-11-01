export const inputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["origin", "destination", "depart", "priority"],
  properties: {
    origin: {
      type: "string",
      enum: ["aurora", "serra", "vale", "campo", "porto", "mar"],
    },
    destination: {
      type: "string",
      enum: ["aurora", "serra", "vale", "campo", "porto", "mar"],
    },
    depart: { type: "integer", minimum: 0, maximum: 1439 },
    priority: { type: "string", enum: ["arrival", "transfers"] },
  },
};
