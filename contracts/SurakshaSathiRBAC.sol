// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SurakshaSathiRBAC & Decentralized Asset Vault
 * @notice Role-Based Access Control and NFT Asset Management for "सुरक्षा साथी"
 * @dev Implements 4 distinct roles:
 *      1. DEFAULT_ADMIN_ROLE (Bootstrap Admin: Deep123 / deepsingh02414@gmail.com)
 *      2. AUDITOR_ROLE (Oversees Verification Officers, manages escalations)
 *      3. VERIFICATION_OFFICER_ROLE (Reviews AI tamper flags, approves/rejects)
 *      4. USER_ROLE (Citizens / Viewers, personal vault, AI tamper scan)
 *
 * STRICT SECURITY INVARIANT:
 * - Public self-registration is RESTRICTED ONLY to standard USER_ROLE.
 * - AUDITOR_ROLE can ONLY be granted by DEFAULT_ADMIN_ROLE.
 * - VERIFICATION_OFFICER_ROLE can ONLY be granted by AUDITOR_ROLE or DEFAULT_ADMIN_ROLE.
 */

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract SurakshaSathiRBAC {
    // -------------------------------------------------------------
    // CONSTANTS & ROLE DEFINITIONS (keccak256 hashes)
    // -------------------------------------------------------------
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant VERIFICATION_OFFICER_ROLE = keccak256("VERIFICATION_OFFICER_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    string public constant SYSTEM_NAME = unicode"सुरक्षा साथी (Suraksha Sathi)";
    string public constant VERSION = "2.4.0";

    // -------------------------------------------------------------
    // STATE VARIABLES
    // -------------------------------------------------------------
    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(bytes32 => bytes32) private _roleAdmin;

    // DID to Wallet Address registry
    mapping(string => address) public didToWallet;
    mapping(address => string) public walletToDid;

    // NFT Asset Vault Record
    struct VaultAssetRecord {
        uint256 tokenId;
        string didOwner;
        string assetType;     // "FD_BOND", "CERTIFICATE", "CRYPTO_WALLET", "IDENTITY_DOC"
        bytes32 documentHash; // SHA-256 / keccak256 of encrypted original doc
        string metadataURI;   // IPFS / Encrypted Vault URI
        uint256 mintedAt;
        bool isRevoked;
    }

    uint256 private _nextTokenId = 1001;
    mapping(uint256 => VaultAssetRecord) public vaultAssets;
    mapping(bytes32 => uint256) public docHashToTokenId;

    // Tamper Verdict Log
    struct TamperVerdict {
        bytes32 docHash;
        uint8 tamperIndex;     // 0-100%
        address reviewerOfficer;
        bool isApproved;
        string notes;
        uint256 verifiedAt;
    }
    mapping(bytes32 => TamperVerdict) public tamperVerdicts;

    // -------------------------------------------------------------
    // EVENTS
    // -------------------------------------------------------------
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event DidLinked(string indexed did, address indexed wallet);
    event AssetNFTMinted(uint256 indexed tokenId, string didOwner, bytes32 docHash, string assetType);
    event TamperVerdictAnchored(bytes32 indexed docHash, uint8 tamperIndex, bool isApproved, address officer);

    // -------------------------------------------------------------
    // MODIFIERS
    // -------------------------------------------------------------
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "SurakshaSathi: Access Denied - Caller lacks required role");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "SurakshaSathi: Restricted to System Administrator");
        _;
    }

    modifier onlyAuditorOrAdmin() {
        require(
            hasRole(AUDITOR_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "SurakshaSathi: Restricted to Auditor or Admin"
        );
        _;
    }

    modifier onlyOfficer() {
        require(
            hasRole(VERIFICATION_OFFICER_ROLE, msg.sender),
            "SurakshaSathi: Restricted to Verification Officer"
        );
        _;
    }

    // -------------------------------------------------------------
    // CONSTRUCTOR (Bootstraps Primary Admin)
    // -------------------------------------------------------------
    constructor(address initialAdmin, string memory adminDid) {
        require(initialAdmin != address(0), "Invalid admin address");
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _setRoleAdmin(AUDITOR_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(VERIFICATION_OFFICER_ROLE, AUDITOR_ROLE);
        _setRoleAdmin(USER_ROLE, DEFAULT_ADMIN_ROLE);

        if (bytes(adminDid).length > 0) {
            didToWallet[adminDid] = initialAdmin;
            walletToDid[initialAdmin] = adminDid;
        }
    }

    // -------------------------------------------------------------
    // RBAC MANAGEMENT
    // -------------------------------------------------------------
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    function _grantRole(bytes32 role, address account) internal {
        if (!_roles[role][account]) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function _revokeRole(bytes32 role, address account) internal {
        if (_roles[role][account]) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal {
        _roleAdmin[role] = adminRole;
    }

    /**
     * @notice Admin creates an Auditor on-chain
     */
    function grantAuditorRole(address auditorAccount, string memory auditorDid) external onlyAdmin {
        require(auditorAccount != address(0), "Invalid auditor address");
        _grantRole(AUDITOR_ROLE, auditorAccount);
        if (bytes(auditorDid).length > 0) {
            didToWallet[auditorDid] = auditorAccount;
            walletToDid[auditorAccount] = auditorDid;
            emit DidLinked(auditorDid, auditorAccount);
        }
    }

    /**
     * @notice Auditor provisions a Verification Officer
     */
    function grantOfficerRole(address officerAccount, string memory officerDid) external onlyAuditorOrAdmin {
        require(officerAccount != address(0), "Invalid officer address");
        _grantRole(VERIFICATION_OFFICER_ROLE, officerAccount);
        if (bytes(officerDid).length > 0) {
            didToWallet[officerDid] = officerAccount;
            walletToDid[officerAccount] = officerDid;
            emit DidLinked(officerDid, officerAccount);
        }
    }

    /**
     * @notice Public registration function: STRICTLY grants USER_ROLE only
     * Prevents privilege escalation by disallowing unauthorized assignment of Officer/Auditor/Admin.
     */
    function registerPublicUser(string memory userDid) external {
        require(bytes(userDid).length > 0, "DID required");
        require(!hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Admin cannot demote to User");
        _grantRole(USER_ROLE, msg.sender);
        didToWallet[userDid] = msg.sender;
        walletToDid[msg.sender] = userDid;
        emit DidLinked(userDid, msg.sender);
    }

    // -------------------------------------------------------------
    // VAULT ASSET NFT MINTING (ERC-721 / ERC-1155 Compatible)
    // -------------------------------------------------------------
    function mintAssetNFT(
        string memory didOwner,
        string memory assetType,
        bytes32 docHash,
        string memory metadataURI
    ) external returns (uint256) {
        // Can be minted by authorized issuers, admins, or verified owners
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
            hasRole(VERIFICATION_OFFICER_ROLE, msg.sender) ||
            hasRole(USER_ROLE, msg.sender),
            "Unauthorized minting attempt"
        );
        require(docHashToTokenId[docHash] == 0, "Document already anchored to token");

        uint256 tokenId = _nextTokenId++;
        vaultAssets[tokenId] = VaultAssetRecord({
            tokenId: tokenId,
            didOwner: didOwner,
            assetType: assetType,
            documentHash: docHash,
            metadataURI: metadataURI,
            mintedAt: block.timestamp,
            isRevoked: false
        });

        docHashToTokenId[docHash] = tokenId;

        emit AssetNFTMinted(tokenId, didOwner, docHash, assetType);
        return tokenId;
    }

    // -------------------------------------------------------------
    // TAMPER VERDICT ANCHORING
    // -------------------------------------------------------------
    function anchorTamperVerdict(
        bytes32 docHash,
        uint8 tamperIndex,
        bool isApproved,
        string memory notes
    ) external onlyOfficer {
        tamperVerdicts[docHash] = TamperVerdict({
            docHash: docHash,
            tamperIndex: tamperIndex,
            reviewerOfficer: msg.sender,
            isApproved: isApproved,
            notes: notes,
            verifiedAt: block.timestamp
        });

        emit TamperVerdictAnchored(docHash, tamperIndex, isApproved, msg.sender);
    }
}
