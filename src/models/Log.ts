import { Schema, model, InferSchemaType } from "mongoose";

const logSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    username: { type: String, default: "anonymous" },
    role: { type: String, default: "unknown" },
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number },
    ip: { type: String, default: "unknown" },
    body: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

// 오래된 로그 자동 삭제 (90일 후)
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
logSchema.index({ userId: 1 });
logSchema.index({ createdAt: -1 });

export type ILog = InferSchemaType<typeof logSchema>;

const Log = model<ILog>("Log", logSchema);

export default Log;
