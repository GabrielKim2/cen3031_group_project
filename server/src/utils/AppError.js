// An error the client is meant to see. Throw one anywhere in a request and the
// error handler turns it into the contract's error body:
//   throw new AppError(409, "That email is already registered.", { email: "..." })
export class AppError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.fields = fields;
  }
}
