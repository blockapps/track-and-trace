import "/blockapps-sol/fsm/contracts/FSM.sol";
import "./AssetState.sol";
import "./AssetEvent.sol";

contract AssetFSM is FSM, AssetState, AssetEvent {
    constructor() {
        addTransition(CREATED, REQUEST_BIDS, BID_REQUESTED);
        addTransition(BIDS_REQUESTED, CHANGE_OWNER, OWNER_UPDATED);
    }

    function handleEvent(AssetState _state, AssetEvent _event) returns (AssetState){
        return AssetState(super.handleEvent(uint(_state), uint(_event)));
    }

    function addTransition(AssetState _state, AssetEvent _event, AssetState _newState) {
      super.addTransition(uint(_state), uint(_event), uint(_newState));
    }
}
