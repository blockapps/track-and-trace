import "/blockapps-sol/dist/fsm/contracts/FSM.sol";
import "./BidState.sol";
import "./BidEvent.sol";

contract BidFSM is FSM, BidState, BidEvent {
    constructor() {
        addTransition(BidState.ENTERED, BidEvent.ACCEPT, BidState.ACCEPTED);
        addTransition(BidState.ENTERED, BidEvent.REJECT, BidState.REJECTED);
    }

    function handleEvent(BidState _state, BidEvent _event) returns (BidState){
        return BidState(super.handleEvent(uint(_state), uint(_event)));
    }

    function addTransition(BidState _state, BidEvent _event, BidState _newState) {
      super.addTransition(uint(_state), uint(_event), uint(_newState));
    }
}
