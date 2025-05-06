type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  messages: {
    role: string;
    content: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type { User };
