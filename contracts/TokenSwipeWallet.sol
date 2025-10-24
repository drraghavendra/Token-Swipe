// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract TokenSwipeWallet {
    using ECDSA for bytes32;
    
    address public owner;
    uint256 public nonce;
    mapping(address => bool) public authorizedRelayers;
    
    event TransactionExecuted(
        address indexed to,
        uint256 value,
        bytes data,
        bool success
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyRelayer() {
        require(authorizedRelayers[msg.sender], "Unauthorized relayer");
        _;
    }
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        bytes calldata signature
    ) external onlyRelayer returns (bool success) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                to,
                value,
                data,
                nonce,
                block.chainid
            )
        );
        
        address signer = hash.toEthSignedMessageHash().recover(signature);
        require(signer == owner, "Invalid signature");
        
        nonce++;
        
        (success, ) = to.call{value: value}(data);
        emit TransactionExecuted(to, value, data, success);
    }
    
    function addRelayer(address relayer) external onlyOwner {
        authorizedRelayers[relayer] = true;
    }
    
    function removeRelayer(address relayer) external onlyOwner {
        authorizedRelayers[relayer] = false;
    }
    
    function withdrawERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }
    
    receive() external payable {}
}