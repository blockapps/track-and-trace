
import "/blockapps-sol/dist/collections/hashmap/contracts/Hashmap.sol";
import "/blockapps-sol/dist/rest/contracts/RestStatus.sol";
import "./FileTransaction.sol";

contract FileTransactionManager is RestStatus {
    Hashmap fileTransactions;

    //Constructor
    constructor () public {
        fileTransactions = new Hashmap();
    }

    function createFileTransaction(
        string _fileTransactionId,
        string _externalStorageAddress,
        string _category,
        string _access,
        string _fileName
    ) public returns (uint, uint, address) {
        // exists ?
        if (exists(_fileTransactionId)) return (RestStatus.BAD_REQUEST, 0, 0);
        // create new
        FileTransaction fileTransaction = new FileTransaction(
            _fileTransactionId,
            _externalStorageAddress,
            _category,
            _access,
            _fileName
        );
        fileTransactions.put(_fileTransactionId, fileTransaction);
        // created
        return (RestStatus.CREATED, 0, fileTransaction);
    }

    function setDetails(
        string _fileTransactionId,
        string _dateTime,
        string _uploadedBy,
        string _uploadedTo,
        string _acceptedBy,
        string _verified
    ) public returns (uint, uint, address) {
        // exists ?
        if (!exists(_fileTransactionId)) return (RestStatus.NOT_FOUND, 0, 0);
        // get the contract
        FileTransaction fileTransaction = FileTransaction(fileTransactions.get(_fileTransactionId));
        // set details
        fileTransaction.setDetails(
            _dateTime,
            _uploadedBy,
            _uploadedTo,
            _acceptedBy,
            _verified);
        return (RestStatus.OK, 0, fileTransaction);
    }

    function exists(string _fileTransactionId) public view returns (bool) {
        return fileTransactions.contains(_fileTransactionId);
    }
}
