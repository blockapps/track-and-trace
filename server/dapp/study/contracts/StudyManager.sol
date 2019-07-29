
import "/blockapps-sol/dist/collections/hashmap/contracts/Hashmap.sol";
import "/blockapps-sol/dist/rest/contracts/RestStatus.sol";
import "./Study.sol";

/**
*
*/

contract StudyManager is RestStatus {
  Hashmap studies;
  /**
  * Constructor
  */
  constructor () public {
    studies = new Hashmap();
  }

  function createStudy(
    string _studyId
  ) public returns (uint, uint, address) {
    // exists ?
    if (exists(_studyId)) return (RestStatus.BAD_REQUEST, 0, 0);
    // create new
    Study study = new Study(
      _studyId
    );
    studies.put(_studyId, study);
    // created
    return (RestStatus.CREATED, 0, study);
  }

  function exists(string _studyId) public view returns (bool) {
    return studies.contains(_studyId);
  }
}
