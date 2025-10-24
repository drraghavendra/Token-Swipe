// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapV2Router {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(
        uint amountIn, 
        address[] calldata path
    ) external view returns (uint[] memory amounts);
}

contract TokenSwipeRouter is ReentrancyGuard, Ownable {
    address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    address public platformFeeReceiver;
    uint256 public platformFeePercent = 100; // 1% in basis points
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    mapping(address => bool) public supportedDEXs;
    mapping(address => bool) public approvedTokens;
    
    event TokenSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
    );
    
    event PlatformFeeUpdated(uint256 newFeePercent);
    event DEXAdded(address indexed dex);
    event DEXRemoved(address indexed dex);
    
    constructor(address _feeReceiver) {
        platformFeeReceiver = _feeReceiver;
        _transferOwnership(_feeReceiver);
    }
    
    function swapExactETHForTokens(
        address dexRouter,
        address tokenOut,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant returns (uint[] memory amounts) {
        require(supportedDEXs[dexRouter], "DEX not supported");
        require(approvedTokens[tokenOut], "Token not approved");
        require(msg.value > 0, "Must send ETH");
        
        // Calculate platform fee
        uint256 feeAmount = (msg.value * platformFeePercent) / FEE_DENOMINATOR;
        uint256 swapAmount = msg.value - feeAmount;
        
        // Transfer fee to platform
        (bool feeSuccess, ) = platformFeeReceiver.call{value: feeAmount}("");
        require(feeSuccess, "Fee transfer failed");
        
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = tokenOut;
        
        // Execute swap
        amounts = IUniswapV2Router(dexRouter).swapExactETHForTokens{value: swapAmount}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        
        emit TokenSwapped(
            msg.sender,
            ETH,
            tokenOut,
            msg.value,
            amounts[amounts.length - 1],
            feeAmount
        );
    }
    
    function swapExactTokensForETH(
        address dexRouter,
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant returns (uint[] memory amounts) {
        require(supportedDEXs[dexRouter], "DEX not supported");
        require(approvedTokens[tokenIn], "Token not approved");
        require(amountIn > 0, "Amount must be positive");
        
        // Transfer tokens from user
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate platform fee
        uint256 feeAmount = (amountIn * platformFeePercent) / FEE_DENOMINATOR;
        uint256 swapAmount = amountIn - feeAmount;
        
        // Transfer fee to platform
        IERC20(tokenIn).transfer(platformFeeReceiver, feeAmount);
        
        // Approve DEX to spend tokens
        IERC20(tokenIn).approve(dexRouter, swapAmount);
        
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = WETH;
        
        // Execute swap
        amounts = IUniswapV2Router(dexRouter).swapExactTokensForETH(
            swapAmount,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        
        emit TokenSwapped(
            msg.sender,
            tokenIn,
            ETH,
            amountIn,
            amounts[amounts.length - 1],
            feeAmount
        );
    }
    
    function getSwapQuote(
        address dexRouter,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 feeAmount) {
        require(supportedDEXs[dexRouter], "DEX not supported");
        
        address[] memory path = new address[](2);
        path[0] = tokenIn == ETH ? WETH : tokenIn;
        path[1] = tokenOut == ETH ? WETH : tokenOut;
        
        uint256[] memory amounts = IUniswapV2Router(dexRouter).getAmountsOut(amountIn, path);
        amountOut = amounts[amounts.length - 1];
        
        if (tokenIn == ETH) {
            feeAmount = (amountIn * platformFeePercent) / FEE_DENOMINATOR;
            amountOut = IUniswapV2Router(dexRouter).getAmountsOut(amountIn - feeAmount, path)[1];
        } else {
            feeAmount = (amountIn * platformFeePercent) / FEE_DENOMINATOR;
        }
    }
    
    // Admin functions
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 500, "Fee too high"); // Max 5%
        platformFeePercent = _feePercent;
        emit PlatformFeeUpdated(_feePercent);
    }
    
    function addDEX(address _dex) external onlyOwner {
        supportedDEXs[_dex] = true;
        emit DEXAdded(_dex);
    }
    
    function removeDEX(address _dex) external onlyOwner {
        supportedDEXs[_dex] = false;
        emit DEXRemoved(_dex);
    }
    
    function approveToken(address _token) external onlyOwner {
        approvedTokens[_token] = true;
    }
    
    function revokeToken(address _token) external onlyOwner {
        approvedTokens[_token] = false;
    }
    
    function withdrawFees(address _token) external onlyOwner {
        if (_token == ETH) {
            uint256 balance = address(this).balance;
            (bool success, ) = platformFeeReceiver.call{value: balance}("");
            require(success, "ETH transfer failed");
        } else {
            uint256 balance = IERC20(_token).balanceOf(address(this));
            IERC20(_token).transfer(platformFeeReceiver, balance);
        }
    }
    
    receive() external payable {}
}