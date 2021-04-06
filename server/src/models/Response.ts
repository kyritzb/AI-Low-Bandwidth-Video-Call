/**
 * Response Object
 * @param {Boolean} isSuccess if the request was succesful
 * @param {String} errorName the kind of error the server had
 * @param {Object} payload the dta to be returned
 */
export default class Response {
  public isSuccess: Boolean;
  public errorName: String;
  public payload: Object;

  constructor(isSuccess: Boolean, errorName: String, payload: Object) {
    this.isSuccess = isSuccess;
    this.errorName = errorName;
    this.payload = payload;
  }
}
