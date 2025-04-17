// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract XEAMToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    uint256 public INITIAL_SUPPLY;
    uint256 public MAX_WALLET;
    uint256 public MAX_TX;

    uint256 public buyTax;
    uint256 public sellTax;

    address public encouragementFund;
    address public marketingWallet;
    address public stakingWallet;
    address public emergencyFund;
    address public uniswapPair;

    mapping(address => bool) public isExcludedFromFees;

    IUniswapV2Router02 public uniswapRouter;
    bool private swapping;
    uint256 public swapTokensAtAmount;

    event TaxDistributed(uint256 amount, string category);
    event UniswapPairUpdated(address newPair);
    event TaxesUpdated(uint256 newBuyTax, uint256 newSellTax);
    event LPFundsWithdrawn(uint256 amount);

    function initialize(
        address _encouragementFund,
        address _marketingWallet,
        address _stakingWallet,
        address _emergencyFund,
        address _initialUniswapPair,
        address _router
    ) public initializer {
        __ERC20_init("XEAM Token", "XEAM");
        __Ownable_init(msg.sender); // sets the deployer as the initial owner
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        INITIAL_SUPPLY = 500_000_000_000_000 * 10**18;
        MAX_WALLET = (INITIAL_SUPPLY * 1) / 100;
        MAX_TX = (INITIAL_SUPPLY * 1) / 1000;
        buyTax = 2;
        sellTax = 2;
        swapTokensAtAmount = 1_000_000 * 10**18;

        encouragementFund = _encouragementFund;
        marketingWallet = _marketingWallet;
        stakingWallet = _stakingWallet;
        emergencyFund = _emergencyFund;
        uniswapPair = _initialUniswapPair;
        uniswapRouter = IUniswapV2Router02(_router);

        _mint(msg.sender, INITIAL_SUPPLY);
        isExcludedFromFees[msg.sender] = true;
    }

    function transfer(address recipient, uint256 amount) public override whenNotPaused returns (bool) {
        _applyTransferLimits(_msgSender(), recipient, amount);
        _transferWithTaxes(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override whenNotPaused returns (bool) {
        _applyTransferLimits(sender, recipient, amount);
        _transferWithTaxes(sender, recipient, amount);
        _spendAllowance(sender, _msgSender(), amount);
        return true;
    }

    function _applyTransferLimits(address sender, address recipient, uint256 amount) internal view {
        if (!isExcludedFromFees[sender]) {
            require(balanceOf(recipient) + amount <= MAX_WALLET, "Exceeds max wallet limit");
            require(amount <= MAX_TX, "Exceeds max transaction limit");
        }
    }

    function _transferWithTaxes(address sender, address recipient, uint256 amount) internal {
        uint256 tax = (amount * ((recipient == uniswapPair) ? sellTax : buyTax)) / 100;
        require(amount >= tax, "Tax exceeds transfer amount");

        uint256 netAmount = amount - tax;

        uint256 encouragementShare = (tax * 25) / 100;
        uint256 stakingShare = (tax * 20) / 100;
        uint256 marketingShare = (tax * 20) / 100;
        uint256 emergencyShare = (tax * 15) / 100;
        uint256 lpShare = (tax * 20) / 100;

        _transfer(sender, encouragementFund, encouragementShare);
        emit TaxDistributed(encouragementShare, "Encouragement Fund");

        _transfer(sender, stakingWallet, stakingShare);
        emit TaxDistributed(stakingShare, "Staking");

        _transfer(sender, marketingWallet, marketingShare);
        emit TaxDistributed(marketingShare, "Marketing");

        _transfer(sender, emergencyFund, emergencyShare);
        emit TaxDistributed(emergencyShare, "Emergency Fund");

        _transfer(sender, address(this), lpShare);
        emit TaxDistributed(lpShare, "Liquidity Pool");

        _transfer(sender, recipient, netAmount);

        uint256 contractBalance = balanceOf(address(this));
        bool canSwap = contractBalance >= swapTokensAtAmount;

        if (canSwap && !swapping && sender != uniswapPair) {
            swapping = true;
            swapAndLiquify(swapTokensAtAmount);
            swapping = false;
        }
    }

    function swapAndLiquify(uint256 tokens) private {
        uint256 half = tokens / 2;
        uint256 otherHalf = tokens - half;
        uint256 initialBalance = address(this).balance;

        swapTokensForEth(half);
        uint256 newBalance = address(this).balance - initialBalance;

        addLiquidity(otherHalf, newBalance);
    }

    function swapTokensForEth(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapRouter.WETH();

        _approve(address(this), address(uniswapRouter), tokenAmount);

        uniswapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            address(this),
            block.timestamp
        );
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
        _approve(address(this), address(uniswapRouter), tokenAmount);

        uniswapRouter.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0,
            0,
            owner(),
            block.timestamp
        );
    }

    function withdrawLPFunds() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        require(balance > 0, "No LP funds available");
        _transfer(address(this), owner(), balance);
        emit LPFundsWithdrawn(balance);
    }

    function updateExcludedAccountStatus(address account, bool excluded) external onlyOwner {
        isExcludedFromFees[account] = excluded;
    }

    function updateUniswapPair(address newPair) external onlyOwner {
        require(newPair != address(0), "New pair address cannot be zero");
        uniswapPair = newPair;
        emit UniswapPairUpdated(newPair);
    }

    function updateTaxes(uint256 _buyTax, uint256 _sellTax) external onlyOwner {
        require(_buyTax <= 15 && _sellTax <= 20, "Tax too high");
        buyTax = _buyTax;
        sellTax = _sellTax;
        emit TaxesUpdated(_buyTax, _sellTax);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {}
}
