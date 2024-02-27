import { AxiosError } from 'axios';
import { toast } from 'sonner';

export function normalizeError(error: unknown) {
  const err = error as AxiosError;

  if (err.response) {
    const { message } = err.response?.data as { message: string | string[] };

    if (Array.isArray(message)) {
      message.map((msg) => toast.error(msg));
      return;
    }

    toast.error(message);
  } else {
    toast.error(err.message);
  }
}
