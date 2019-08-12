/*
 * FileTransaction
 */

contract FileTransaction {

    string public fileTransactionId;
    string public externalStorageAddress;
    string public category;
    string public access;
    string public fileName;
    string public dateTime;
    string public uploadedBy;
    string public uploadedTo;
    string public acceptedBy;
    string public verified;

    constructor(
        string _fileTransactionId,
        string _externalStorageAddress,
        string _category,
        string _access,
        string _fileName
    ) {
        fileTransactionId = _fileTransactionId;
        externalStorageAddress = _externalStorageAddress;
        category = _category;
        access = _access;
        fileName = _fileName;
    }

    function setDetails (
        string _dateTime,
        string _uploadedBy,
        string _uploadedTo,
        string _acceptedBy,
        string _verified
    ) {
        dateTime = _dateTime;
        uploadedBy = _uploadedBy;
        uploadedTo = _uploadedTo;
        acceptedBy = _acceptedBy;
        verified = _verified;
    }
}


