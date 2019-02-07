contract BidGovernance {
  // The party initiating the bid
  address owner;

  event MemberAdded(address addr, string enode);
  event MemberRemoved(address addr);

  constructor() {
    owner = msg.sender;
  }

  function addMember(address _member, string _enode) public {
    assert(msg.sender == owner);
    emit MemberAdded(_member, _enode);
  }

  function removeChainMember(address _member) public {
    assert(msg.sender == owner);
    emit MemberRemoved(_member);
  }
}