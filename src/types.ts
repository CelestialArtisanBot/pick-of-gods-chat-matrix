export interface RequestWithBody {
  messages: { role: string; content: string }[];
  generateImage?: boolean;
}

export interface ChatResponse {
  messages: { role: string; content: string }[];
}
