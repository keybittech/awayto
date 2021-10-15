class ErrorType extends Error {
  constructor(message?: string & unknown) {
    super(message); 
    Object.setPrototypeOf(this, new.target.prototype);
  }


}

export default { ErrorType }