const crypto = require('crypto');
const dotenv= require('dotenv');
dotenv.config();

class AESEncryption {
    constructor() {
        // 32 bytes = 256 bits for AES-256
        this.encryptionKey = Buffer.from(
            process.env.AES_ENCRYPTION_KEY,
            'hex'
        );
        console.log(this.encryptionKey);
        this.algorithm = 'aes-256-cbc';
    }

    generateIV() {
        return crypto.randomBytes(16); // 16 bytes for AES CBC mode
    }

    encryptPassword(password) {
        try {
            const iv = this.generateIV();
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
            let encrypted = cipher.update(password, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return {
                encrypted: encrypted,
                iv: iv.toString('hex')
            };
        } catch (error) {
            throw new Error('Encryption failed: ' + error.message);
        }
    }

  
    decryptPassword(encrypted, ivHex) {
        try {
            
            
            const iv = Buffer.from(ivHex, 'hex');
           
            const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
          
            return decrypted;
        } catch (error) {
           
            throw new Error('Decryption failed: ' + error.message);
        }
    }

    async hashPassword(password) {
        const { encrypted, iv } = this.encryptPassword(password);
        // Using format: iv:encrypted
        const hash = `${iv}:${encrypted}`;
        return {
            hash,
            iv,
            encrypted
        };
    }

    async verifyPassword(password, storedHash) {
        try {
            // Check if storedHash is already a JSON string or object
            let data;
            if (typeof storedHash === 'string') {
                try {
                    data = JSON.parse(storedHash);
                } catch (parseError) {
                    // If it's not JSON, it might be the old format (iv:encrypted)
                    const [iv, encrypted] = storedHash.split(':');
                    if (iv && encrypted) {
                        const decryptedPassword = this.decryptPassword(encrypted, iv);
                        return password === decryptedPassword;
                    }
                    throw new Error('Invalid hash format');
                }
            } else {
                data = storedHash;
            }
            
            const { encrypted, iv } = data;
            const decryptedPassword = this.decryptPassword(encrypted, iv);
            return password === decryptedPassword;
        } catch (error) {
            console.error('Password verification error:', error.message);
            return false;
        }
    }

}

module.exports = new AESEncryption();
