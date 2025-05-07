type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  messages: Message[];
  records: Record[];
  createdAt: string;
  updatedAt: string;
};

export type Record = {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  createdAt: string;
};

export type Message = {
  role: string;
  content: string;
  image?: string;
};
export type { User };
