const express = require("express");
const multer = require("multer");
const { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } = require("@azure/storage-blob");
const { TableClient } = require("@azure/data-tables");
require("dotenv").config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
    process.env.CONTAINER_NAME
);

const tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    process.env.TABLE_NAME
);

// Extract account name and key from connection string
function getAccountCredentials() {
    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const accountNameMatch = connStr.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connStr.match(/AccountKey=([^;]+)/);
    
    if (!accountNameMatch || !accountKeyMatch) {
        throw new Error("Invalid connection string");
    }
    
    return {
        accountName: accountNameMatch[1],
        accountKey: accountKeyMatch[1]
    };
}

// Generate SAS URL for blob
function generateSasUrl(blobName) {
    const { accountName, accountKey } = getAccountCredentials();
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    
    const sasOptions = {
        containerName: process.env.CONTAINER_NAME,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("r"), // read permission
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000 * 24), // 24 hours
    };

    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
    ).toString();

    return `https://${accountName}.blob.core.windows.net/${process.env.CONTAINER_NAME}/${blobName}?${sasToken}`;
}

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const blobName = Date.now() + "-" + req.file.originalname;
        const blobClient = containerClient.getBlockBlobClient(blobName);

        await blobClient.uploadData(req.file.buffer);

        const sasUrl = generateSasUrl(blobName);

        await tableClient.createEntity({
            partitionKey: req.body.course || "Uncategorized",
            rowKey: blobName,
            filename: req.file.originalname,
            uploader: req.user.username,
            blobName: blobName,
            uploadedAt: new Date().toISOString(),
        });

        res.send("Upload berhasil!");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// List file - hanya tampilkan file milik user yang login
router.get("/list", async (req, res) => {
    const result = [];
    const currentUser = req.user.username; // ambil username dari token
    
    for await (const entity of tableClient.listEntities()) {
        // Filter: hanya tampilkan file yang di-upload oleh user ini
        if (entity.uploader === currentUser) {
            // Generate fresh SAS URL for each file
            const blobName = entity.blobName || entity.rowKey;
            const sasUrl = generateSasUrl(blobName);
            result.push({
                ...entity,
                url: sasUrl
            });
        }
    }
    res.json(result);
});

// Download file with SAS token
router.get("/download/:blobName", async (req, res) => {
    try {
        const blobName = req.params.blobName;
        const sasUrl = generateSasUrl(blobName);
        res.json({ url: sasUrl });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete file - hanya bisa hapus file milik sendiri
router.delete("/delete/:blobName", async (req, res) => {
    try {
        const blobName = req.params.blobName;
        const currentUser = req.user.username;
        
        // Cek apakah file milik user ini
        let isOwner = false;
        let entityToDelete = null;
        
        const entities = tableClient.listEntities();
        for await (const entity of entities) {
            if (entity.blobName === blobName || entity.rowKey === blobName) {
                if (entity.uploader === currentUser) {
                    isOwner = true;
                    entityToDelete = entity;
                    break;
                }
            }
        }
        
        if (!isOwner) {
            return res.status(403).json({ message: "Anda tidak memiliki izin untuk menghapus file ini" });
        }
        
        // Delete from Blob Storage
        const blobClient = containerClient.getBlockBlobClient(blobName);
        await blobClient.delete();
        
        // Delete from Table Storage
        if (entityToDelete) {
            await tableClient.deleteEntity(entityToDelete.partitionKey, entityToDelete.rowKey);
        }
        
        res.json({ message: "File berhasil dihapus!" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
