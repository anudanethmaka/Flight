import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  message: string;
  type: string;
  createdAt: Date;
  isRead: boolean;
  emailSimulated: boolean;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  emailSimulated: { type: Boolean, default: true }
});

export const Notification = model<INotification>('Notification', NotificationSchema);
