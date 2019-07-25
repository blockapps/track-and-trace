
import "/blockapps-sol/dist/collections/hashmap/contracts/Hashmap.sol";
import "./Study.sol";

/**
*
*/

contract StudyManager {
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

    Study study = new Study(
      _studyId
    );
    studies.put(_studyId, study);

    return (201, 0, study);
  }
}
