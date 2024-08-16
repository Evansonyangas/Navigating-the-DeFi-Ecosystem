# DeFi Interaction Script

## Overview

This script is designed to demonstrate the integration and composability of various decentralized finance (DeFi) protocols, specifically Uniswap and Aave. The script performs the following operations:

1. **Token Swap on Uniswap**: 
   - The user initiates a token swap by approving the Uniswap Router to spend a specific amount of USDC on their behalf.
   - The script retrieves the necessary pool information from the Uniswap Factory contract.
   - The Swap Router then executes the swap, converting USDC to LINK.

2. **Supplying Tokens to Aave**:
   - Once the swap is completed, the script approves Aave to spend the swapped LINK tokens.
   - The LINK tokens are then supplied to the Aave lending pool, enabling the user to start earning interest on their LINK holdings.

3. **Retrieving Supply Details**:
   - The script retrieves information about the user's lending position on Aave, including the supplied amount and any accrued interest.

This workflow showcases how users can not only swap tokens using a decentralized exchange like Uniswap but also put their assets to work by earning additional yields on lending platforms such as Aave.

## Diagram Illustration

Below is a diagram illustrating the sequence of steps and interactions between the protocols:

![Workflow Diagram](workflow.png)

