class CreateError extends Error {
  code: number;
  message: string;
  privateMessage: string;

  constructor(code: number, publicMessage: string, privateMessage: string) {
    super();

    this.code = code;
    this.message = publicMessage;
    this.privateMessage = privateMessage;
  }
}

export default CreateError;
