import { IUser } from "@app/shared-types";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}