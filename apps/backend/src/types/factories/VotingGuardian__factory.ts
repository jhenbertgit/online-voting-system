/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../common";
import type {
  VotingGuardian,
  VotingGuardianInterface,
} from "../VotingGuardian";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessControlBadConfirmation",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "neededRole",
        type: "bytes32",
      },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "ElectionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "voterCommitment",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "candidateHash",
        type: "bytes32",
      },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    inputs: [],
    name: "ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "idHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "positionId",
        type: "uint256",
      },
    ],
    name: "addCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "bytes32",
        name: "idHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "positionId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "voterCommitment",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "candidateHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32[]",
        name: "merkleProof",
        type: "bytes32[]",
      },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "merkleRoot",
        type: "bytes32",
      },
    ],
    name: "createElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "elections",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "merkleRoot",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "callerConfirmation",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "spentCommitments",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001c60003361004d565b506100477fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c217753361004d565b506100f9565b6000828152602081815260408083206001600160a01b038516845290915281205460ff166100ef576000838152602081815260408083206001600160a01b03861684529091529020805460ff191660011790556100a73390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45060016100f3565b5060005b92915050565b610f3e806101086000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806375b238fc1161008c57806391d148541161006657806391d1485414610242578063a217fddf14610255578063bd7cab9c1461025d578063d547741f1461028b57600080fd5b806375b238fc146101f5578063789175b21461021c578063840e12f51461022f57600080fd5b8063248a9ca3116100c8578063248a9ca31461017a5780632f2ff15d146101ab57806336568abe146101be5780635e6fef01146101d157600080fd5b806301ffc9a7146100ef57806317386b87146101175780631a0478d51461012c575b600080fd5b6101026100fd366004610af7565b61029e565b60405190151581526020015b60405180910390f35b61012a610125366004610b21565b6102d5565b005b61015d61013a366004610bb1565b600260208190526000918252604090912080546001820154919092015460ff1683565b60408051938452602084019290925215159082015260600161010e565b61019d610188366004610bb1565b60009081526020819052604090206001015490565b60405190815260200161010e565b61012a6101b9366004610bca565b61056a565b61012a6101cc366004610bca565b610595565b6101e46101df366004610bb1565b6105cd565b60405161010e959493929190610c06565b61019d7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c2177581565b61012a61022a366004610c78565b610687565b61012a61023d366004610d0b565b6107ff565b610102610250366004610bca565b6108cd565b61019d600081565b61010261026b366004610d0b565b600360209081526000928352604080842090915290825290205460ff1681565b61012a610299366004610bca565b6108f6565b60006001600160e01b03198216637965db0b60e01b14806102cf57506301ffc9a760e01b6001600160e01b03198316145b92915050565b6000858152600160205260409020600481015486919060ff166103325760405162461bcd60e51b815260206004820152601060248201526f24b73b30b634b21032b632b1ba34b7b760811b60448201526064015b60405180910390fd5b80600101544210156103745760405162461bcd60e51b815260206004820152600b60248201526a139bdd081cdd185c9d195960aa1b6044820152606401610329565b80600201544211156103b05760405162461bcd60e51b8152602060048201526005602482015264115b99195960da1b6044820152606401610329565b60008781526001602090815260408083208884526002928390529220015460ff166104115760405162461bcd60e51b8152602060048201526011602482015270496e76616c69642063616e64696461746560781b6044820152606401610329565b60008881526003602090815260408083208a845290915290205460ff161561046b5760405162461bcd60e51b815260206004820152600d60248201526c105b1c9958591e481d9bdd1959609a1b6044820152606401610329565b6104cd858580806020026020016040519081016040528093929190818152602001838360200280828437600092019190915250505050600383015460408051602081018c9052016040516020818303038152906040528051906020012061091b565b6105115760405162461bcd60e51b81526020600482015260156024820152742737ba1030b71032b634b3b4b13632903b37ba32b960591b6044820152606401610329565b60008881526003602090815260408083208a8452909152808220805460ff1916600117905551879189918b917f2e82bdc8daf342458c2dc7bf51c3aefd294a3f9d8389e73e35937693b793882e91a45050505050505050565b60008281526020819052604090206001015461058581610931565b61058f838361093e565b50505050565b6001600160a01b03811633146105be5760405163334bd91960e11b815260040160405180910390fd5b6105c882826109d0565b505050565b6001602052600090815260409020805481906105e890610d2d565b80601f016020809104026020016040519081016040528092919081815260200182805461061490610d2d565b80156106615780601f1061063657610100808354040283529160200191610661565b820191906000526020600020905b81548152906001019060200180831161064457829003601f168201915b505050506001830154600284015460038501546004909501549394919390925060ff1685565b7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c217756106b181610931565b60008781526001602052604090206004015460ff16156107055760405162461bcd60e51b815260206004820152600f60248201526e456c656374696f6e2065786973747360881b6044820152606401610329565b6040518060a0016040528087878080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201829052509385525050506020808301889052604080840188905260608401879052600160809094018490528b8352929052208151819061077e9082610dcb565b50602082015160018201556040808301516002830155606083015160038301556080909201516004909101805460ff19169115159190911790555187907fe7a0aae5d733e07e246dea86213a1ac1b0aa8554bde889bb75c12752f44e53d9906107ee908990899089908990610e8b565b60405180910390a250505050505050565b7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c2177561082981610931565b6000838152600260208190526040909120015460ff161561087f5760405162461bcd60e51b815260206004820152601060248201526f43616e6469646174652065786973747360801b6044820152606401610329565b50604080516060810182528381526020808201938452600182840181815260009687526002928390529390952091518255925193810193909355519101805460ff1916911515919091179055565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b60008281526020819052604090206001015461091181610931565b61058f83836109d0565b6000826109288584610a3b565b14949350505050565b61093b8133610a88565b50565b600061094a83836108cd565b6109c8576000838152602081815260408083206001600160a01b03861684529091529020805460ff191660011790556109803390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45060016102cf565b5060006102cf565b60006109dc83836108cd565b156109c8576000838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45060016102cf565b600081815b8451811015610a8057610a6c82868381518110610a5f57610a5f610ecb565b6020026020010151610ac5565b915080610a7881610ee1565b915050610a40565b509392505050565b610a9282826108cd565b610ac15760405163e2517d3f60e01b81526001600160a01b038216600482015260248101839052604401610329565b5050565b6000818310610ae1576000828152602084905260409020610af0565b60008381526020839052604090205b9392505050565b600060208284031215610b0957600080fd5b81356001600160e01b031981168114610af057600080fd5b600080600080600060808688031215610b3957600080fd5b853594506020860135935060408601359250606086013567ffffffffffffffff80821115610b6657600080fd5b818801915088601f830112610b7a57600080fd5b813581811115610b8957600080fd5b8960208260051b8501011115610b9e57600080fd5b9699959850939650602001949392505050565b600060208284031215610bc357600080fd5b5035919050565b60008060408385031215610bdd57600080fd5b8235915060208301356001600160a01b0381168114610bfb57600080fd5b809150509250929050565b60a08152600086518060a084015260005b81811015610c34576020818a0181015160c0868401015201610c17565b50600060c0828501015260c0601f19601f830116840101915050856020830152846040830152836060830152610c6e608083018415159052565b9695505050505050565b60008060008060008060a08789031215610c9157600080fd5b86359550602087013567ffffffffffffffff80821115610cb057600080fd5b818901915089601f830112610cc457600080fd5b813581811115610cd357600080fd5b8a6020828501011115610ce557600080fd5b979a60209290920199509697604081013597506060810135965060800135945092505050565b60008060408385031215610d1e57600080fd5b50508035926020909101359150565b600181811c90821680610d4157607f821691505b602082108103610d6157634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b601f8211156105c857600081815260208120601f850160051c81016020861015610da45750805b601f850160051c820191505b81811015610dc357828155600101610db0565b505050505050565b815167ffffffffffffffff811115610de557610de5610d67565b610df981610df38454610d2d565b84610d7d565b602080601f831160018114610e2e5760008415610e165750858301515b600019600386901b1c1916600185901b178555610dc3565b600085815260208120601f198616915b82811015610e5d57888601518255948401946001909101908401610e3e565b5085821015610e7b5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b606081528360608201528385608083013760006080858301015260006080601f19601f870116830101905083602083015282604083015295945050505050565b634e487b7160e01b600052603260045260246000fd5b600060018201610f0157634e487b7160e01b600052601160045260246000fd5b506001019056fea26469706673582212207017862b5d3876d36b1ce5c62ebdda7da6241da59a0046909f0b422f77331f4464736f6c63430008140033";

type VotingGuardianConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VotingGuardianConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VotingGuardian__factory extends ContractFactory {
  constructor(...args: VotingGuardianConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      VotingGuardian & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): VotingGuardian__factory {
    return super.connect(runner) as VotingGuardian__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VotingGuardianInterface {
    return new Interface(_abi) as VotingGuardianInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): VotingGuardian {
    return new Contract(address, _abi, runner) as unknown as VotingGuardian;
  }
}
