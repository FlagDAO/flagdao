// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Kangaroo is Initializable, UUPSUpgradeable, ERC1155Upgradeable, OwnableUpgradeable {
    mapping(uint256 => string) public tokenURI;
    uint256 public tokenId;
    uint256 public KangarooCount;

    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public{
        __ERC1155_init("");
        __Ownable_init(address(msg.sender));
        __UUPSUpgradeable_init();
    }

    function mint(uint256 amount, string memory _tokenURI, bool isKangaroo, bytes memory data)
        public
        returns(uint256)
    {
        uint256 _tokenId = tokenId;
        tokenURI[_tokenId] = _tokenURI;
        _mint(msg.sender, _tokenId, amount, data);
        tokenId++;
        if(isKangaroo){
            KangarooCount++;
        }
        return _tokenId;
    }

    function uri(uint256 _tokenId) public view override returns(string memory) {
	    return tokenURI[_tokenId];
    }

    function _authorizeUpgrade(address _newImplementation) internal override onlyOwner {}
}