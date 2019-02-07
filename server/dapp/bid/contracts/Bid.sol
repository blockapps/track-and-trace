import "/blockapps-sol/rest/contracts/RestStatus.sol";

import './BidFSM.sol';
import './BidState.sol';
import './BidEvent.sol';

contract Bid is BidState, BidEvent, RestStatus {

  BidFSM bidFSM;
  address assetOwner;
  address initiator;
  address asset;
  BidState bidState;
  uint value;

  constructor(address _asset, address _assetOwner, uint _value) {
    asset = _asset;
    assetOwner = _assetOwner;
    initiator = msg.sender;
    bidFSM = new BidFSM(); 
    bidState = BidState.ENTERED;
    value = _value;
  }

  function handleBidEvent(BidEvent _bidEvent) public returns (uint, BidState) {
    if(msg.sender != assetOwner) {
      return (RestStatus.FORBIDDEN, BidState.NULL)
    }
    
    BidState newState = bidFSM.handleEvent(bidState, _bidEvent);

    if(newState == BidState.NULL) {
      return (RestStatus.BAD_REQUEST, BidState.NULL);
    }

    bidState = newState;

    return (RestStatus.OK, bidState);
  }



}