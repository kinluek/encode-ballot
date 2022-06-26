# encode-ballot

Encode Bootcamp: First Assignment

## Setup

1. Make sure you create a .env file with the real exported values as shown in .env.example.

2. Compile contracts with `yarn compile`

3. Run scripts - shortcuts can be found in package.json: `yarn <scriptName> args...`

```
"scripts": {
    "script:giveVotingRights": "ts-node --files ./scripts/Ballot/giveVotingRights.ts",
    "script:deployment": "ts-node --files ./scripts/Ballot/deployment.ts",
    "script:queryProposals": "ts-node --files ./scripts/Ballot/queryProposals.ts",
    "script:castVote": "ts-node --files ./scripts/Ballot/castVote.ts",
    "test": "hardhat test"
    "compile": "hardhat compile",
  }
```

Example:

```bash
# Deploy ballot contract with proposals [red, blue, green, orange]
$ yarn script:deployment red blue green orange

# Output:
Using address 0x563529285A26A05a94646CA01F5f9b61f292941D
Wallet balance 10.269613905356021
Deploying Ballot contract
Proposals:
Proposal N. 1: red
Proposal N. 2: blue
Proposal N. 3: green
Proposal N. 4: orange
Awaiting confirmations
Completed
Contract deployed at 0x16832E5e798042724c5381b509cbFF420772fC30

# Vote on a proposal
$ yarn script:castVote 0x16832E5e798042724c5381b509cbFF420772fC30 1

# Output
Using address 0x563529285A26A05a94646CA01F5f9b61f292941D
Wallet balance 10.267889421345673
Attaching ballot contract interface to address 0x16832E5e798042724c5381b509cbFF420772fC30
Cast a vote to proposal 1 for Wallet 0x563529285A26A05a94646CA01F5f9b61f292941D
Awaiting for confirmations
Transaction completed. TX Hash is : 0x5d04eefae4f7d9d5338850b421da816aee8ed572c22929530c4644ca76f8aa54

# Query on a proposal
$ yarn script:queryProposals 0x16832E5e798042724c5381b509cbFF420772fC30

# Output
Using address 0x563529285A26A05a94646CA01F5f9b61f292941D
Attaching ballot contract interface to address 0x16832E5e798042724c5381b509cbFF420772fC30
Proposal No. 1: red - Votes: 0
Proposal No. 2: blue - Votes: 1
Proposal No. 3: green - Votes: 0
Proposal No. 4: orange - Votes: 0

```

## Homework

- Read the references
- Finish covering other operations with scripts

## Weekend Project

- Structure scripts to
  - Deploy
  - Query proposals
  - Give vote right passing an address as input
  - Cast a vote to a ballot passing contract address and proposal as input and using the wallet in environment
  - Delegate my vote passing user address as input and using the wallet in environment
  - Query voting result and print to console
- Publish the project in Github
- Run the scripts with a set of proposals, cast and delegate votes and inspect results
- Write a report detailing the addresses, transaction hashes, description of the operation script being executed and console output from script execution for each step (Deployment, giving voting rights, casting/delegating and querying results).
- (Extra) Use TDD methodology

## Team Members (Discord)

- kinluek#8883
- e_l_l_a#9184
- 0xefrain#5498
- robtab.eth#0364
