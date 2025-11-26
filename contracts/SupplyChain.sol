// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SupplyChain
 * @author SupplyChain Provenance Team
 * @notice A tamper-evident supply chain provenance system on Ethereum
 * @dev Implements role-based access control, pausable functionality, and comprehensive event logging
 */
contract SupplyChain is AccessControl, Pausable, ReentrancyGuard {
    // ============ Role Definitions ============
    bytes32 public constant MANUFACTURER = keccak256("MANUFACTURER");
    bytes32 public constant LOGISTICS = keccak256("LOGISTICS");
    bytes32 public constant RETAILER = keccak256("RETAILER");
    bytes32 public constant AUDITOR = keccak256("AUDITOR");

    // ============ Structs ============
    /**
     * @notice Product struct containing product information
     * @param id Unique identifier for the product
     * @param metaURI IPFS URI pointing to product metadata JSON
     * @param manufacturer Address of the manufacturer who created the product
     * @param createdAt Timestamp when product was created
     * @param exists Flag indicating if the product exists
     */
    struct Product {
        uint256 id;
        string metaURI;
        address manufacturer;
        uint256 createdAt;
        bool exists;
    }

    /**
     * @notice Batch struct containing batch information
     * @param id Unique identifier for the batch
     * @param productId Reference to the product this batch belongs to
     * @param quantity Number of items in the batch
     * @param manufactureDate Unix timestamp of manufacture date
     * @param metaURI IPFS URI pointing to batch metadata JSON
     * @param currentOwner Current owner/custodian of the batch
     * @param recalled Flag indicating if the batch has been recalled
     * @param recallReason Reason for recall if recalled
     * @param createdAt Timestamp when batch was created
     * @param exists Flag indicating if the batch exists
     */
    struct Batch {
        uint256 id;
        uint256 productId;
        uint256 quantity;
        uint256 manufactureDate;
        string metaURI;
        address currentOwner;
        bool recalled;
        string recallReason;
        uint256 createdAt;
        bool exists;
    }

    /**
     * @notice Transfer record for tracking custody changes
     * @param batchId Reference to the batch
     * @param from Previous owner
     * @param to New owner
     * @param location Location during transfer
     * @param offchainProof Hash or CID of off-chain proof document
     * @param timestamp When the transfer occurred
     */
    struct TransferRecord {
        uint256 batchId;
        address from;
        address to;
        string location;
        string offchainProof;
        uint256 timestamp;
    }

    /**
     * @notice Document record for attached documents
     * @param batchId Reference to the batch
     * @param ipfsCID IPFS CID of the document
     * @param documentType Type of document (certificate, inspection, etc.)
     * @param attachedBy Who attached the document
     * @param timestamp When the document was attached
     */
    struct DocumentRecord {
        uint256 batchId;
        string ipfsCID;
        string documentType;
        address attachedBy;
        uint256 timestamp;
    }

    /**
     * @notice Sensor data anchoring record
     * @param batchId Reference to the batch
     * @param dataHash Hash of the sensor data
     * @param sensorType Type of sensor (temperature, humidity, etc.)
     * @param timestamp When the data was recorded
     */
    struct SensorRecord {
        uint256 batchId;
        bytes32 dataHash;
        string sensorType;
        uint256 timestamp;
    }

    // ============ State Variables ============
    mapping(uint256 => Product) public products;
    mapping(uint256 => Batch) public batches;
    
    // Track all product and batch IDs for enumeration
    uint256[] public productIds;
    uint256[] public batchIds;
    
    // Track batches by owner
    mapping(address => uint256[]) public ownerBatches;
    
    // Track transfer history per batch
    mapping(uint256 => TransferRecord[]) public batchTransfers;
    
    // Track documents per batch
    mapping(uint256 => DocumentRecord[]) public batchDocuments;
    
    // Track sensor records per batch
    mapping(uint256 => SensorRecord[]) public batchSensorRecords;

    // Counters for statistics
    uint256 public totalProducts;
    uint256 public totalBatches;
    uint256 public totalTransfers;
    uint256 public totalDocuments;

    // ============ Events ============
    /**
     * @notice Emitted when a new product is created
     * @param productId Unique identifier of the product
     * @param manufacturer Address of the manufacturer
     * @param metaURI IPFS URI of product metadata
     * @param timestamp Block timestamp when created
     */
    event ProductCreated(
        uint256 indexed productId,
        address indexed manufacturer,
        string metaURI,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a new batch is created
     * @param batchId Unique identifier of the batch
     * @param productId Reference to the product
     * @param owner Initial owner (manufacturer)
     * @param quantity Number of items
     * @param metaURI IPFS URI of batch metadata
     * @param timestamp Block timestamp when created
     */
    event BatchCreated(
        uint256 indexed batchId,
        uint256 indexed productId,
        address indexed owner,
        uint256 quantity,
        string metaURI,
        uint256 timestamp
    );

    /**
     * @notice Emitted when batch custody is transferred
     * @param batchId Reference to the batch
     * @param from Previous owner
     * @param to New owner
     * @param location Location during transfer
     * @param offchainProof Off-chain proof document CID/hash
     * @param timestamp Block timestamp of transfer
     */
    event BatchTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        string location,
        string offchainProof,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a document is attached to a batch
     * @param batchId Reference to the batch
     * @param ipfsCID IPFS CID of the document
     * @param documentType Type of document
     * @param attachedBy Who attached the document
     * @param timestamp Block timestamp when attached
     */
    event DocumentAttached(
        uint256 indexed batchId,
        string ipfsCID,
        string documentType,
        address indexed attachedBy,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a batch is recalled
     * @param batchId Reference to the batch
     * @param reason Reason for the recall
     * @param recalledBy Who initiated the recall
     * @param timestamp Block timestamp of recall
     */
    event BatchRecalled(
        uint256 indexed batchId,
        string reason,
        address indexed recalledBy,
        uint256 timestamp
    );

    /**
     * @notice Emitted when sensor data is anchored
     * @param batchId Reference to the batch
     * @param dataHash Hash of the sensor data
     * @param sensorType Type of sensor
     * @param timestamp Block timestamp when anchored
     */
    event SensorDataAnchored(
        uint256 indexed batchId,
        bytes32 dataHash,
        string sensorType,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a role is assigned to an address
     * @param role The role identifier
     * @param account The account receiving the role
     * @param grantedBy Who granted the role
     * @param timestamp Block timestamp
     */
    event RoleAssigned(
        bytes32 indexed role,
        address indexed account,
        address indexed grantedBy,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a role is revoked from an address
     * @param role The role identifier
     * @param account The account losing the role
     * @param revokedBy Who revoked the role
     * @param timestamp Block timestamp
     */
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed revokedBy,
        uint256 timestamp
    );

    // ============ Errors ============
    error ProductAlreadyExists(uint256 productId);
    error ProductDoesNotExist(uint256 productId);
    error BatchAlreadyExists(uint256 batchId);
    error BatchDoesNotExist(uint256 batchId);
    error NotBatchOwner(uint256 batchId, address caller);
    error BatchIsRecalled(uint256 batchId);
    error InvalidAddress();
    error InvalidQuantity();
    error EmptyMetaURI();

    // ============ Constructor ============
    /**
     * @notice Initializes the contract with admin roles
     * @param admin Address to receive admin and initial manufacturer role
     */
    constructor(address admin) {
        if (admin == address(0)) revert InvalidAddress();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANUFACTURER, admin);
        _grantRole(AUDITOR, admin);
    }

    // ============ Product Functions ============
    /**
     * @notice Creates a new product
     * @param _id Unique identifier for the product
     * @param _metaURI IPFS URI pointing to product metadata
     */
    function createProduct(
        uint256 _id,
        string calldata _metaURI
    ) external onlyRole(MANUFACTURER) whenNotPaused {
        if (products[_id].exists) revert ProductAlreadyExists(_id);
        if (bytes(_metaURI).length == 0) revert EmptyMetaURI();

        products[_id] = Product({
            id: _id,
            metaURI: _metaURI,
            manufacturer: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        productIds.push(_id);
        totalProducts++;

        emit ProductCreated(_id, msg.sender, _metaURI, block.timestamp);
    }

    /**
     * @notice Gets product details
     * @param _productId Product identifier
     * @return Product struct
     */
    function getProduct(uint256 _productId) external view returns (Product memory) {
        if (!products[_productId].exists) revert ProductDoesNotExist(_productId);
        return products[_productId];
    }

    /**
     * @notice Gets all product IDs
     * @return Array of product IDs
     */
    function getAllProductIds() external view returns (uint256[] memory) {
        return productIds;
    }

    // ============ Batch Functions ============
    /**
     * @notice Creates a new batch for a product
     * @param _batchId Unique identifier for the batch
     * @param _productId Product this batch belongs to
     * @param _quantity Number of items in the batch
     * @param _manufactureDate Unix timestamp of manufacture
     * @param _metaURI IPFS URI pointing to batch metadata
     */
    function createBatch(
        uint256 _batchId,
        uint256 _productId,
        uint256 _quantity,
        uint256 _manufactureDate,
        string calldata _metaURI
    ) external onlyRole(MANUFACTURER) whenNotPaused {
        if (!products[_productId].exists) revert ProductDoesNotExist(_productId);
        if (batches[_batchId].exists) revert BatchAlreadyExists(_batchId);
        if (_quantity == 0) revert InvalidQuantity();
        if (bytes(_metaURI).length == 0) revert EmptyMetaURI();

        batches[_batchId] = Batch({
            id: _batchId,
            productId: _productId,
            quantity: _quantity,
            manufactureDate: _manufactureDate,
            metaURI: _metaURI,
            currentOwner: msg.sender,
            recalled: false,
            recallReason: "",
            createdAt: block.timestamp,
            exists: true
        });

        batchIds.push(_batchId);
        ownerBatches[msg.sender].push(_batchId);
        totalBatches++;

        emit BatchCreated(
            _batchId,
            _productId,
            msg.sender,
            _quantity,
            _metaURI,
            block.timestamp
        );
    }

    /**
     * @notice Transfers batch custody to a new owner
     * @param _batchId Batch to transfer
     * @param _to New owner address
     * @param _location Current location during transfer
     * @param _offchainProof Off-chain proof document CID/hash
     */
    function transferBatch(
        uint256 _batchId,
        address _to,
        string calldata _location,
        string calldata _offchainProof
    ) external whenNotPaused nonReentrant {
        if (!batches[_batchId].exists) revert BatchDoesNotExist(_batchId);
        if (_to == address(0)) revert InvalidAddress();
        
        Batch storage batch = batches[_batchId];
        if (batch.currentOwner != msg.sender) revert NotBatchOwner(_batchId, msg.sender);
        if (batch.recalled) revert BatchIsRecalled(_batchId);

        address from = batch.currentOwner;
        batch.currentOwner = _to;

        // Record transfer
        batchTransfers[_batchId].push(TransferRecord({
            batchId: _batchId,
            from: from,
            to: _to,
            location: _location,
            offchainProof: _offchainProof,
            timestamp: block.timestamp
        }));

        ownerBatches[_to].push(_batchId);
        totalTransfers++;

        emit BatchTransferred(
            _batchId,
            from,
            _to,
            _location,
            _offchainProof,
            block.timestamp
        );
    }

    /**
     * @notice Attaches a document to a batch
     * @param _batchId Batch to attach document to
     * @param _ipfsCID IPFS CID of the document
     * @param _documentType Type of document
     */
    function attachDocument(
        uint256 _batchId,
        string calldata _ipfsCID,
        string calldata _documentType
    ) external whenNotPaused {
        if (!batches[_batchId].exists) revert BatchDoesNotExist(_batchId);
        
        // Only manufacturer, current owner, or auditor can attach documents
        Batch storage batch = batches[_batchId];
        require(
            hasRole(MANUFACTURER, msg.sender) ||
            batch.currentOwner == msg.sender ||
            hasRole(AUDITOR, msg.sender),
            "Not authorized to attach documents"
        );

        batchDocuments[_batchId].push(DocumentRecord({
            batchId: _batchId,
            ipfsCID: _ipfsCID,
            documentType: _documentType,
            attachedBy: msg.sender,
            timestamp: block.timestamp
        }));

        totalDocuments++;

        emit DocumentAttached(
            _batchId,
            _ipfsCID,
            _documentType,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Anchors sensor data hash to a batch
     * @param _batchId Batch to anchor data to
     * @param _dataHash Hash of the sensor data
     * @param _sensorType Type of sensor
     */
    function anchorSensorData(
        uint256 _batchId,
        bytes32 _dataHash,
        string calldata _sensorType
    ) external whenNotPaused {
        if (!batches[_batchId].exists) revert BatchDoesNotExist(_batchId);
        
        Batch storage batch = batches[_batchId];
        require(
            batch.currentOwner == msg.sender ||
            hasRole(MANUFACTURER, msg.sender) ||
            hasRole(LOGISTICS, msg.sender),
            "Not authorized to anchor sensor data"
        );

        batchSensorRecords[_batchId].push(SensorRecord({
            batchId: _batchId,
            dataHash: _dataHash,
            sensorType: _sensorType,
            timestamp: block.timestamp
        }));

        emit SensorDataAnchored(_batchId, _dataHash, _sensorType, block.timestamp);
    }

    /**
     * @notice Recalls a batch (auditor only)
     * @param _batchId Batch to recall
     * @param _reason Reason for the recall
     */
    function recallBatch(
        uint256 _batchId,
        string calldata _reason
    ) external onlyRole(AUDITOR) whenNotPaused {
        if (!batches[_batchId].exists) revert BatchDoesNotExist(_batchId);

        Batch storage batch = batches[_batchId];
        batch.recalled = true;
        batch.recallReason = _reason;

        emit BatchRecalled(_batchId, _reason, msg.sender, block.timestamp);
    }

    /**
     * @notice Gets batch details
     * @param _batchId Batch identifier
     * @return Batch struct
     */
    function getBatch(uint256 _batchId) external view returns (Batch memory) {
        if (!batches[_batchId].exists) revert BatchDoesNotExist(_batchId);
        return batches[_batchId];
    }

    /**
     * @notice Gets all batch IDs
     * @return Array of batch IDs
     */
    function getAllBatchIds() external view returns (uint256[] memory) {
        return batchIds;
    }

    /**
     * @notice Gets batches owned by an address
     * @param _owner Owner address
     * @return Array of batch IDs
     */
    function getBatchesByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerBatches[_owner];
    }

    /**
     * @notice Gets transfer history for a batch
     * @param _batchId Batch identifier
     * @return Array of transfer records
     */
    function getBatchTransfers(uint256 _batchId) external view returns (TransferRecord[] memory) {
        return batchTransfers[_batchId];
    }

    /**
     * @notice Gets documents attached to a batch
     * @param _batchId Batch identifier
     * @return Array of document records
     */
    function getBatchDocuments(uint256 _batchId) external view returns (DocumentRecord[] memory) {
        return batchDocuments[_batchId];
    }

    /**
     * @notice Gets sensor records for a batch
     * @param _batchId Batch identifier
     * @return Array of sensor records
     */
    function getBatchSensorRecords(uint256 _batchId) external view returns (SensorRecord[] memory) {
        return batchSensorRecords[_batchId];
    }

    // ============ Admin Functions ============
    /**
     * @notice Grants a role to an account with event emission
     * @param role Role to grant
     * @param account Account to receive the role
     */
    function assignRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert InvalidAddress();
        _grantRole(role, account);
        emit RoleAssigned(role, account, msg.sender, block.timestamp);
    }

    /**
     * @notice Revokes a role from an account with event emission
     * @param role Role to revoke
     * @param account Account to lose the role
     */
    function removeRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
        emit RoleRevoked(role, account, msg.sender, block.timestamp);
    }

    /**
     * @notice Pauses the contract (emergency stop)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ============ View Functions ============
    /**
     * @notice Checks if an address has a specific role
     * @param role Role to check
     * @param account Account to check
     * @return bool True if account has the role
     */
    function checkRole(bytes32 role, address account) external view returns (bool) {
        return hasRole(role, account);
    }

    /**
     * @notice Gets contract statistics
     * @return _totalProducts Total products created
     * @return _totalBatches Total batches created
     * @return _totalTransfers Total transfers made
     * @return _totalDocuments Total documents attached
     */
    function getStats() external view returns (
        uint256 _totalProducts,
        uint256 _totalBatches,
        uint256 _totalTransfers,
        uint256 _totalDocuments
    ) {
        return (totalProducts, totalBatches, totalTransfers, totalDocuments);
    }

    /**
     * @notice Verifies batch provenance (for public verification)
     * @param _batchId Batch to verify
     * @return batch Batch details
     * @return transfers Transfer history
     * @return documents Attached documents
     * @return product Associated product
     */
    function verifyProvenance(uint256 _batchId) external view returns (
        Batch memory batch,
        TransferRecord[] memory transfers,
        DocumentRecord[] memory documents,
        Product memory product
    ) {
        if (!batches[_batchId].exists) revert BatchDoesNotExist(_batchId);
        
        batch = batches[_batchId];
        transfers = batchTransfers[_batchId];
        documents = batchDocuments[_batchId];
        product = products[batch.productId];
        
        return (batch, transfers, documents, product);
    }
}
