export interface NotificationReceived {
  createdAt: string;
  delivered: boolean;
  delivered_at: null | string;
  _id: string;
  message: string;
  read: boolean;
  read_at: null | string;
  title: string;
  type: string;
  updatedAt: string;
  user_id: string;
  __v?: number;
}


export interface NotificationSocketEvent {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  delivered: boolean;
  delivered_at: null | string;
  read: boolean;
  read_at: null | string;
  createdAt: string;
  updatedAt: string;
}
